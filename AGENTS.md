<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Şahin — Agent Contract

Şahin is a personal Job Radar: it polls Armut and Upwork every 20 minutes, scores each new job through a multi-dimensional algorithm, generates proposal drafts for high-scoring matches, and pushes them to Telegram. Single user, local-first, target ~$12/mo LLM budget.

This document is the entry point for any agent (human or LLM) working in this repo. Read it first. Follow the pointers in **Deeper docs** to drill into specifics.

## Tech stack

| Layer        | Choice                                                      |
|--------------|-------------------------------------------------------------|
| Runtime      | Node 22 LTS                                                 |
| Package mgr  | pnpm 11 (workspace monorepo)                                |
| Web          | Next.js 16.2.6 (App Router), React 19.2.4, Tailwind v4      |
| UI kit       | shadcn/ui — style `new-york`, base color `neutral`          |
| Worker       | Standalone Node process — BullMQ 5 + ioredis + Playwright   |
| DB           | Postgres 17 (pgvector) via Drizzle ORM 0.38                 |
| Queue        | Redis 7 (BullMQ)                                            |
| LLM          | Anthropic SDK — Haiku 4.5 (screen) → Sonnet 4.6 (deep eval) |
| Notifier     | Telegram Bot API                                            |
| Logging      | pino + pino-pretty                                          |
| Env          | zod-validated `process.env` via `@sahin/shared`             |

## Workspace layout

```
apps/
  web/        # Next.js dashboard (port 3000, 127.0.0.1)
  worker/     # BullMQ workers + Playwright scrapers (separate Node process)
packages/
  db/         # Drizzle schema + migrations + client
  shared/     # zod env loader, platform literals
  scrapers/   # Playwright helpers (politeness, session)
  filters/    # hard filter rules
  scoring/    # deterministic scoring math
  llm/        # Anthropic wrapper + prompts + cost log
  notifier/   # Telegram client
docs/         # living documentation (see docs/README.md)
data/         # gitignored — playwright storageState, html cache, pg data
```

Path aliases (see `tsconfig.base.json`): `@sahin/db`, `@sahin/shared`, `@sahin/llm`, `@sahin/scoring`, `@sahin/filters`, `@sahin/scrapers`, `@sahin/notifier`. The `apps/web` tsconfig also defines `@/*` → `./*`.

## Critical files

| Path                                         | Role                                       |
|----------------------------------------------|--------------------------------------------|
| `pnpm-workspace.yaml`                        | Workspace scope                            |
| `package.json` (root)                        | Workspace scripts                          |
| `tsconfig.base.json`                         | Strict TS + path aliases                   |
| `docker-compose.yml`                         | Postgres (pgvector) + Redis                |
| `.env.example`                               | Env var contract                           |
| `apps/web/components.json`                   | shadcn config                              |
| `apps/web/app/(dashboard)/layout.tsx`        | Sidebar + topbar shell                     |
| `apps/web/app/api/health/route.ts`           | `/api/health` — DB + Redis ping            |
| `apps/worker/src/index.ts`                   | Worker boot, registers all queues          |
| `apps/worker/src/scheduler.ts`               | Repeatable BullMQ schedulers (20-min poll) |
| `packages/db/src/schema.ts`                  | Full Drizzle schema                        |
| `packages/shared/src/env.ts`                 | zod env validation                         |
| `DESIGN.md`                                  | Source-of-truth design doc                 |
| `docs/roadmap.md`                            | Phase status                               |

## Commands cheat sheet

```bash
# install
pnpm install

# infra
pnpm db:up                  # docker compose up postgres + redis
pnpm db:down
pnpm db:logs

# schema
pnpm db:generate            # drizzle-kit generate (after schema edits)
pnpm db:migrate             # apply pending migrations
pnpm db:studio              # drizzle studio

# dev (web + worker in parallel)
pnpm dev

# per-app
pnpm -F @sahin/web dev
pnpm -F @sahin/worker dev

# Playwright session setup (one-time, headed)
pnpm setup:armut
pnpm setup:upwork

# typecheck (workspace-wide)
pnpm typecheck
```

## Conventions

- **TypeScript**: strict mode, `noUncheckedIndexedAccess`, no `any`, no default exports for utilities (named exports only). Module resolution is `bundler` so `import "./foo.js"` maps to `./foo.ts` source.
- **File naming**: kebab-case for files (`scrape-armut.ts`), PascalCase for React components (`Card`, `NavLinks`).
- **React**: server components by default. Client components (`"use client"`) only when a hook, event handler, or browser API is needed.
- **Next.js**: see the rules block at the top of this file. `params` and `searchParams` are Promises — always `await`.
- **Database**: snake_case in SQL, camelCase in TS — Drizzle config handles the translation (`casing: 'snake_case'`).
- **Logging**: use `logger.child({ component: ... })` in the worker. Never `console.log` in committed code.
- **Env**: never read `process.env.X` directly outside `packages/shared/src/env.ts`. Import the typed `env` instead.
- **Comments**: write them only when the WHY is non-obvious. Don't restate what the code says.

## Testing approach

Phase 1.0 ships no automated tests — the foundation is verified by the end-to-end smoke test in `docs/operations/local-setup.md`. Tests come online phase-by-phase as features land:

- 1.1: golden-file tests for Armut HTML parsing
- 1.2: unit tests for scoring math; LLM contract tests with recorded fixtures
- 1.3: integration test for proposal generation + Telegram dispatch

## Style for AI agents

- Prefer editing existing files over creating new ones.
- Read `node_modules/next/dist/docs/` before writing Next.js code — APIs differ from older versions you may know.
- When you change `packages/db/src/schema.ts`, run `pnpm db:generate` and commit the generated SQL.
- When you add a workspace dep, run `pnpm install` from the repo root.
- Do not bypass `pnpm`. No `npm` or `yarn` invocations.

## Deeper docs

- `DESIGN.md` — full design (architecture, scoring, schema, phase plan)
- `docs/roadmap.md` — phase status
- `docs/architecture/` — overview, data flow, scoring, LLM pipeline
- `docs/operations/` — local setup, Playwright auth, cost monitoring, troubleshooting
- `docs/decisions/` — ADRs (architecture decision records)
