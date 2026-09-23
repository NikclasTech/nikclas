import { describe, expect, it } from "vitest";
import { diffPricing, formatChangesMarkdown, isAnomaly, mergeFreshPrices } from "./changes";
import type { PricingRow } from "./types";

function row(model: string, type: "input" | "output", price: number): PricingRow {
  return {
    model,
    type,
    price_per_1m: price,
    currency: "USD",
    source: `https://api.litellm.ai/model_catalog/${model}`,
    updated_at: "2026-09-22",
  };
}

const providerOf = () => "Anthropic";

describe("isAnomaly", () => {
  it("flags 3x jumps in either direction", () => {
    expect(isAnomaly(3, 300)).toBe(true);
    expect(isAnomaly(3, 9)).toBe(true);
    expect(isAnomaly(3, 1)).toBe(true);
  });

  it("ignores ordinary moves and missing baselines", () => {
    expect(isAnomaly(3, 2.5)).toBe(false);
    expect(isAnomaly(3, 5.99)).toBe(false);
    expect(isAnomaly(0, 5)).toBe(false);
  });
});

describe("diffPricing", () => {
  it("detects input and output moves with provider and source", () => {
    const prev = [row("m", "input", 3), row("m", "output", 15)];
    const next = [row("m", "input", 2.5), row("m", "output", 12)];
    const changes = diffPricing(prev, next, "2026-09-23", providerOf);
    expect(changes).toHaveLength(2);
    expect(changes[0]).toMatchObject({
      provider: "Anthropic",
      model: "m",
      type: "input",
      previous: 3,
      current: 2.5,
      anomaly: false,
      kind: "changed",
    });
  });

  it("returns no changes when prices are identical", () => {
    const rows = [row("m", "input", 3)];
    expect(diffPricing(rows, [...rows], "2026-09-23", providerOf)).toEqual([]);
  });

  it("reports added and removed rows", () => {
    const changes = diffPricing([], [row("new", "input", 1)], "2026-09-23", providerOf);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ kind: "added", previous: null });
  });
});

describe("mergeFreshPrices", () => {
  it("keeps the original date on untouched rows", () => {
    const prev = [row("m", "input", 3)];
    const { merged, warnings } = mergeFreshPrices(prev, [{ ...row("m", "input", 3), updated_at: "2026-09-23" }]);
    expect(merged).toEqual(prev);
    expect(warnings).toEqual([]);
  });

  it("takes the new row when the price moved", () => {
    const { merged } = mergeFreshPrices([row("m", "input", 3)], [row("m", "input", 2.5)]);
    expect(merged[0].price_per_1m).toBe(2.5);
  });

  it("keeps last-known rows with a warning for missing models", () => {
    const prev = [row("gone", "input", 3)];
    const { merged, warnings } = mergeFreshPrices(prev, []);
    expect(merged).toEqual(prev);
    expect(warnings).toEqual([
      { model: "gone", message: "no live data for gone; kept last-known prices" },
    ]);
  });

  it("appends brand-new models at the end", () => {
    const { merged, warnings } = mergeFreshPrices([row("old", "input", 3)], [row("old", "input", 3), row("new", "input", 1)]);
    expect(merged.map((r) => r.model)).toEqual(["old", "new"]);
    expect(warnings).toEqual([]);
  });
});

describe("formatChangesMarkdown", () => {
  it("renders a readable summary with amounts", () => {
    const body = formatChangesMarkdown(
      diffPricing(
        [row("m", "input", 3), row("m", "output", 15)],
        [row("m", "input", 2.5), row("m", "output", 12)],
        "2026-09-23",
        providerOf,
      ),
    );
    expect(body).toContain("Anthropic");
    expect(body).toContain("m");
    expect(body).toContain("$3.00");
    expect(body).toContain("$2.50");
    expect(body).not.toContain("WARNING");
  });

  it("adds a warning banner for anomalies", () => {
    const body = formatChangesMarkdown(
      diffPricing([row("m", "input", 3)], [row("m", "input", 300)], "2026-09-23", providerOf),
    );
    expect(body).toContain("WARNING");
    expect(body).toContain("ANOMALY");
  });

  it("reports calmly when nothing changed", () => {
    expect(formatChangesMarkdown([])).toBe("No changes detected.");
  });
});
