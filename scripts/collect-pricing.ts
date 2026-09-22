/** Nightly pricing collector (run by .github/workflows/pricing-update.yml).
 *  Fetches every registered provider, normalizes, diffs against
 *  data/pricing.json and writes the updated dataset plus a PR summary.
 *  Never commits: the workflow opens the pull request. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { diffPricing, formatChangesMarkdown } from "../src/pricing/changes";
import { normalizePricing } from "../src/pricing/normalize";
import { pricingProviders } from "../src/pricing/providers/index";
import { validateChange, validateDataset } from "../src/pricing/validate";
import type {
  ModelEntry,
  PricingRow,
  ProviderEntry,
} from "../src/pricing/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const today = new Date().toISOString().slice(0, 10);

function load<T>(name: string): T {
  return JSON.parse(readFileSync(join(root, "data", name), "utf8")) as T;
}

const providers = load<ProviderEntry[]>("providers.json");
const models = load<ModelEntry[]>("models.json");
const previous = load<PricingRow[]>("pricing.json");
const providerName = new Map(providers.map((p) => [p.id, p.name]));
const providerOf = (model: string): string => {
  const entry = models.find((m) => m.id === model);
  return (entry && providerName.get(entry.provider)) || "unknown";
};

const fetched = [];
for (const provider of pricingProviders) {
  console.log(`fetching pricing via ${provider.name}...`);
  fetched.push(...(await provider.fetchPricing()));
}
console.log(`fetched ${fetched.length} model entries`);

const fresh = normalizePricing(fetched, today);
const changes = diffPricing(previous, fresh, today, providerOf);

// Preserve the original updated_at on untouched rows so git history
// stays a clean record of real price changes.
const prevByKey = new Map(previous.map((r) => [`${r.model}|${r.type}`, r]));
const merged = fresh.map((r) => {
  const old = prevByKey.get(`${r.model}|${r.type}`);
  return old && old.price_per_1m === r.price_per_1m ? old : r;
});

const errors = validateDataset(providers, models, merged).filter(
  (i) => i.severity === "error",
);
if (errors.length > 0) {
  for (const e of errors) console.error(`error [${e.code}] ${e.message}`);
  process.exit(1);
}

writeFileSync(join(root, "data", "pricing.json"), `${JSON.stringify(merged, null, 2)}\n`);

const anomalies = changes.flatMap((c) => validateChange(c));
const body = formatChangesMarkdown(changes);
writeFileSync(join(root, "pricing-changes.md"), `${body}\n`);
writeFileSync(
  join(root, ".pricing-meta.json"),
  JSON.stringify(
    {
      has_changes: changes.length > 0,
      has_anomaly: anomalies.length > 0,
      change_count: changes.length,
      detected_at: today,
    },
    null,
    2,
  ),
);

if (changes.length === 0) {
  console.log("No changes detected.");
} else {
  console.log(`${changes.length} change(s) detected:`);
  console.log(body);
}
if (anomalies.length > 0) {
  for (const a of anomalies) console.warn(`warning [${a.code}] ${a.message}`);
}
