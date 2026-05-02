import { randomUUID } from "crypto";

/**
 * Stub file-storage service.
 *
 * In production this would use Replit Object Storage or S3.
 * Currently logs actions and returns placeholder values.
 */

export interface UploadResult {
  objectKey: string;
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<UploadResult> {
  const objectKey = `uploads/${randomUUID()}/${filename}`;

  const bucketId = process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID;
  if (bucketId) {
    // TODO: Integrate with Replit Object Storage SDK
    console.log(
      `[storage] (stub) Would upload ${filename} (${mimeType}, ${buffer.length} bytes) to bucket ${bucketId}`,
    );
  } else {
    console.warn(
      `[storage] (stub) REPLIT_OBJECT_STORAGE_BUCKET_ID not set — upload for ${filename} is NO-OP`,
    );
  }

  return { objectKey };
}

export async function getSignedUrl(
  objectKey: string,
  _expiresInSeconds = 3600,
): Promise<string> {
  console.log(`[storage] (stub) Generating signed URL for ${objectKey}`);
  return `https://storage.stub.reviverepairco.com/${objectKey}?signature=placeholder`;
}
