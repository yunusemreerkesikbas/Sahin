# Şahin

Personal Job Radar: scrape Armut + Upwork every 20 minutes, score each new job against your CV with a two-tier LLM eval, generate proposal drafts for high-scoring matches, and push them to Telegram for manual review.

Single-user, local-first. Not SaaS.

## Stack

Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · Postgres 17 + pgvector · Drizzle ORM · BullMQ + Redis · Playwright · Anthropic (Haiku + Sonnet) · pnpm workspace monorepo.

## Quickstart

Prerequisites: Node 22 LTS (`nvm use`), pnpm 11 (`corepack enable pnpm`), Docker.

```bash
pnpm install
cp .env.example .env          # edit secrets later
pnpm db:up                    # postgres + redis in docker
pnpm db:migrate               # apply schema
pnpm dev                      # web on :3000 + worker
```

Then `curl http://127.0.0.1:3000/api/health` → `{"db":"ok","redis":"ok",...}`.

Full walkthrough: [`docs/operations/local-setup.md`](docs/operations/local-setup.md).

## Where to read next

- [`AGENTS.md`](AGENTS.md) — entry point for anyone (human or LLM) working in this repo
- [`DESIGN.md`](DESIGN.md) — source-of-truth design
- [`docs/roadmap.md`](docs/roadmap.md) — phase status
- [`docs/README.md`](docs/README.md) — full docs index
