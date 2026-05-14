import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  DATABASE_URL: z
    .string()
    .url()
    .describe("Postgres connection string, e.g. postgres://user:pass@host:5432/db"),
  REDIS_URL: z
    .string()
    .url()
    .describe("Redis connection string, e.g. redis://localhost:6379"),

  WORKER_SCHEDULES_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),

  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL_HAIKU: z.string().default("claude-haiku-4-5-20251001"),
  ANTHROPIC_MODEL_SONNET: z.string().default("claude-sonnet-4-6"),

  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_CHAT_ID: z.string().min(1).optional(),

  NEXT_PUBLIC_APP_NAME: z.string().default("Sahin"),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;

  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Environment validation failed:\n${issues}\n\nCopy .env.example to .env and fill required values.`,
    );
  }

  cached = parsed.data;
  return cached;
}

export function resetEnvCache(): void {
  cached = null;
}
