import { Redis } from "ioredis";

import { pingDb } from "@sahin/db";
import { loadEnv } from "@sahin/shared";

export const dynamic = "force-dynamic";

interface HealthBody {
  db: "ok" | "error";
  redis: "ok" | "error";
  uptime: number;
  errors?: Record<string, string>;
}

async function pingRedis(): Promise<{ ok: boolean; err?: string }> {
  const env = loadEnv();
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
  });
  try {
    await redis.connect();
    const pong = await redis.ping();
    return { ok: pong === "PONG" };
  } catch (err) {
    return { ok: false, err: err instanceof Error ? err.message : String(err) };
  } finally {
    redis.disconnect();
  }
}

export async function GET(): Promise<Response> {
  const errors: Record<string, string> = {};

  const [dbOk, redisRes] = await Promise.all([
    pingDb().catch((err: unknown) => {
      errors.db = err instanceof Error ? err.message : String(err);
      return false;
    }),
    pingRedis(),
  ]);

  if (!redisRes.ok && redisRes.err) errors.redis = redisRes.err;

  const body: HealthBody = {
    db: dbOk ? "ok" : "error",
    redis: redisRes.ok ? "ok" : "error",
    uptime: Math.round(process.uptime()),
  };
  if (Object.keys(errors).length > 0) body.errors = errors;

  const allOk = dbOk && redisRes.ok;
  return Response.json(body, { status: allOk ? 200 : 503 });
}
