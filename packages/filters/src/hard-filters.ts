// Hard filters — applied BEFORE any LLM call to control cost.
// Tuned in Phase 1.1 against real Armut/Upwork data.
// See docs/architecture/data-flow.md for where in the pipeline this runs.

export const HARD_FILTERS = {
  upwork: {
    minBudget: 200,
    maxProposals: 50,
    requireClientPaymentVerified: true,
    minClientHireRate: 0.1,
    keywordBlacklist: ["lowest rates", "cheapest", "urgent budget"],
    requireUserHasConnects: true,
  },
  armut: {
    maxBidFee: 500,
    requireCategoryMatch: true,
  },
  global: {
    maxAgeHours: 24,
    excludeAlreadyApplied: true,
    excludeAlreadyRejected: true,
  },
} as const;
