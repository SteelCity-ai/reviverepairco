/**
 * Local filesystem storage adapter for blog/media assets.
 *
 * Activated when MEDIA_BACKEND=local (default). Uses MEDIA_ROOT for the
 * base directory and returns relative keys (e.g. "blog/<uuid>-<slug>.<ext>").
 *
 * The legacy Replit Object Storage adapter (storage.ts) is kept reachable
 * and can be selected via MEDIA_BACKEND=replit-object.
 */

import { randomUUID } from "crypto";
import fs from "node:fs/promises";
import path from "node:path";

const MEDIA_ROOT = process.env.MEDIA_ROOT ?? "/data/media";

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/** Resolve a relative object key to an absolute filesystem path. Sanitises to prevent traversal. */
function resolvePath(objectKey: string): string {
  const safe = path
    .normalize(objectKey)
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/[/\\]+/g, path.sep);
  return path.join(MEDIA_ROOT, safe);
}

export interface StorageAdapter {
  uploadBytes(
    buffer: Buffer,
    objectKey: string,
  ): Promise<{ objectKey: string }>;
  downloadBytes(objectKey: string): Promise<Buffer>;
  deleteObject(objectKey: string): Promise<void>;
}

/** Build a deterministically-keyed object path for blog media. */
export function buildBlogMediaKey(
  prefix: string,
  filename: string,
): string {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60);
  return `blog/${prefix}/${randomUUID()}-${base}${ext}`;
}

const localAdapter: StorageAdapter = {
  async uploadBytes(buffer, objectKey) {
    const fullPath = resolvePath(objectKey);
    await ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, buffer);
    return { objectKey };
  },

  async downloadBytes(objectKey) {
    const fullPath = resolvePath(objectKey);
    return fs.readFile(fullPath);
  },

  async deleteObject(objectKey) {
    const fullPath = resolvePath(objectKey);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw err;
      // Already gone — no-op
    }
  },
};

/**
 * Unified media storage adapter. Selects backend via MEDIA_BACKEND env:
 * - "local" (default): local filesystem under MEDIA_ROOT
 * - "replit-object": Replit Object Storage via the legacy storage.ts adapter
 */
export async function getMediaAdapter(): Promise<StorageAdapter> {
  const backend = (process.env.MEDIA_BACKEND ?? "local").toLowerCase();

  if (backend === "replit-object") {
    // Lazy-import so the @replit/object-storage dependency is only loaded when needed
    const { default: replitAdapter } = await import("./storage-replit-adapter.js");
    return replitAdapter;
  }

  return localAdapter;
}

/** The default local adapter — available synchronously for simple cases. */
export const mediaAdapter: StorageAdapter = localAdapter;

/** Public base URL prefix for media assets (e.g. "https://reviverepairco.com/media"). */
export const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL ?? "/media";
