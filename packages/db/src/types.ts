import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  evaluations,
  feedback,
  jobs,
  proposals,
  userProfile,
} from "./schema.js";

export type UserProfile = InferSelectModel<typeof userProfile>;
export type NewUserProfile = InferInsertModel<typeof userProfile>;

export type Job = InferSelectModel<typeof jobs>;
export type NewJob = InferInsertModel<typeof jobs>;

export type Evaluation = InferSelectModel<typeof evaluations>;
export type NewEvaluation = InferInsertModel<typeof evaluations>;

export type Proposal = InferSelectModel<typeof proposals>;
export type NewProposal = InferInsertModel<typeof proposals>;

export type Feedback = InferSelectModel<typeof feedback>;
export type NewFeedback = InferInsertModel<typeof feedback>;
