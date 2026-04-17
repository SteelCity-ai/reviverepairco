import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { Octokit } from "@octokit/rest";
import { ReplitConnectors } from "@replit/connectors-sdk";
import ignore from "ignore";

const DEFAULT_OWNER = "SteelCity-ai";
const DEFAULT_REPO = "reviveroofrepair.com";
const DEFAULT_LOCAL_DIR = "artifacts/web";

const { values } = parseArgs({
  options: {
    owner: { type: "string", default: DEFAULT_OWNER },
    repo: { type: "string", default: DEFAULT_REPO },
    branch: { type: "string" },
    "base-branch": { type: "string" },
    message: { type: "string" },
    dir: { type: "string", default: DEFAULT_LOCAL_DIR },
    "dry-run": { type: "boolean", default: false },
    "force-delete": { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});

if (values.help) {
  console.log(`Sync local files to a GitHub repo via the Replit GitHub connection.

Usage: pnpm --filter @workspace/scripts sync-to-github [options]

Options:
  --owner <name>         GitHub owner       (default: ${DEFAULT_OWNER})
  --repo <name>          GitHub repo        (default: ${DEFAULT_REPO})
  --branch <name>        Target branch      (default: repo default branch)
  --base-branch <name>   Base branch to fork from if --branch does not exist
                         (default: repo default branch)
  --message <text>       Commit message     (default: auto-generated)
  --dir <path>           Local directory to sync (default: ${DEFAULT_LOCAL_DIR})
  --dry-run              Show what would change without pushing
  --force-delete         Allow deleting remote files that have no local
                         counterpart (required when remote has files outside
                         the synced directory)
  --help                 Show this help
`);
  process.exit(0);
}

const owner = values.owner!;
const repo = values.repo!;
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const localDir = path.isAbsolute(values.dir!)
  ? values.dir!
  : path.resolve(workspaceRoot, values.dir!);
const dryRun = values["dry-run"]!;

const connectors = new ReplitConnectors();
const octokit = new Octokit({ request: { fetch: connectors.createProxyFetch("github") } });

type LocalFile = { repoPath: string; absPath: string; sha: string; size: number };

function gitBlobSha(content: Buffer): string {
  const header = Buffer.from(`blob ${content.length}\0`);
  return createHash("sha1").update(Buffer.concat([header, content])).digest("hex");
}

async function loadIgnore(root: string) {
  const ig = ignore();
  ig.add([".git", "node_modules", ".next", ".turbo", ".vercel", "dist", "build", "out", "coverage"]);
  try {
    const gi = await readFile(path.join(root, ".gitignore"), "utf8");
    ig.add(gi);
  } catch {}
  return ig;
}

async function walk(root: string): Promise<LocalFile[]> {
  const ig = await loadIgnore(root);
  const out: LocalFile[] = [];

  async function visit(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs).split(path.sep).join("/");
      if (!rel) continue;
      const testRel = entry.isDirectory() ? `${rel}/` : rel;
      if (ig.ignores(testRel)) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        await visit(abs);
      } else if (entry.isFile()) {
        const buf = await readFile(abs);
        const st = await stat(abs);
        out.push({ repoPath: rel, absPath: abs, sha: gitBlobSha(buf), size: st.size });
      }
    }
  }

  await visit(root);
  return out;
}

async function getDefaultBranch(): Promise<string> {
  const { data } = await octokit.repos.get({ owner, repo });
  return data.default_branch;
}

function errorStatus(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
}

async function getBranchHead(branch: string): Promise<{ commitSha: string; treeSha: string } | null> {
  try {
    const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const commitSha = ref.object.sha;
    const { data: commit } = await octokit.git.getCommit({ owner, repo, commit_sha: commitSha });
    return { commitSha, treeSha: commit.tree.sha };
  } catch (err: unknown) {
    if (errorStatus(err) === 404) return null;
    throw err;
  }
}

async function getRemoteTree(treeSha: string): Promise<Map<string, string>> {
  const { data } = await octokit.git.getTree({ owner, repo, tree_sha: treeSha, recursive: "true" });
  const map = new Map<string, string>();
  for (const entry of data.tree) {
    if (entry.type === "blob" && entry.path && entry.sha) {
      map.set(entry.path, entry.sha);
    }
  }
  return map;
}

async function uploadBlob(file: LocalFile): Promise<string> {
  const buf = await readFile(file.absPath);
  const { data } = await octokit.git.createBlob({
    owner,
    repo,
    content: buf.toString("base64"),
    encoding: "base64",
  });
  return data.sha;
}

