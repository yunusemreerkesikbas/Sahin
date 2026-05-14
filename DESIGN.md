# Şahin — Design

> Single-source design document. When something here disagrees with code, the code wins and this doc gets updated.

## Context

Şahin is a personal automation system for one freelance Web/Full-stack developer. It scrapes two job platforms (Armut for the Turkish local market, Upwork for international remote), evaluates each new job against the user's CV and rate floor, generates a tailored proposal draft for high-scoring matches, and notifies the user on Telegram. The user reviews the draft and decides whether to send.

The system is single-tenant by design and is not SaaS — auth is "bind to 127.0.0.1 and trust the network." All outreach is manually approved before sending.

## Out of scope

- Multi-user / authentication beyond loopback binding
- Storing personal data of non-business clients (only legal-entity / business clients are tracked)
- Automated proposal sending — every draft is human-reviewed in Telegram
- B2C scraping (Armut Pro-only, Upwork business listings)

## Architecture

```
            ┌──────────────┐         ┌──────────────┐
            │   Armut      │         │   Upwork     │   (external)
            └──────┬───────┘         └──────┬───────┘
                   │                        │
            Playwright (storageState, polite delays, 20-min poll)
                   │                        │
                   └────────┬───────────────┘
                            ▼
                ┌───────────────────────┐
                │  BullMQ scrape queues │
                │  (Redis)              │
                └───────────┬───────────┘
                            ▼
                ┌───────────────────────┐
                │  Postgres (pgvector)  │
                │  jobs (raw + meta)    │
                └───────────┬───────────┘
                            ▼
                ┌───────────────────────┐
                │  Hard filters         │  (drop obviously bad jobs)
                └───────────┬───────────┘
                            ▼
                ┌───────────────────────┐
                │  Haiku screen (cheap) │  ← skip if hard filter dropped
                └───────────┬───────────┘
                            ▼
                ┌───────────────────────┐
                │  Sonnet deep eval     │  ← only if Haiku >= threshold
                └───────────┬───────────┘
                            ▼
                ┌───────────────────────┐
                │  Deterministic score  │  (LLM evals + rules)
                └───────────┬───────────┘
                            ▼
                  ┌─────────────────────┐
                  │  Sonnet proposal    │  (only if final score >= threshold)
                  └─────────┬───────────┘
                            ▼
                ┌───────────────────────┐
                │  Telegram bot         │  (manual approve → send)
                └───────────────────────┘
```

The Next.js dashboard (`apps/web`) reads the same Postgres and is the inspection / configuration UI. The worker (`apps/worker`) runs as a separate Node process so Playwright sessions survive Next.js dev hot-reload.

## Tech stack

See `AGENTS.md` for the full table. Highlights: Next.js 16.2.6 (App Router), Postgres 17 with pgvector, Drizzle ORM 0.38, BullMQ 5, Anthropic Haiku 4.5 + Sonnet 4.6.

## Decisions locked in

| #  | Topic              | Decision                                          | Why                                                                |
|----|--------------------|---------------------------------------------------|--------------------------------------------------------------------|
| 1  | Repo               | pnpm workspace monorepo                           | Clear `apps/` vs `packages/` separation                            |
| 2  | Worker process     | Standalone Node process (`apps/worker`)           | Playwright session survives dev hot-reload                         |
| 3  | DB                 | Postgres + pgvector (Docker locally)              | JSONB + future semantic search; one-line Neon swap via env         |
| 4  | UI auth            | None — bind to 127.0.0.1                          | Single user; VPS deploy will add basic auth via reverse proxy      |
| 5  | shadcn theme       | `new-york` + `neutral`                            | Conservative dashboard aesthetic                                   |
| 6  | Doc language       | English                                           | Open-source convention, future shareability                        |
| 7  | Cache Components   | Disabled in 1.0                                   | Mostly request-time data; revisit when adding heavy public surface |
| 8  | Two-tier LLM eval  | Haiku screen → Sonnet deep eval → Sonnet proposal | Cost: cheap screening drops ~80% of jobs before the expensive call |
| 9  | Scrape cadence     | 20 min                                            | Politeness; matches typical job posting velocity                   |

## Scoring algorithm

Each evaluated job receives a final score in `[0, 1]`. Inputs:

- **cv_match** — semantic similarity between the job description and the user's CV (pgvector cosine in 1.5; LLM-judged in 1.2).
- **skills_match** — overlap between job-required skills and user skill list.
- **competition** — fewer existing proposals → higher score.
- **client_quality** — client history, payment verification, hire rate.
- **economic** — budget vs. user's hourly rate floor.
- **freshness** — exponential decay from posting time.

Weights live in `packages/scoring/src/weights.ts` and tune over time via the feedback loop (Phase 1.5). Detailed formulas in `docs/architecture/scoring-algorithm.md`.

## LLM pipeline

Two-tier model to keep cost under ~$12/mo:

1. **Haiku screen** — cheap pass-through prompt: "is this job plausibly relevant?" Output: score 0-10 + short reason. Threshold ≥ 6 to proceed.
2. **Sonnet deep eval** — full evaluation: CV match commentary, skill alignment, red flags, suggested rate. Output: structured JSON.
3. **Sonnet proposal draft** — only if the final score ≥ proposal threshold. Output: language-matched proposal text + suggested rate.

Cost-tracking and prompts live in `packages/llm/` (Phase 1.2). See `docs/architecture/llm-pipeline.md`.

## Database schema (skeleton)

| Table          | Purpose                                                            |
|----------------|--------------------------------------------------------------------|
| `user_profile` | Single row — CV summary, skills, rate floor, embedding (vec[1024]) |
| `jobs`         | Scraped jobs — `(platform, external_id)` unique; raw HTML + meta   |
| `evaluations`  | Per-job per-stage LLM output, scores, cost                         |
| `proposals`    | Generated draft, language, suggested rate, status                  |
| `feedback`     | User actions per job (interested / not / sent / hired)             |

Full schema in `packages/db/src/schema.ts`. Always derive types via `typeof table.$inferSelect / $inferInsert`.

## Phase plan

| Phase | Goal                                                                                 |
|-------|--------------------------------------------------------------------------------------|
| 1.0   | Foundation — monorepo, schema skeleton, UI shell, docs                               |
| 1.1   | Armut MVP — real scraper + hard filters + job ingestion                              |
| 1.2   | Scoring + Job UI — two-tier LLM eval, deterministic scoring, jobs list / detail page |
| 1.3   | Upwork + Proposals + Telegram — Upwork scraper, proposal generator, Telegram push    |
| 1.4   | Polish — session re-login flow, observability, dead-letter queue UI                  |
| 1.5   | Refine + Embeddings — feedback-driven weight tuning, pgvector semantic match         |
| 2.0   | Lead-gen — Google Places + Lighthouse + value-first outreach                         |

Each phase gets its own plan file at start. Status is tracked in `docs/roadmap.md`.

## Critical files

See `AGENTS.md` for the table.

## Open questions (post-1.0)

1. Telegram bot creation — will user create via @BotFather, or do we ship step-by-step in `docs/operations/`?
2. Anthropic API key provisioning — already ready, or part of onboarding doc?
3. Hetzner VPS migration timing — pin to Phase 1.5 or leave open?

## Phase 2 preview

Lead generation pivot: scrape local business directories (Google Places, Yelp), run Lighthouse against their websites, draft value-first outreach pointing out specific improvements. Same pipeline (filter → eval → propose → Telegram), different input source.
