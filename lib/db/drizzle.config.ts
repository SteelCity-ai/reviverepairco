/**
 * Drizzle Kit configuration for portal schema migrations.
 * Run from the repo root:
 *   npx drizzle-kit generate --config=lib/db/drizzle.config.ts
 */

import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema/portal.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
