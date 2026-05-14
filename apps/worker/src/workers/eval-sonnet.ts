import { Worker, type Job } from "bullmq";

import { QUEUE_NAMES } from "@sahin/shared";

import { logger } from "../logger.js";
import { getRedis } from "../redis.js";

export function startEvalSonnetWorker(): Worker {
  const log = logger.child({ worker: QUEUE_NAMES.evalSonnet });
  return new Worker(
    QUEUE_NAMES.evalSonnet,
    async (job: Job) => {
      log.info({ jobId: job.id, data: job.data }, "received job (placeholder)");
      // Real Sonnet eval lands in Phase 1.2.
      return { ok: true, placeholder: true };
    },
    { connection: getRedis(), concurrency: 2 },
  );
}
