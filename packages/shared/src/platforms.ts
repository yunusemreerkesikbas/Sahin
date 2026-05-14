export const PLATFORMS = ["armut", "upwork"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const JOB_STATUSES = [
  "raw",
  "filtered_out",
  "pending_eval",
  "evaluated",
  "applied",
  "rejected_by_user",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const QUEUE_NAMES = {
  scrapeArmut: "scrape-armut",
  scrapeUpwork: "scrape-upwork",
  evalHaiku: "eval-haiku",
  evalSonnet: "eval-sonnet",
  proposalGen: "proposal-gen",
  notifyTelegram: "notify-telegram",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
