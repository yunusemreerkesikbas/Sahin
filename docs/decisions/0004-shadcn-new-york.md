# 0004 — shadcn/ui with New York style + Neutral base color

- **Status**: accepted
- **Date**: 2026-05-13

## Context

The dashboard is a tool for one person (the developer) — not a marketing surface. We want a fast path to a usable UI, dark mode, accessible primitives, and zero design debate. shadcn/ui ships React components that are copied into the repo (not a black-box dep), wraps Radix primitives, and integrates cleanly with Tailwind v4.

shadcn ships several styles. The choice came down to:

- **Default** — slightly playful, more rounded
- **New York** — flatter, denser, more business-y

And several base colors (Neutral, Stone, Zinc, Gray, Slate). The differences are subtle but visible.

## Decision

Use shadcn/ui with `style: new-york` and `baseColor: neutral`. Tailwind v4 CSS variable approach (`cssVariables: true`). Components live under `apps/web/components/ui/`. App-specific composed components live under `apps/web/components/app/`.

## Consequences

- Easy: copy-paste components from the shadcn registry as we need them. No design system review needed.
- Easy: dark mode out of the box via `next-themes` + the `dark` class strategy.
- Harder: we own the component source. Upgrades are manual (run `pnpm dlx shadcn add <component> --overwrite`).
- Follow-up: if the design ever needs to be visually distinctive (Phase 2 outreach surfaces shown to clients), revisit the theme then. For Phase 1.x, density and clarity win.
