# Architecture — overview

Şahin runs two long-lived processes against a shared Postgres + Redis pair:

1. **`apps/web`** — Next.js 16 dashboard on `127.0.0.1:3000`. Reads from Postgres. Renders job list, detail, profile, settings. Exposes `/api/health` for liveness.
2. **`apps/worker`** — Node process. Owns Playwright sessions, BullMQ workers, scheduled scrape polls, LLM eval pipeline, and Telegram dispatch.

The two processes are deliberately separate. Playwright's persistent context does not survive Next.js dev hot-reload reliably; isolating the worker also lets each side restart independently and lets us deploy them on different boxes later.

## Process map

```
┌────────────────────────────────────────────────────────────────┐
│  apps/web (Next.js 16)            apps/worker (Node + BullMQ)  │
│  ─ pages, API routes              ─ Playwright scrapers         │
│  ─ reads Postgres                 ─ LLM eval pipeline           │
│                                   ─ Telegram bot                │
└────────────────────────────────────────────────────────────────┘
           │                                  │
           ├──────── Postgres ────────────────┤
           │       (jobs, evals,              │
           │        proposals, …)             │
           ├──────── Redis ───────────────────┘
                   (BullMQ queues
                    + schedulers)
```

## Queues

Defined in `apps/worker/src/queues.ts` and consumed by workers in `apps/worker/src/workers/`:

| Queue              | Producer                   | Consumer worker      | Concurrency |
|--------------------|----------------------------|----------------------|-------------|
| `scrape-armut`     | Scheduler (every 20 min)   | `scrape-armut.ts`    | 1           |
| `scrape-upwork`    | Scheduler (every 20 min)   | `scrape-upwork.ts`   | 1           |
| `eval-haiku`       | Post-scrape, post-filter   | `eval-haiku.ts`      | 4           |
| `eval-sonnet`      | Haiku ≥ threshold          | `eval-sonnet.ts`     | 2           |
| `proposal-gen`     | Final score ≥ threshold    | `proposal-gen.ts`    | 2           |
| `notify-telegram`  | Proposal draft ready       | `notify-telegram.ts` | 5           |

Concurrency tuned for the workload type — scraping is single-threaded to stay polite, LLM eval scales with API rate limit, notifications are cheap and parallel.

## Data ownership

- **Schema**: `packages/db/src/schema.ts` is the single source. All other packages import types from `@sahin/db`.
- **Migrations**: generated SQL lives in `packages/db/migrations/`. Apply with `pnpm db:migrate`.
- **Env**: validated once in `packages/shared/src/env.ts` and cached. Never read `process.env` outside that file.

## Failure model

- **Scrape failure** → row written with `status: 'scrape_failed'`, error in `meta.error`. Retried by BullMQ with exponential backoff.
- **LLM failure** → evaluation row inserted with `status: 'failed'`, error captured. Cost still logged for failed calls.
- **Session expiry** → scrape worker detects login wall, marks session stale, surfaces via `/api/health` (Phase 1.4).
- **Telegram unreachable** → notification re-queued; UI surfaces backlog count.

## Local vs deployed

Phase 1.0–1.5 is local-first: everything runs on the developer's machine, Postgres in Docker, Redis in Docker, Next.js bound to `127.0.0.1`. Phase 1.5 may move to a Hetzner VPS — by then we expect to add basic-auth via reverse proxy and switch to managed Postgres (env-driven, one-line swap).
