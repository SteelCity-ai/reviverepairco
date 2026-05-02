/**
 * Drizzle migration runner.
 *
 * Usage: tsx lib/db/migrate.ts
 */

import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";
import * as schema from "./schema/portal";

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  console.log("Migrations complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
