# Şahin — Documentation

Living docs for the project. The top-level entry points are `AGENTS.md` (for any agent picking up work) and `DESIGN.md` (source-of-truth design). This folder dives deeper.

## Map

### Start here

- [`roadmap.md`](roadmap.md) — phase-by-phase status

### Architecture

- [`architecture/overview.md`](architecture/overview.md) — system diagram, components, processes
- [`architecture/data-flow.md`](architecture/data-flow.md) — job lifecycle (scrape → score → notify)
- [`architecture/scoring-algorithm.md`](architecture/scoring-algorithm.md) — weights, thresholds, tuning log
- [`architecture/llm-pipeline.md`](architecture/llm-pipeline.md) — two-tier eval, prompt design, cost

### Operations

- [`operations/local-setup.md`](operations/local-setup.md) — full quickstart on a fresh clone
- [`operations/playwright-auth.md`](operations/playwright-auth.md) — how `setup:armut` / `setup:upwork` work
- [`operations/cost-monitoring.md`](operations/cost-monitoring.md) — daily LLM spend report
- [`operations/troubleshooting.md`](operations/troubleshooting.md) — common errors and fixes

### Decisions

- [`decisions/template.md`](decisions/template.md) — ADR template
- [`decisions/0001-monorepo-pnpm.md`](decisions/0001-monorepo-pnpm.md)
- [`decisions/0002-postgres-pgvector.md`](decisions/0002-postgres-pgvector.md)
- [`decisions/0003-separate-worker-process.md`](decisions/0003-separate-worker-process.md)
- [`decisions/0004-shadcn-new-york.md`](decisions/0004-shadcn-new-york.md)

## Conventions

- Markdown only. No HTML soup.
- Internal links use relative paths so they work in any markdown viewer.
- Architecture docs are descriptive (how it works *today*). When the design changes, update them before merging.
- ADRs are immutable once accepted. To revise, write a new ADR that supersedes the old one.
