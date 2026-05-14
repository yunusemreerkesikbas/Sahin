# Architecture — LLM pipeline

> Status: placeholder — full prompts land in Phase 1.2.

## Two-tier eval

The pipeline calls Anthropic twice per job in the worst case, three times if a proposal is generated:

1. **Haiku screen** — `claude-haiku-4-5`. Very short prompt. Drops obvious mismatches before paying for Sonnet.
2. **Sonnet deep eval** — `claude-sonnet-4-6`. Full CV + job + structured JSON output.
3. **Sonnet proposal** — only when `final_score ≥ proposal_threshold`. Language-matched draft + suggested rate.

Why two tiers: scraping yields ~50–150 jobs/day across both platforms. Sonnet at full eval is expensive; Haiku at $1/M input tokens is ~10× cheaper. Filtering ~80% of jobs at the Haiku stage keeps daily cost under ~$0.40, well within the $12/mo target.

## Prompt locations

All prompts live as plain `.txt` files in `packages/llm/src/prompts/` and are read at runtime:

- `screen-haiku.txt` — Haiku screen prompt
- `eval-sonnet.txt` — Sonnet deep eval prompt (returns JSON)
- `proposal-sonnet.txt` — Sonnet proposal draft prompt

Keeping prompts as files (not template literals) makes diffs reviewable and allows hot-swapping without a deploy.

## Output schemas

Each LLM call has a `zod` schema for the response (defined in `packages/llm/src/schemas/`). Invalid responses are retried once with a clarifying message; second failure → log + drop with `status: 'eval_failed'`.

## Cost tracking

Every Anthropic call writes a row to `evaluations` with:

- `input_tokens`, `output_tokens`
- `model` (full ID)
- `cost_usd` (computed from token counts × model price table)
- `latency_ms`

Daily aggregates surface in `docs/operations/cost-monitoring.md` and the Settings page (Phase 1.4).

## Configuration

Model IDs come from env (so swapping a model is one config change, no code change):

```env
ANTHROPIC_MODEL_HAIKU=claude-haiku-4-5-20251001
ANTHROPIC_MODEL_SONNET=claude-sonnet-4-6
```

The `ANTHROPIC_API_KEY` is required at worker boot — `packages/shared/src/env.ts` throws if missing.