async function main() {
  console.log(`Repo:    ${owner}/${repo}`);
  console.log(`Source:  ${localDir}`);

  const defaultBranch = await getDefaultBranch();
  const branch = values.branch ?? defaultBranch;
  const baseBranch = values["base-branch"] ?? defaultBranch;
  console.log(`Branch:  ${branch}${branch === defaultBranch ? " (default)" : ""}`);

  console.log("Scanning local files...");
  const localFiles = await walk(localDir);
  console.log(`Found ${localFiles.length} local files.`);

  const head = await getBranchHead(branch);
  let parentCommitSha: string | null = head?.commitSha ?? null;
  let baseTreeSha: string | undefined;
  let remoteFiles = new Map<string, string>();

  if (head) {
    baseTreeSha = head.treeSha;
    remoteFiles = await getRemoteTree(head.treeSha);
  } else {
    console.log(`Branch ${branch} does not exist; will create from ${baseBranch}.`);
    const baseHead = await getBranchHead(baseBranch);
    if (!baseHead) {
      throw new Error(`Base branch ${baseBranch} not found.`);
    }
    parentCommitSha = baseHead.commitSha;
    baseTreeSha = baseHead.treeSha;
    remoteFiles = await getRemoteTree(baseHead.treeSha);
  }

  const localPaths = new Set(localFiles.map((f) => f.repoPath));
  const toUpload = localFiles.filter((f) => remoteFiles.get(f.repoPath) !== f.sha);
  const toDelete = [...remoteFiles.keys()].filter((p) => !localPaths.has(p));
  const unchanged = localFiles.length - toUpload.length;

  console.log(`  Unchanged: ${unchanged}`);
  console.log(`  Add/modify: ${toUpload.length}`);
  console.log(`  Delete:    ${toDelete.length}`);

  if (toUpload.length === 0 && toDelete.length === 0) {
    console.log("Nothing to sync. Working tree matches remote.");
    return;
  }

  const forceDelete = values["force-delete"]!;

  if (dryRun) {
    if (toUpload.length) console.log("\nWould upload:");
    for (const f of toUpload.slice(0, 50)) console.log(`  + ${f.repoPath}`);
    if (toUpload.length > 50) console.log(`  ...and ${toUpload.length - 50} more`);
    if (toDelete.length) console.log("\nWould delete:");
    for (const p of toDelete.slice(0, 50)) console.log(`  - ${p}`);
    if (toDelete.length > 50) console.log(`  ...and ${toDelete.length - 50} more`);
    if (toDelete.length > 0 && !forceDelete) {
      console.log("\nNote: Re-run without --dry-run AND with --force-delete to apply deletions.");
    }
    return;
  }

  if (toDelete.length > 0 && !forceDelete) {
    console.log("\nRefusing to delete remote files without --force-delete.");
    console.log("This sync mirrors the local directory to the repo root, so any");
    console.log("remote file not present locally would be removed. If the repo");
    console.log("contains files outside the synced directory (e.g. workflows,");
    console.log("docs, CI config), they would be deleted.");
    console.log("\nFiles that would be deleted:");
    for (const p of toDelete.slice(0, 50)) console.log(`  - ${p}`);
    if (toDelete.length > 50) console.log(`  ...and ${toDelete.length - 50} more`);
    console.log("\nRe-run with --dry-run to preview, or add --force-delete to proceed.");
    process.exit(1);
  }

  console.log("\nUploading blobs...");
  const uploadedShas = new Map<string, string>();
  let i = 0;
  for (const file of toUpload) {
    i++;
    process.stdout.write(`  [${i}/${toUpload.length}] ${file.repoPath}\n`);
    const sha = await uploadBlob(file);
    uploadedShas.set(file.repoPath, sha);
  }

  const treeEntries: { path: string; mode: "100644"; type: "blob"; sha: string | null }[] = [];
  for (const file of localFiles) {
    treeEntries.push({
      path: file.repoPath,
      mode: "100644",
      type: "blob",
      sha: uploadedShas.get(file.repoPath) ?? remoteFiles.get(file.repoPath)!,
    });
  }
  for (const p of toDelete) {
    treeEntries.push({ path: p, mode: "100644", type: "blob", sha: null });
  }

  console.log("Creating tree...");
  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: treeEntries,
  });

  const message =
    values.message ??
    `Sync from Replit (${new Date().toISOString()}): ${toUpload.length} updated, ${toDelete.length} removed`;

  console.log("Creating commit...");
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: newTree.sha,
    parents: parentCommitSha ? [parentCommitSha] : [],
  });

  console.log("Updating ref...");
  if (head) {
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });
  } else {
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: newCommit.sha,
    });
  }

  console.log(`\nDone. Commit ${newCommit.sha.slice(0, 7)} pushed to ${owner}/${repo}@${branch}.`);
  console.log(`https://github.com/${owner}/${repo}/commit/${newCommit.sha}`);
  if (branch !== defaultBranch) {
    console.log(`Open a PR: https://github.com/${owner}/${repo}/compare/${defaultBranch}...${branch}?expand=1`);
  }
}

main().catch((err) => {
  console.error("Sync failed:", err?.message ?? err);
  if (err?.response?.data) console.error(err.response.data);
  process.exit(1);
});
