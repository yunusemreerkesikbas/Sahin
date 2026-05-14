// Placeholder — Telegram bot wiring lands in Phase 1.3.
// Reads TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID via @sahin/shared/env.

export type NotificationPayload = {
  jobId: number;
  title: string;
  url: string;
  finalScore: number;
  reasoning?: string;
};

export const NOTIFIER_PACKAGE_VERSION = "0.1.0-placeholder";
