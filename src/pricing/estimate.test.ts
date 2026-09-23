import { describe, expect, it } from "vitest";
import { estimateMonthlyCost, rankByMonthlyCost } from "./estimate";

describe("estimateMonthlyCost", () => {
  it("multiplies $/1M prices by monthly usage in M tokens", () => {
    // 10M in at $0.15 + 2M out at $0.60 = $1.50 + $1.20.
    expect(estimateMonthlyCost(0.15, 0.6, 10, 2)).toEqual({ monthly: 2.7, daily: 0.09 });
  });

  it("returns zeros for zero usage", () => {
    expect(estimateMonthlyCost(15, 75, 0, 0)).toEqual({ monthly: 0, daily: 0 });
  });

  it("clamps negative inputs to zero", () => {
    expect(estimateMonthlyCost(-1, 0.6, 10, -2).monthly).toBe(0);
  });
});

describe("rankByMonthlyCost", () => {
  const models = [
    { id: "pricey", name: "pricey", input: 15, output: 75 },
    { id: "cheap", name: "cheap", input: 0.15, output: 0.6 },
    { id: "mid", name: "mid", input: 2.5, output: 10 },
  ];

  it("sorts cheapest first", () => {
    const ranked = rankByMonthlyCost(models, 10, 2);
    expect(ranked.map((r) => r.id)).toEqual(["cheap", "mid", "pricey"]);
    expect(ranked[0].monthly).toBe(2.7);
  });
});
