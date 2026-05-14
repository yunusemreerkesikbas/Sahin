// Scoring weights — see docs/architecture/scoring-algorithm.md for tuning history.
// Tuned in Phase 1.2 based on initial feedback dataset.

export const SCORE_WEIGHTS = {
  cvMatch: 0.3,
  skillsMatch: 0.2,
  competitionScore: 0.2,
  clientQuality: 0.15,
  economicScore: 0.1,
  freshnessScore: 0.05,
} as const;

export const ACTION_THRESHOLDS = {
  push: 75,
  highlight: 60,
} as const;

export type ScoreDimension = keyof typeof SCORE_WEIGHTS;
