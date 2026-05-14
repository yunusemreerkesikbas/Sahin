# Operations — Playwright auth

> Status: placeholder — implementation lands in Phase 1.1 (Armut) and 1.3 (Upwork).

## Why this exists

Both Armut and Upwork gate their job listings behind a login. Headless login is fragile (captchas, MFA, anti-bot heuristics) and rude. Şahin takes a different approach:

1. **One-time headed login** — you log in by hand in a Chromium window the worker pops up.
2. **Save `storageState`** — Playwright dumps cookies + localStorage to a JSON file in `data/auth/`.
3. **Headless re-use** — every subsequent scrape loads the storageState and runs headless. No captcha, no flag, no daily login.

## Setup commands

```bash
pnpm setup:armut    # opens chromium → log in → close → file saved
pnpm setup:upwork
```

Each command:

- Launches a headed Chromium via Playwright
- Navigates to the platform's login page
- Waits for you to complete login (including any MFA / 2FA)
- Saves `data/auth/<platform>-state.json`
- Exits

## File locations

- `data/auth/armut-state.json`
- `data/auth/upwork-state.json`

Both are gitignored. `data/auth/.gitkeep` ensures the folder is committed.

## Session expiry

Sessions typically last weeks for Armut, days-to-weeks for Upwork. When a scrape detects the login wall instead of job listings, the worker:

- Marks the session stale in `meta` of the failing scrape
- Skips further scrapes for that platform until you re-run `pnpm setup:<platform>`
- Surfaces the state via `/api/health` (Phase 1.4)

## What to do when you see the login wall

```bash
# re-run setup for the affected platform
pnpm setup:armut

# the worker auto-resumes once the storageState file is fresh
```

## Phase 1.1 implementation note

The implementation will live in `apps/worker/src/scripts/setup-armut.ts` and reuse a shared helper in `packages/scrapers/src/session.ts`. Headless flag, user agent, viewport, and politeness delays are owned by `packages/scrapers/src/politeness.ts`.
