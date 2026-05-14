# Operations — cost monitoring

> Status: placeholder — concrete dashboard lands in Phase 1.2.

## Budget target

~$12/month total Anthropic spend, across Haiku screens, Sonnet deep evals, and Sonnet proposals.

## Where cost is logged

Every Anthropic call writes a row to `evaluations` with `input_tokens`, `output_tokens`, `model`, `cost_usd`, and `latency_ms`. Failed calls still log cost (you pay for partial completions). See [`../architecture/llm-pipeline.md`](../architecture/llm-pipeline.md) for the schema.

## Reading daily spend

Phase 1.2 adds:

- A SQL view `daily_llm_cost` summing cost by model + day
- A card on the dashboard (`/dashboard`) showing today / 7-day / 30-day totals
- A worker job that warns to the Telegram bot when the rolling 30-day cost exceeds 80% of budget

Until 1.2 lands, you can query the table directly:

```sql
select
  date_trunc('day', created_at) as day,
  model,
  sum(input_tokens) as in_t,
  sum(output_tokens) as out_t,
  round(sum(cost_usd)::numeric, 4) as usd
from evaluations
where created_at > now() - interval '30 days'
group by 1, 2
order by 1 desc, 2;
```

## When you see unexpected cost

Likely causes, in order:

1. **Prompts grew** — check `packages/llm/src/prompts/*.txt` for recent edits; long system prompts compound across calls.
2. **Haiku threshold too low** — too many jobs pass to Sonnet. Bump the threshold in `packages/scoring/src/weights.ts`.
3. **Retry storm** — a malformed schema means every job retries once. Check error rate in `evaluations`.
4. **Scrape volume spike** — a new platform onboarding or a busy posting day. Lower the polite cap in `packages/scrapers/src/politeness.ts`.
