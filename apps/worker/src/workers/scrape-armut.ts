import { Worker, type Job } from "bullmq";

import { QUEUE_NAMES } from "@sahin/shared";

import { logger } from "../logger.js";
import { getRedis } from "../redis.js";

export function startScrapeArmutWorker(): Worker {
  const log = logger.child({ worker: QUEUE_NAMES.scrapeArmut });
  return new Worker(
    QUEUE_NAMES.scrapeArmut,
    async (job: Job) => {
      log.info({ jobId: job.id, data: job.data }, "received job (placeholder)");
      // Real Armut scraper lands in Phase 1.1.
      return { ok: true, placeholder: true };
    },
    { connection: getRedis(), concurrency: 1 },
  );
}
