# 0001 — Monorepo with pnpm workspaces

- **Status**: accepted
- **Date**: 2026-05-13

## Context

Şahin has two long-lived runtimes (Next.js web, Node worker) that share a typed schema, an env loader, scoring logic, scraping helpers, an LLM client, and a notifier. A polyrepo would force us to publish private packages or duplicate code. A flat single-app layout would conflate the worker with the web server and tangle Playwright lifecycle with Next.js hot-reload.

## Decision

Use a **pnpm workspace monorepo** with `apps/web`, `apps/worker`, and shared code under `packages/*`. Path aliases (`@sahin/db`, `@sahin/shared`, …) resolve directly to `packages/*/src/index.ts` via `tsconfig.base.json` `paths`.

## Consequences

- Easy: shared types and helpers, single lockfile, single `pnpm install`, atomic refactors across boundaries.
- Harder: TS path aliases require matching config in every consumer (web, worker, packages). `noEmit` everywhere; runtime resolution is done by Next.js / `tsx`, not pre-compiled JS.
- Follow-up: revisit if a package needs to be published or consumed by an external repo — at that point promote it to its own published package.
