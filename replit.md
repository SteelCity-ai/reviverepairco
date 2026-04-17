# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/web run dev` — run the Revive Roof Repair Next.js site locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- `artifacts/web` — **Revive Roof Repair** marketing site (reviveroofrepair.com).
  - Imported from GitHub repo `SteelCity-ai/reviveroofrepair.com`.
  - Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4.
  - Dev: `pnpm --filter @workspace/web run dev` (binds to `$PORT`).
  - Production: `next build` then `next start` (configured in `artifacts/web/.replit-artifact/artifact.toml`).
  - `next.config.ts` reads `REPLIT_DOMAINS` to set `allowedDevOrigins` so the dev server accepts proxied requests.
  - No environment variables / secrets required.

## Pushing site updates back to GitHub

Workspace git is platform-managed, so changes are pushed to
`SteelCity-ai/reviveroofrepair.com` via a sync script that uses the connected
GitHub account (no PAT required).

- Preview pending changes (no writes):
  `pnpm --filter @workspace/scripts exec tsx ./src/sync-to-github.ts --dry-run`
- Push to the default branch (`main`):
  `pnpm --filter @workspace/scripts exec tsx ./src/sync-to-github.ts --message "your commit message"`
- Push to a feature branch and open a PR:
  `pnpm --filter @workspace/scripts exec tsx ./src/sync-to-github.ts --branch my-edits --message "..."`
  (the script prints a compare URL when not pushing to the default branch).
- Help: add `--help` for all options (`--owner`, `--repo`, `--branch`,
  `--base-branch`, `--message`, `--dir`, `--dry-run`, `--force-delete`).

The script uploads only files whose contents changed and respects
`artifacts/web/.gitignore` plus `node_modules`, `.next`, build output, and
`.git`. Because it mirrors the local directory to the repo root, deleting
remote files requires `--force-delete` — without it, the script will print
the would-be deletions and abort, so files outside the synced directory
(workflows, docs, CI config) can't be removed by accident. To pull updates
from teammates, use GitHub's normal PR/clone flow on your local machine —
this workspace does not auto-pull.
