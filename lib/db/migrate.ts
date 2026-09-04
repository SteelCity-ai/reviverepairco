/**
 * ⚠️ DEPRECATED — Migration runner has been removed.
 *
 * The actual migration workflow is `drizzle-kit push` (`db:push` in
 * artifacts/portal-api/package.json). There is no `lib/db/migrations`
 * directory and this script is non-functional.
 *
 * To apply schema changes, use:
 *   cd artifacts/portal-api && pnpm db:push
 */
import { fileURLToPath } from "node:url";

const script = fileURLToPath(import.meta.url);
console.error(`ERROR: ${script} is deprecated.`);
console.error("Use 'cd artifacts/portal-api && pnpm db:push' instead.");
console.error("This script references a nonexistent migrations directory.");
process.exit(1);
