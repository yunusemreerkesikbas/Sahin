import { Worker, type Job } from "bullmq";

import { QUEUE_NAMES } from "@sahin/shared";

import { logger } from "../logger.js";
import { getRedis } from "../redis.js";

export function startScrapeUpworkWorker(): Worker {
  const log = logger.child({ worker: QUEUE_NAMES.scrapeUpwork });
  return new Worker(
    QUEUE_NAMES.scrapeUpwork,
    async (job: Job) => {
      log.info({ jobId: job.id, data: job.data }, "received job (placeholder)");
      // Real Upwork scraper lands in Phase 1.3.
      return { ok: true, placeholder: true };
    },
    { connection: getRedis(), concurrency: 1 },
  );
}
