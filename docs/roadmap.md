# Roadmap

Status legend: ✅ done · 🟡 in progress · ⬜ pending

## Phase 1.0 — Foundation

🟡 in progress

- ✅ pnpm workspace monorepo (apps + packages)
- ✅ docker-compose (Postgres + pgvector, Redis)
- ✅ `packages/shared` — zod env loader + platform literals
- ✅ `packages/db` — Drizzle schema skeleton + client + migrate runner
- ✅ Placeholder packages — llm, scoring, filters, scrapers, notifier
- ✅ `apps/worker` — BullMQ boot, six placeholder workers, scheduler with `WORKER_SCHEDULES_ENABLED` gate
- ✅ `apps/web` — shadcn (new-york / neutral), dashboard route group, sidebar + topbar, theme toggle, placeholder pages, `/api/health`
- 🟡 Documentation framework (AGENTS, DESIGN, docs/, ADRs)
- ⬜ README + .nvmrc finalization
- ⬜ End-to-end smoke test (install → db:up → migrate → dev → health curl)

## Phase 1.1 — Armut MVP

⬜ pending

- ⬜ `pnpm setup:armut` — headed Playwright login, save `storageState`
- ⬜ Armut scraper (`packages/scrapers/src/armut.ts`) — headless, polite, session-reuse
- ⬜ Hard filters (`packages/filters`) — language, B2C exclusion, blacklist
- ⬜ `scrape-armut` worker — write to `jobs` table with dedupe
- ⬜ Golden-file parser tests

## Phase 1.2 — Scoring + Job UI

⬜ pending

- ⬜ Haiku screening worker — prompt + cost log
- ⬜ Sonnet deep-eval worker — structured JSON output
- ⬜ Deterministic scoring (`packages/scoring`) — weights + final score
- ⬜ Jobs list page — table with score, filters, status pills
- ⬜ Job detail page — description, evaluation breakdown
- ⬜ Profile page — editable CV + skills

## Phase 1.3 — Upwork + Proposals + Telegram

⬜ pending

- ⬜ `pnpm setup:upwork` + Upwork scraper
- ⬜ Proposal generator (Sonnet)
- ⬜ Telegram bot wiring + push notifications
- ⬜ Approve / reject UI in Telegram (inline buttons)

## Phase 1.4 — Polish

⬜ pending

- ⬜ Session re-login flow when storageState expires
- ⬜ Observability: queue depth, error rate, scrape latency dashboard
- ⬜ Dead-letter queue UI

## Phase 1.5 — Refine + Embeddings

⬜ pending

- ⬜ Feedback loop → automatic weight tuning
- ⬜ pgvector semantic match (CV embedding)
- ⬜ Few-shot prompt examples from past successes

## Phase 2.0 — Lead-gen pivot

⬜ pending

- ⬜ Google Places ingestion
- ⬜ Lighthouse runner
- ⬜ Value-first outreach drafts
