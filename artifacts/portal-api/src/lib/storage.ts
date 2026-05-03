import { Client } from "@replit/object-storage";
import { randomUUID } from "crypto";

const bucketId =
  process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID ??
  process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const client = new Client({ bucketId });

export interface UploadResult {
  objectKey: string;
}

export interface PhotoUploadCtx {
  clientId: string;
  projectId: string;
  dailyTaskId: string;
}

export interface DocumentUploadCtx {
  clientId: string;
  projectId: string;
}

function buildPhotoKey(ctx: PhotoUploadCtx, filename: string) {
  return `clients/${ctx.clientId}/projects/${ctx.projectId}/daily-tasks/${ctx.dailyTaskId}/${randomUUID()}-${filename}`;
}

function buildDocumentKey(ctx: DocumentUploadCtx, filename: string) {
  return `clients/${ctx.clientId}/projects/${ctx.projectId}/documents/${randomUUID()}-${filename}`;
}

export async function uploadPhoto(
  buffer: Buffer,
  filename: string,
  ctx: PhotoUploadCtx,
): Promise<UploadResult> {
  const objectKey = buildPhotoKey(ctx, filename);
  const result = await client.uploadFromBytes(objectKey, buffer);
  if (!result.ok) {
    throw new Error(`storage.uploadPhoto failed: ${result.error.message}`);
  }
  return { objectKey };
}

export async function uploadDocument(
  buffer: Buffer,
  filename: string,
  ctx: DocumentUploadCtx,
): Promise<UploadResult> {
  const objectKey = buildDocumentKey(ctx, filename);
  const result = await client.uploadFromBytes(objectKey, buffer);
  if (!result.ok) {
    throw new Error(`storage.uploadDocument failed: ${result.error.message}`);
  }
  return { objectKey };
}

/**
 * Download bytes for an object. Used by /photos/:id/url and
 * /documents/:id/url style endpoints to proxy the file (the SDK does not
 * expose presigned URLs directly).
 */
export async function downloadBytes(
  objectKey: string,
): Promise<Buffer> {
  const result = await client.downloadAsBytes(objectKey);
  if (!result.ok) {
    throw new Error(`storage.downloadBytes failed: ${result.error.message}`);
  }
  return Buffer.from(result.value[0]);
}

/**
 * Returns the API path the client should hit to stream the object back.
 * (We proxy through the API instead of exposing GCS URLs directly so we can
 * enforce per-request authz.)
 */
export function buildPhotoUrl(photoId: string): string {
  return `/api/v1/photos/${photoId}/file`;
}
export function buildDocumentUrl(docId: string): string {
  return `/api/v1/documents/${docId}/file`;
}

export async function deleteObject(objectKey: string): Promise<void> {
  const result = await client.delete(objectKey);
  if (!result.ok) {
    console.warn(
      `[storage] delete failed for ${objectKey}: ${result.error.message}`,
    );
  }
}
