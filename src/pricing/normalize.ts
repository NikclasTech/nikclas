import type { ModelPricing } from "./providers/types";
import type { PricingRow } from "./types";

export const PRICING_CURRENCY = "USD";

/** Expand collector output into one row per (model, input|output).
 *  Pure: unit-tested. */
export function normalizePricing(entries: ModelPricing[], updatedAt: string): PricingRow[] {
  return entries.flatMap((e): PricingRow[] => [
    {
      model: e.model,
      type: "input",
      price_per_1m: e.inputPer1M,
      currency: PRICING_CURRENCY,
      source: e.source,
      updated_at: updatedAt,
    },
    {
      model: e.model,
      type: "output",
      price_per_1m: e.outputPer1M,
      currency: PRICING_CURRENCY,
      source: e.source,
      updated_at: updatedAt,
    },
  ]);
}
