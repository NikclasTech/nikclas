import { afterEach, describe, expect, it, vi } from "vitest";
import { MODELS } from "../../lib/litellm";
import { LitellmProvider, parseCatalogEntry } from "./litellm";

describe("parseCatalogEntry", () => {
  it("scales per-token costs to $/1M", () => {
    expect(
      parseCatalogEntry("gpt-4o-mini", {
        input_cost_per_token: 1.5e-7,
        output_cost_per_token: 6e-7,
        max_input_tokens: 128000,
        provider: "openai",
      }),
    ).toEqual({
      model: "gpt-4o-mini",
      inputPer1M: 0.15,
      outputPer1M: 0.6,
      contextTokens: 128000,
      provider: "openai",
      source: "https://api.litellm.ai/model_catalog/gpt-4o-mini",
    });
  });

  it("rounds float dust produced by per-token scaling", () => {
    const got = parseCatalogEntry("m", {
      input_cost_per_token: 1.1e-6,
      output_cost_per_token: 2.2e-6,
      max_input_tokens: 100,
      provider: "p",
    });
    expect(got.inputPer1M).toBe(1.1);
    expect(got.outputPer1M).toBe(2.2);
  });

  it("URL-encodes ids with slashes in the source", () => {
    const got = parseCatalogEntry("zai/glm-5.3", {
      input_cost_per_token: 1.4e-6,
      output_cost_per_token: 4.4e-6,
      max_input_tokens: 1000000,
      provider: "zai",
    });
    expect(got.source).toBe("https://api.litellm.ai/model_catalog/zai%2Fglm-5.3");
  });

  it("throws when pricing is missing", () => {
    expect(() =>
      parseCatalogEntry("m", {
        input_cost_per_token: null,
        output_cost_per_token: 4e-6,
        max_input_tokens: 100,
        provider: "p",
      }),
    ).toThrow(/no pricing data for m/);
  });
});

describe("LitellmProvider.fetchPricing", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches every catalog model and maps the entries", async () => {
    const seen: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        seen.push(url);
        return {
          ok: true,
          json: async () => ({
            input_cost_per_token: 1e-6,
            output_cost_per_token: 2e-6,
            max_input_tokens: 1000,
            provider: "test",
          }),
        };
      }),
    );

    const rows = await new LitellmProvider().fetchPricing();

    expect(rows).toHaveLength(MODELS.length);
    expect(rows[0]).toMatchObject({ model: MODELS[0].id, inputPer1M: 1, outputPer1M: 2 });
    expect(seen).toHaveLength(MODELS.length);
    expect(seen[0]).toContain("/model_catalog/");
  });

  it("fails fast on HTTP errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 429 })),
    );
    await expect(new LitellmProvider().fetchPricing()).rejects.toThrow(/litellm 429/);
  });
});
