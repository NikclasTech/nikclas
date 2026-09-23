import { describe, expect, it } from "vitest";
import modelsJson from "../../data/models.json";
import pricingJson from "../../data/pricing.json";
import providersJson from "../../data/providers.json";
import { validateChange, validateDataset } from "./validate";
import type {
  ModelEntry,
  PriceChange,
  PricingRow,
  ProviderEntry,
} from "./types";

const providers = providersJson as ProviderEntry[];
const models = modelsJson as ModelEntry[];
// JSON imports widen string literals; narrow back to the row shape.
const pricing = pricingJson as unknown as PricingRow[];

function change(overrides: Partial<PriceChange>): PriceChange {
  return {
    provider: "Anthropic",
    model: "m",
    type: "input",
    previous: 3,
    current: 2.5,
    currency: "USD",
    source: "https://api.litellm.ai/model_catalog/m",
    detectedAt: "2026-09-22",
    anomaly: false,
    kind: "changed",
    ...overrides,
  };
}

describe("validateDataset", () => {
  it("accepts the versioned dataset without errors", () => {
    expect(validateDataset(providers, models, pricing)).toEqual([]);
  });

  it("rejects negative prices", () => {
    const bad = [{ ...pricing[0], price_per_1m: -1 }];
    const codes = validateDataset(providers, models, bad).map((i) => i.code);
    expect(codes).toContain("pricing-negative");
  });

  it("allows zero prices (free tiers exist)", () => {
    const free = [{ ...pricing[0], price_per_1m: 0 }];
    expect(validateDataset(providers, models, free)).toEqual([]);
  });

  it("rejects models with unknown providers", () => {
    const bad = [{ ...models[0], provider: "nope" }];
    const codes = validateDataset(providers, bad, pricing).map((i) => i.code);
    expect(codes).toContain("model-unknown-provider");
  });

  it("rejects models with missing or non-boolean capabilities", () => {
    const { capabilities: _drop, ...withoutCaps } = models[0];
    void _drop;
    const missing = validateDataset(
      providers,
      [withoutCaps] as unknown as ModelEntry[],
      pricing,
    ).map((i) => i.code);
    expect(missing).toContain("model-bad-capabilities");
    const notBool = [
      { ...models[0], capabilities: { ...models[0].capabilities, vision: "yes" } },
    ];
    const badType = validateDataset(
      providers,
      notBool as unknown as ModelEntry[],
      pricing,
    ).map((i) => i.code);
    expect(badType).toContain("model-bad-capabilities");
  });

  it("rejects duplicate models and duplicate pricing rows", () => {
    const dupModels = [...models, models[0]];
    expect(validateDataset(providers, dupModels, pricing).map((i) => i.code)).toContain(
      "model-duplicate",
    );
    const dupPricing = [...pricing, pricing[0]];
    expect(validateDataset(providers, models, dupPricing).map((i) => i.code)).toContain(
      "pricing-duplicate",
    );
  });

  it("rejects bad currency, dates, urls, types and missing fields", () => {
    const bad = [
      { ...pricing[0], currency: "EUR" },
      { ...pricing[1], updated_at: "22/09/2026" },
      { ...pricing[2], source: "not-a-url" },
      { ...pricing[3], type: "cached" },
      { model: "ghost", type: "input" },
    ];
    const codes = validateDataset(
      providers,
      models,
      bad as unknown as PricingRow[],
    ).map((i) => i.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        "pricing-bad-currency",
        "pricing-bad-date",
        "pricing-bad-url",
        "pricing-bad-type",
        "pricing-missing-field",
      ]),
    );
  });
});

describe("validateChange", () => {
  it("warns on extreme jumps like $3 -> $300", () => {
    const issues = validateChange(change({ previous: 3, current: 300, anomaly: true }));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ severity: "warning", code: "pricing-anomaly" });
  });

  it("stays quiet on ordinary moves like $3 -> $2.50", () => {
    expect(validateChange(change({ previous: 3, current: 2.5 }))).toEqual([]);
  });
});
