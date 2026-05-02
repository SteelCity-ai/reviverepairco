/**
 * Revive Roof Repair Portal — Drizzle ORM Database Client
 *
 * Initializes and exports the Drizzle ORM client using the Postgres.js driver.
 * Import this module from the portal Next.js app or the Express API server:
 *
 *   import { db } from "@/lib/db";
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/portal";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(databaseUrl, { max: 10 });
export const db = drizzle(client, { schema });

export * from "./schema/portal";
