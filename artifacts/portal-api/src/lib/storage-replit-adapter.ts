/**
 * Replit Object Storage adapter — wraps the legacy storage.ts client
 * behind the unified StorageAdapter interface.
 *
 * Selected when MEDIA_BACKEND=replit-object.
 */

import { Client } from "@replit/object-storage";
import type { StorageAdapter } from "./storage-local.js";

const bucketId =
  process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID ??
  process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;

const client = new Client({ bucketId });

const replitAdapter: StorageAdapter = {
  async uploadBytes(buffer, objectKey) {
    const result = await client.uploadFromBytes(objectKey, buffer);
    if (!result.ok) {
      throw new Error(`Replit upload failed: ${result.error.message}`);
    }
    return { objectKey };
  },

  async downloadBytes(objectKey) {
    const result = await client.downloadAsBytes(objectKey);
    if (!result.ok) {
      throw new Error(`Replit download failed: ${result.error.message}`);
    }
    return Buffer.from(result.value[0]);
  },

  async deleteObject(objectKey) {
    const result = await client.delete(objectKey);
    if (!result.ok) {
      console.warn(
        `[storage-replit] delete failed for ${objectKey}: ${result.error.message}`,
      );
    }
  },
};

export default replitAdapter;
