// Placeholder — deterministic scoring functions land in Phase 1.2.
// Real impl: competition.ts, client-quality.ts, economic.ts, final.ts

export * from "./weights.js";

export type ScoreBreakdown = {
  cvMatch: number;
  skillsMatch: number;
  competitionScore: number;
  clientQuality: number;
  economicScore: number;
  freshnessScore: number;
  finalScore: number;
};
