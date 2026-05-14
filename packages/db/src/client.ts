import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";

import { loadEnv } from "@sahin/shared";

import * as schema from "./schema.js";

let pool: pg.Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

export function getPool(): pg.Pool {
  if (pool) return pool;
  const env = loadEnv();
  pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
  return pool;
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (dbInstance) return dbInstance;
  dbInstance = drizzle(getPool(), { schema, casing: "snake_case" });
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    dbInstance = null;
  }
}

export async function pingDb(): Promise<boolean> {
  try {
    const result = await getPool().query("SELECT 1 AS ok");
    return result.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}

export type Database = NodePgDatabase<typeof schema>;
