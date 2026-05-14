# Architecture — data flow

This page traces a single job from "first time seen on Armut" to "Telegram notification with a proposal draft."

## Lifecycle stages

```
SCRAPED ─► FILTERED ─► HAIKU_SCREENED ─► SONNET_EVALUATED ─► SCORED ─► PROPOSAL_DRAFTED ─► NOTIFIED
   │           │              │                  │              │              │              │
   └─► dropped └─► dropped    └─► dropped       └─► dropped    └─► low score  └─► skipped     │
       (parse  )   (hard         (Haiku < th)      (Sonnet         (< th, no       (no draft   │
                    filter)                         redflags)       proposal)        needed)    │
                                                                                                ▼
                                                                                       user reviews
                                                                                       in Telegram
```

Statuses are tracked in the `jobs` table (`status` column) and enumerated in `JOB_STATUSES` (`packages/shared/src/platforms.ts`).

## Detailed flow

### 1. Scrape

- **Scheduler** fires every 20 minutes (`apps/worker/src/scheduler.ts`).
- **Scraper** (Phase 1.1) uses Playwright with a previously-saved `storageState` to fetch the job listing page, then per-job detail pages.
- Each job is upserted into `jobs` using the unique `(platform, external_id)` constraint. New row → `status: 'scraped'`. Existing row → no-op (we don't re-evaluate).
- `meta` JSONB holds platform-specific fields (budget, location, client info). `raw_html` keeps the source for debugging / re-parse.

### 2. Hard filters

- Runs synchronously in the scrape worker before enqueueing eval.
- Drops jobs that fail any rule: wrong language, B2C category, blacklist match, missing budget on Upwork.
- Dropped → `status: 'filtered_out'`. Survivor → enqueue `eval-haiku`.

### 3. Haiku screen

- Cheap pass: one short prompt to claude-haiku-4.5 asking "is this plausibly relevant?"
- Output: score 0-10 + one-line reason. Logged to `evaluations` with `stage: 'haiku'`.
- Score ≥ 6 → enqueue `eval-sonnet`. Otherwise → `status: 'screened_out'`.

### 4. Sonnet deep eval

- Full evaluation against the user's CV + skill list + rate floor.
- Structured JSON output: cv_match score, skill_overlap, red flags, suggested_rate.
- Logged to `evaluations` with `stage: 'sonnet'`. Total cost tracked.

### 5. Deterministic scoring

- `packages/scoring` combines Sonnet's numeric outputs with rule-based dimensions (freshness, competition, client_quality) using weights from `weights.ts`.
- Result: `final_score` in `[0, 1]`. Written back to the `evaluations` row.
- Score ≥ proposal threshold → enqueue `proposal-gen`. Otherwise → `status: 'scored_low'`.

### 6. Proposal draft

- Sonnet generates a tailored proposal in the job's language, including a suggested hourly rate.
- Output stored in `proposals`. `status: 'proposal_ready'`.

### 7. Telegram notification

- `notify-telegram` worker sends a message with: job title, score, suggested rate, "open" link to the dashboard detail page, "draft" inline.
- User reads in Telegram, opens the dashboard if interested, edits & sends the proposal manually.
- Feedback (interested / not / sent / hired) goes into `feedback`.

## What is not auto-actioned

- **No auto-send.** Every proposal requires a human in the loop in Telegram.
- **No retry of LLM evals** unless the call itself errored (transient API issue). A low-score job stays low-scored until the user adjusts weights or the CV.

## Where to look in code

| Stage         | Code                                              |
|---------------|---------------------------------------------------|
| Scrape        | `apps/worker/src/workers/scrape-*.ts`             |
| Hard filter   | `packages/filters/src/hard-filters.ts`            |
| Haiku eval    | `apps/worker/src/workers/eval-haiku.ts`           |
| Sonnet eval   | `apps/worker/src/workers/eval-sonnet.ts`          |
| Score         | `packages/scoring/src/final.ts`                   |
| Proposal      | `apps/worker/src/workers/proposal-gen.ts`         |
| Notify        | `apps/worker/src/workers/notify-telegram.ts`      |
| Schema        | `packages/db/src/schema.ts`                       |
