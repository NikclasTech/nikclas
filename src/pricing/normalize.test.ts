import { describe, expect, it } from "vitest";
import { normalizePricing } from "./normalize";
import type { ModelPricing } from "./providers/types";

const entry: ModelPricing = {
  model: "gpt-4o-mini",
  inputPer1M: 0.15,
  outputPer1M: 0.6,
  contextTokens: 128000,
  provider: "openai",
  source: "https://api.litellm.ai/model_catalog/gpt-4o-mini",
  capabilities: {
    function_calling: true,
    vision: true,
    structured_output: true,
    prompt_caching: true,
  },
};

describe("normalizePricing", () => {
  it("expands one input and one output row per model", () => {
    const rows = normalizePricing([entry], "2026-09-22");
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.type)).toEqual(["input", "output"]);
    expect(rows[0]).toMatchObject({ model: "gpt-4o-mini", price_per_1m: 0.15 });
    expect(rows[1]).toMatchObject({ model: "gpt-4o-mini", price_per_1m: 0.6 });
  });

  it("stamps currency, source and detection date on every row", () => {
    const rows = normalizePricing([entry], "2026-09-22");
    for (const row of rows) {
      expect(row.currency).toBe("USD");
      expect(row.source).toBe(entry.source);
      expect(row.updated_at).toBe("2026-09-22");
    }
  });
});
