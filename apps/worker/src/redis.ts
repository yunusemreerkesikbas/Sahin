import IORedis, { type Redis } from "ioredis";

import { loadEnv } from "@sahin/shared";

let connection: Redis | null = null;

export function getRedis(): Redis {
  if (connection) return connection;
  const env = loadEnv();
  connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  return connection;
}

export async function pingRedis(): Promise<boolean> {
  try {
    const result = await getRedis().ping();
    return result === "PONG";
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
