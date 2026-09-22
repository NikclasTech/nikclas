import { LITELLM_API, MODELS } from "../../lib/litellm";
import type { ModelPricing, PricingProvider } from "./types";

export type CatalogEntry = {
  input_cost_per_token: number | null;
  output_cost_per_token: number | null;
  max_input_tokens: number | null;
  provider: string | null;
};

/** Round to 6 decimals to avoid float dust from per-token scaling. */
export function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/** Map one LiteLLM catalog entry to our pricing shape. Pure: unit-tested. */
export function parseCatalogEntry(model: string, entry: CatalogEntry): ModelPricing {
  if (entry.input_cost_per_token == null || entry.output_cost_per_token == null) {
    throw new Error(`no pricing data for ${model}`);
  }
  return {
    model,
    inputPer1M: round6(entry.input_cost_per_token * 1_000_000),
    outputPer1M: round6(entry.output_cost_per_token * 1_000_000),
    contextTokens: entry.max_input_tokens ?? 0,
    provider: entry.provider ?? "unknown",
    source: `${LITELLM_API}/model_catalog/${encodeURIComponent(model)}`,
  };
}

/** Collector for the LiteLLM Model Catalog API (free tier, no key).
 *  Requests run sequentially to stay polite with the 100 req/day quota. */
export class LitellmProvider implements PricingProvider {
  readonly name = "litellm";

  async fetchPricing(): Promise<ModelPricing[]> {
    const out: ModelPricing[] = [];
    for (const m of MODELS) {
      const res = await fetch(`${LITELLM_API}/model_catalog/${encodeURIComponent(m.id)}`);
      if (!res.ok) {
        throw new Error(`litellm ${res.status} for ${m.id}`);
      }
      out.push(parseCatalogEntry(m.id, (await res.json()) as CatalogEntry));
    }
    return out;
  }
}
