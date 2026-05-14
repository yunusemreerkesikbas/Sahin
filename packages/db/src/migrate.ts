import "dotenv/config";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import { closeDb, getDb } from "./client.js";

async function main(): Promise<void> {
  const db = getDb();
  console.log("[migrate] applying pending migrations...");
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("[migrate] done.");
  await closeDb();
}

main().catch((err) => {
  console.error("[migrate] FAILED:", err);
  process.exit(1);
});
