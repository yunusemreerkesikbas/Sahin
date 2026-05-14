// Placeholder — Anthropic SDK wrapper, prompt loader, cost tracking land in Phase 1.2.
// See docs/architecture/llm-pipeline.md for design.

export const LLM_PACKAGE_VERSION = "0.1.0-placeholder";

export type LlmCallMetadata = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
};
