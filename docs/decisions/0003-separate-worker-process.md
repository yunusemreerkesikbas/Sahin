# 0003 — Separate worker process (not Next.js instrumentation)

- **Status**: accepted
- **Date**: 2026-05-13

## Context

Background work — Playwright scraping every 20 minutes, LLM eval, Telegram notify — needs to run alongside the web UI. Two ways to wire it up:

1. **Inside Next.js** via `instrumentation.ts` or a singleton in `app/`.
2. **Outside Next.js** as a standalone Node process.

Playwright's persistent browser context (used to keep storageState alive) does not survive Next.js dev hot-reload reliably — each reload risks an orphaned browser, leaked file descriptors, or a session-locking race. BullMQ workers exhibit similar issues when their owning module is reloaded.

## Decision

Run the worker as a **separate Node process** under `apps/worker/`, executed by `tsx watch` in dev and `tsx` in prod. The web process is the Next.js server; the worker is its own thing. Both talk to the same Postgres and Redis.

## Consequences

- Easy: Playwright sessions live until the process actually exits. BullMQ workers attach exactly once. Dev hot-reload of the web app doesn't touch background work.
- Easy: independent restart and deploy paths. You can ship a UI fix without bouncing the scraper.
- Harder: two processes to start in development — handled via `pnpm dev` running both in parallel.
- Harder: shared boot-time concerns (env loading, DB / Redis ping) are duplicated. Mitigated by `packages/shared`.
- Follow-up: when we move to a VPS, the two processes deploy as separate systemd / Docker services. PM2 or `node --watch` are alternatives for hot-reload if `tsx` proves slow.
