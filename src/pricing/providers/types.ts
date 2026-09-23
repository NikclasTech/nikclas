import type { Capabilities } from "../types";

/** A pricing source. One implementation per origin (LiteLLM catalog,
 *  official provider pages, ...). New providers only need to implement
 *  this interface and register in ./index. */
export type ModelPricing = {
  /** Catalog id, e.g. "gpt-4o-mini" or "zai/glm-5.3". */
  model: string;
  /** USD per 1M tokens. */
  inputPer1M: number;
  /** USD per 1M tokens. */
  outputPer1M: number;
  contextTokens: number;
  /** Raw provider id as reported by the source. */
  provider: string;
  /** URL the row was fetched from. */
  source: string;
  /** Developer-facing capabilities. */
  capabilities: Capabilities;
};

export interface PricingProvider {
  readonly name: string;
  fetchPricing(): Promise<ModelPricing[]>;
}
