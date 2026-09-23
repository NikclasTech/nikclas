/** Monthly cost math. Pure: unit-tested. */

export type CostEstimate = {
  monthly: number;
  daily: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Monthly bill from $/1M prices and monthly usage in M tokens. */
export function estimateMonthlyCost(
  inputPer1M: number,
  outputPer1M: number,
  inputMTokens: number,
  outputMTokens: number,
): CostEstimate {
  const monthly =
    Math.max(0, inputPer1M) * Math.max(0, inputMTokens) +
    Math.max(0, outputPer1M) * Math.max(0, outputMTokens);
  return { monthly: round2(monthly), daily: round2(monthly / 30) };
}

export type RankedModel = {
  id: string;
  name: string;
  monthly: number;
};

/** Every model ranked by monthly bill, cheapest first. */
export function rankByMonthlyCost(
  models: { id: string; name: string; input: number; output: number }[],
  inputMTokens: number,
  outputMTokens: number,
): RankedModel[] {
  return models
    .map((m) => ({
      id: m.id,
      name: m.name,
      monthly: estimateMonthlyCost(m.input, m.output, inputMTokens, outputMTokens).monthly,
    }))
    .sort((a, b) => a.monthly - b.monthly);
}
