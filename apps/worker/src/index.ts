import "dotenv/config";

import type { Worker } from "bullmq";

import { closeDb, pingDb } from "@sahin/db";
import { loadEnv } from "@sahin/shared";

import { logger } from "./logger.js";
import { closeAllQueues } from "./queues.js";
import { closeRedis, pingRedis } from "./redis.js";
import { registerSchedules, unregisterSchedules } from "./scheduler.js";
import { startEvalHaikuWorker } from "./workers/eval-haiku.js";
import { startEvalSonnetWorker } from "./workers/eval-sonnet.js";
import { startNotifyTelegramWorker } from "./workers/notify-telegram.js";
import { startProposalGenWorker } from "./workers/proposal-gen.js";
import { startScrapeArmutWorker } from "./workers/scrape-armut.js";
import { startScrapeUpworkWorker } from "./workers/scrape-upwork.js";

async function main(): Promise<void> {
  const env = loadEnv();
  logger.info({ env: env.NODE_ENV }, "worker boot starting");

  const [dbOk, redisOk] = await Promise.all([pingDb(), pingRedis()]);
  if (!dbOk) throw new Error("Postgres ping failed — check DATABASE_URL and `pnpm db:up`");
  if (!redisOk) throw new Error("Redis ping failed — check REDIS_URL and `pnpm db:up`");
  logger.info({ db: "ok", redis: "ok" }, "infra reachable");

  const workers: Worker[] = [
    startScrapeArmutWorker(),
    startScrapeUpworkWorker(),
    startEvalHaikuWorker(),
    startEvalSonnetWorker(),
    startProposalGenWorker(),
    startNotifyTelegramWorker(),
  ];
  logger.info({ count: workers.length }, "workers registered");

  if (env.WORKER_SCHEDULES_ENABLED) {
    await registerSchedules();
    logger.info("schedules ENABLED");
  } else {
    logger.warn(
      "WORKER_SCHEDULES_ENABLED=false → cron schedulers NOT registered (Phase 1.0 default)",
    );
  }

  let shuttingDown = false;
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "shutdown signal received");
    try {
      if (env.WORKER_SCHEDULES_ENABLED) await unregisterSchedules();
      await Promise.all(workers.map((w) => w.close()));
      await closeAllQueues();
      await closeRedis();
      await closeDb();
      logger.info("clean shutdown complete");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  logger.info("worker booted, listening for jobs");
}

main().catch((err) => {
  logger.fatal({ err }, "worker failed to boot");
  process.exit(1);
});
