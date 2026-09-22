import type {
  ModelEntry,
  PriceChange,
  PricingRow,
  ProviderEntry,
  ValidationIssue,
} from "./types";

export const VALID_CURRENCIES = ["USD"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(s: string): boolean {
  return DATE_RE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function err(code: string, message: string): ValidationIssue {
  return { severity: "error", code, message };
}

/** Validate the static dataset. Pure: unit-tested. */
export function validateDataset(
  providers: ProviderEntry[],
  models: ModelEntry[],
  pricing: PricingRow[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const providerIds = new Set<string>();
  for (const p of providers) {
    if (!p.id || !p.name || !p.website) {
      issues.push(err("provider-missing-field", `provider missing required field: ${JSON.stringify(p)}`));
      continue;
    }
    if (providerIds.has(p.id)) {
      issues.push(err("provider-duplicate", `duplicate provider: ${p.id}`));
    }
    providerIds.add(p.id);
    if (!isValidUrl(p.website)) {
      issues.push(err("provider-bad-url", `invalid website URL for provider ${p.id}: ${p.website}`));
    }
    if (p.pricing_url != null && !isValidUrl(p.pricing_url)) {
      issues.push(err("provider-bad-url", `invalid pricing URL for provider ${p.id}: ${p.pricing_url}`));
    }
  }

  const modelIds = new Set<string>();
  for (const m of models) {
    if (!m.id || !m.name || !m.provider || !(m.context_tokens > 0)) {
      issues.push(err("model-missing-field", `model missing required field: ${JSON.stringify(m)}`));
      continue;
    }
    if (modelIds.has(m.id)) {
      issues.push(err("model-duplicate", `duplicate model: ${m.id}`));
    }
    modelIds.add(m.id);
    if (!providerIds.has(m.provider)) {
      issues.push(err("model-unknown-provider", `model ${m.id} references unknown provider: ${m.provider}`));
    }
  }

  const seen = new Set<string>();
  for (const r of pricing) {
    if (!r.model || !r.type || r.price_per_1m == null || !r.currency || !r.source || !r.updated_at) {
      issues.push(err("pricing-missing-field", `pricing row missing required field: ${JSON.stringify(r)}`));
      continue;
    }
    if (r.type !== "input" && r.type !== "output") {
      issues.push(err("pricing-bad-type", `invalid price type for ${r.model}: ${r.type}`));
    }
    if (typeof r.price_per_1m !== "number" || !Number.isFinite(r.price_per_1m) || r.price_per_1m < 0) {
      issues.push(err("pricing-negative", `invalid price for ${r.model}/${r.type}: ${r.price_per_1m}`));
    }
    if (!VALID_CURRENCIES.includes(r.currency)) {
      issues.push(err("pricing-bad-currency", `invalid currency for ${r.model}/${r.type}: ${r.currency}`));
    }
    if (!modelIds.has(r.model)) {
      issues.push(err("pricing-unknown-model", `pricing row references unknown model: ${r.model}`));
    }
    if (!isValidUrl(r.source)) {
      issues.push(err("pricing-bad-url", `invalid source URL for ${r.model}/${r.type}: ${r.source}`));
    }
    if (!isValidDate(r.updated_at)) {
      issues.push(err("pricing-bad-date", `invalid date for ${r.model}/${r.type}: ${r.updated_at}`));
    }
    const key = `${r.model}|${r.type}`;
    if (seen.has(key)) {
      issues.push(err("pricing-duplicate", `duplicate pricing for ${key}`));
    }
    seen.add(key);
  }

  return issues;
}

/** Flag a single detected change as a possible scraping error.
 *  Returns a warning issue (never fails validation on its own). */
export function validateChange(change: PriceChange): ValidationIssue[] {
  if (
    change.kind === "changed" &&
    change.previous != null &&
    change.current != null &&
    isAnomaly(change.previous, change.current)
  ) {
    return [
      {
        severity: "warning",
        code: "pricing-anomaly",
        message: `possible scraping error for ${change.model}/${change.type}: ${change.previous} -> ${change.current}`,
      },
    ];
  }
  return [];
}

function isAnomaly(previous: number, current: number): boolean {
  if (!(previous > 0) || !(current >= 0)) return false;
  return current >= previous * 3 || current <= previous / 3;
}
