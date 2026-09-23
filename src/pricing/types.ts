/** Shared shapes for the versioned pricing dataset in data/. */

export type PriceType = "input" | "output";

export type PricingRow = {
  model: string;
  type: PriceType;
  price_per_1m: number;
  currency: string;
  source: string;
  updated_at: string;
};

export type ProviderEntry = {
  id: string;
  name: string;
  website: string;
  pricing_url: string | null;
};

export type Capabilities = {
  function_calling: boolean;
  vision: boolean;
  structured_output: boolean;
  prompt_caching: boolean;
};

export type ModelEntry = {
  id: string;
  name: string;
  provider: string;
  context_tokens: number;
  capabilities: Capabilities;
};

export type ChangeKind = "changed" | "added" | "removed";

export type PriceChange = {
  provider: string;
  model: string;
  type: PriceType;
  previous: number | null;
  current: number | null;
  currency: string;
  source: string;
  detectedAt: string;
  anomaly: boolean;
  kind: ChangeKind;
};

export type ValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};
