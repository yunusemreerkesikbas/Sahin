import { POLITENESS } from "@sahin/scrapers";
import { QUEUE_NAMES } from "@sahin/shared";

import { logger } from "./logger.js";
import { getQueue } from "./queues.js";

// Registers repeatable jobs that fire on a fixed cadence.
// Phase 1.0 keeps these registered only when WORKER_SCHEDULES_ENABLED=true,
// because the actual scrapers don't exist yet.
export async function registerSchedules(): Promise<void> {
  const log = logger.child({ component: "scheduler" });

  const armutQueue = getQueue(QUEUE_NAMES.scrapeArmut);
  await armutQueue.upsertJobScheduler(
    "armut-poll",
    { every: POLITENESS.armut.pollIntervalMinutes * 60 * 1000 },
    {
      name: "scheduled-poll",
      data: { trigger: "schedule" },
      opts: { removeOnComplete: { age: 3600, count: 100 } },
    },
  );
  log.info(
    { intervalMinutes: POLITENESS.armut.pollIntervalMinutes },
    "registered: armut-poll",
  );

  const upworkQueue = getQueue(QUEUE_NAMES.scrapeUpwork);
  await upworkQueue.upsertJobScheduler(
    "upwork-poll",
    { every: POLITENESS.upwork.pollIntervalMinutes * 60 * 1000 },
    {
      name: "scheduled-poll",
      data: { trigger: "schedule" },
      opts: { removeOnComplete: { age: 3600, count: 100 } },
    },
  );
  log.info(
    { intervalMinutes: POLITENESS.upwork.pollIntervalMinutes },
    "registered: upwork-poll",
  );
}

export async function unregisterSchedules(): Promise<void> {
  const log = logger.child({ component: "scheduler" });
  const armutQueue = getQueue(QUEUE_NAMES.scrapeArmut);
  const upworkQueue = getQueue(QUEUE_NAMES.scrapeUpwork);
  await Promise.all([
    armutQueue.removeJobScheduler("armut-poll"),
    upworkQueue.removeJobScheduler("upwork-poll"),
  ]);
  log.info("all schedules removed");
}
