import { Worker, type Job } from "bullmq";

import { QUEUE_NAMES } from "@sahin/shared";

import { logger } from "../logger.js";
import { getRedis } from "../redis.js";

export function startProposalGenWorker(): Worker {
  const log = logger.child({ worker: QUEUE_NAMES.proposalGen });
  return new Worker(
    QUEUE_NAMES.proposalGen,
    async (job: Job) => {
      log.info({ jobId: job.id, data: job.data }, "received job (placeholder)");
      // Real proposal generator lands in Phase 1.3.
      return { ok: true, placeholder: true };
    },
    { connection: getRedis(), concurrency: 2 },
  );
}
