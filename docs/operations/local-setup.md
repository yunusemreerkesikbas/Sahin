# Operations — local setup

Bring a fresh clone to "running locally" in five minutes.

## Prerequisites

- **Node 22 LTS** — pin with `nvm use` (see `.nvmrc`)
- **pnpm 11** — enable via `corepack enable pnpm`
- **Docker Desktop** (or Docker Engine + Compose) — for Postgres and Redis
- An **Anthropic API key** (for Phase 1.2 onward; not required to boot 1.0)

## First-time install

```bash
# 1. Install workspace deps
pnpm install

# 2. Copy env template
cp .env.example .env
# then edit .env — at minimum ANTHROPIC_API_KEY can stay blank for 1.0

# 3. Bring up Postgres + Redis
pnpm db:up

# 4. Wait for Postgres to be healthy (a few seconds), then apply schema
pnpm db:migrate

# 5. Start both processes
pnpm dev
```

`pnpm dev` runs `apps/web` (Next.js on `127.0.0.1:3000`) and `apps/worker` (Node + BullMQ) in parallel.

## Smoke test

After the dev script reports both processes are up:

```bash
# Web is reachable and Postgres + Redis ping ok
curl http://127.0.0.1:3000/api/health
# {"db":"ok","redis":"ok","uptime":<seconds>}

# Schema is present
docker exec sahin-postgres psql -U postgres -d sahin -c '\dt'
# expect: user_profile, jobs, evaluations, proposals, feedback

# Worker logs show clean boot
# look for: "worker booted, listening for jobs"
```

In the browser, `http://127.0.0.1:3000` should redirect to `/dashboard`. Sidebar nav (Dashboard, Jobs, Profile, Settings) works. Theme toggle (top right) flips light/dark.

## Workspace-wide typecheck

```bash
pnpm typecheck
```

Should report zero errors across all packages.

## Day-to-day commands

```bash
# After editing packages/db/src/schema.ts
pnpm db:generate     # generate migration SQL
# review the SQL, then:
pnpm db:migrate

# Inspect data
pnpm db:studio       # opens Drizzle Studio

# Restart worker only
pnpm -F @sahin/worker dev

# Stop infra
pnpm db:down
```

## What lives where

- **`.env`** — your local secrets (gitignored)
- **`.env.example`** — schema contract (committed)
- **`data/postgres/`** — Docker volume mount, gitignored
- **`data/auth/`** — Playwright `storageState` per platform, gitignored (Phase 1.1+)
- **`data/cache/`** — scraped HTML cache, gitignored

## When something is wrong

See [`troubleshooting.md`](troubleshooting.md).
