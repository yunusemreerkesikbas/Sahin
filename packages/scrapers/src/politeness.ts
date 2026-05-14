// Polite scraping rules — code-level constants, NOT user-tunable.
// Reduces ban risk and respects platform terms.

export const POLITENESS = {
  armut: {
    pollIntervalMinutes: 20,
    delayBetweenRequestsMs: { min: 3000, max: 7000 },
    detailFetchProbability: 0.3,
    maxDetailsPerPoll: 5,
  },
  upwork: {
    pollIntervalMinutes: 20,
    delayBetweenRequestsMs: { min: 5000, max: 12000 },
    detailFetchProbability: 0.2,
    maxDetailsPerPoll: 3,
  },
} as const;
