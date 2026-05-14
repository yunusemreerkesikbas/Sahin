import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

import type { JobStatus, Platform } from "@sahin/shared";

// -----------------------------------------------------------------------------
// user_profile — single-row table holding the operator's CV/skills/preferences
// LLM evaluation prompts inject this into the system message.
// -----------------------------------------------------------------------------
export const userProfile = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  yearsExperience: integer("years_experience"),
  preferredCategories: jsonb("preferred_categories")
    .$type<string[]>()
    .notNull()
    .default([]),
  avoidedKeywords: jsonb("avoided_keywords")
    .$type<string[]>()
    .notNull()
    .default([]),
  minBudgetUsd: integer("min_budget_usd"),
  minBudgetTl: integer("min_budget_tl"),
  cvSummary: text("cv_summary"),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  embeddingVector: vector("embedding_vector", { dimensions: 1024 }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// -----------------------------------------------------------------------------
// jobs — every scraped listing across all platforms.
// `meta` holds platform-specific fields (proposals count, client info, etc.)
// `raw_html` enables re-parsing if our parser improves.
// -----------------------------------------------------------------------------
export type JobBudget = {
  min?: number;
  max?: number;
  currency: string;
  type: "fixed" | "hourly";
};

export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    platform: varchar("platform", { length: 20 }).$type<Platform>().notNull(),
    externalId: varchar("external_id", { length: 255 }).notNull(),
    url: text("url").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    budget: jsonb("budget").$type<JobBudget>(),
    category: varchar("category", { length: 100 }),
    mandatorySkills: jsonb("mandatory_skills").$type<string[]>().notNull().default([]),
    optionalSkills: jsonb("optional_skills").$type<string[]>().notNull().default([]),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    scrapedAt: timestamp("scraped_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    rawHtml: text("raw_html"),
    status: varchar("status", { length: 30 })
      .$type<JobStatus>()
      .notNull()
      .default("raw"),
  },
  (t) => [uniqueIndex("uniq_platform_external").on(t.platform, t.externalId)],
);

// -----------------------------------------------------------------------------
// evaluations — one row per LLM-evaluated job.
// -----------------------------------------------------------------------------
export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id, { onDelete: "cascade" })
    .notNull(),
  cvMatch: integer("cv_match").notNull(),
  skillsMatch: integer("skills_match").notNull(),
  competitionScore: integer("competition_score").notNull(),
  clientQuality: integer("client_quality").notNull(),
  economicScore: integer("economic_score").notNull(),
  freshnessScore: integer("freshness_score").notNull(),
  finalScore: integer("final_score").notNull(),
  reasoning: text("reasoning"),
  redFlags: jsonb("red_flags").$type<string[]>().notNull().default([]),
  greenFlags: jsonb("green_flags").$type<string[]>().notNull().default([]),
  evaluatedAt: timestamp("evaluated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  modelVersion: varchar("model_version", { length: 100 }),
});

// -----------------------------------------------------------------------------
// proposals — generated drafts for jobs that scored ≥75.
// -----------------------------------------------------------------------------
export type ProposalRate = {
  amount: number;
  currency: string;
  type: "fixed" | "hourly";
};

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id, { onDelete: "cascade" })
    .notNull(),
  draftText: text("draft_text").notNull(),
  language: varchar("language", { length: 5 }).notNull(),
  suggestedQuestions: jsonb("suggested_questions")
    .$type<string[]>()
    .notNull()
    .default([]),
  suggestedRate: jsonb("suggested_rate").$type<ProposalRate>(),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  userEditedText: text("user_edited_text"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

// -----------------------------------------------------------------------------
// feedback — user thumbs up/down on jobs, used to tune scoring weights.
// -----------------------------------------------------------------------------
export const FEEDBACK_ACTIONS = ["good_match", "bad_match", "wrong_score"] as const;
export type FeedbackAction = (typeof FEEDBACK_ACTIONS)[number];

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id, { onDelete: "cascade" })
    .notNull(),
  action: varchar("action", { length: 30 }).$type<FeedbackAction>().notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
