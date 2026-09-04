/**
 * ⚠️ DEPRECATED — Canonical DB client now lives at:
 *   artifacts/portal-api/lib/db/index.ts
 *
 * This file re-exports from the single source of truth.
 */
export { db, type DatabaseClient } from "@workspace/portal-api/lib/db/index.js";
export * from "@workspace/portal-api/lib/db/schema/portal.js";
