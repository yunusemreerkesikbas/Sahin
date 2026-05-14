# Architecture — scoring algorithm

> Status: placeholder — concrete formulas land in Phase 1.2.

## Goal

Convert each job's Sonnet evaluation + rule-based signals into a single `final_score ∈ [0, 1]` that ranks jobs by "likely worth applying."

## Dimensions

| Dimension        | Source                  | Range  | Notes                                              |
|------------------|-------------------------|--------|----------------------------------------------------|
| `cv_match`       | Sonnet (1.2) → vec (1.5)| 0–1    | Semantic match between job description and CV      |
| `skills_match`   | Sonnet + rule           | 0–1    | Overlap of required skills with user skill list    |
| `competition`    | Rule (proposal count)   | 0–1    | More proposals → lower score                       |
| `client_quality` | Rule (hire rate, verif) | 0–1    | Upwork only in 1.2; Armut Pro has limited signal   |
| `economic`       | Rule (budget / rate)    | 0–1    | Budget ≥ user's rate × estimated hours → high      |
| `freshness`      | Rule (now − posted_at)  | 0–1    | Exponential decay, half-life ~6 hours              |

## Final score (Phase 1.2 starting point)

```
final = (
    w_cv     × cv_match
  + w_skills × skills_match
  + w_comp   × competition
  + w_client × client_quality
  + w_econ   × economic
  + w_fresh  × freshness
)
```

Initial weights (to be tuned via feedback in 1.5):

```
w_cv     = 0.30
w_skills = 0.20
w_comp   = 0.10
w_client = 0.15
w_econ   = 0.15
w_fresh  = 0.10
```

All `w_*` are non-negative and sum to 1.

## Thresholds

- **Haiku gate** — Haiku screen score ≥ 6 → run Sonnet
- **Proposal gate** — `final_score ≥ 0.65` → generate proposal draft + notify

Both thresholds live in `packages/scoring/src/weights.ts` so they can be tuned without a deploy.

## Tuning log

Append a new entry whenever weights or thresholds change. Format: date, change, reason.

| Date       | Change      | Reason                  |
|------------|-------------|-------------------------|
| 2026-05-13 | initial set | Phase 1.0 placeholder.  |

## Future (Phase 1.5)

- Replace LLM-judged `cv_match` with pgvector cosine on CV/job embeddings (cheaper, more deterministic).
- Train weight tuning from `feedback` rows: jobs where the user marked "interested" / "sent" / "hired" should retrospectively score higher.
- Add a "diversity bonus" so similar high-score jobs don't crowd out the notification queue.
