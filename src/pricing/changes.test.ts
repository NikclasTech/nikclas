import { describe, expect, it } from "vitest";
import { diffPricing, formatChangesMarkdown, isAnomaly } from "./changes";
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
