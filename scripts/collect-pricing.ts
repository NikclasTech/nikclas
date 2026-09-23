/** Nightly pricing collector (run by .github/workflows/pricing-update.yml).
 *  Fetches every registered provider, normalizes, diffs against
 *  data/pricing.json and writes the updated dataset plus a PR summary.
 *  Never commits: the workflow opens the pull request. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MODELS } from "../src/lib/litellm";
import {
  diffPricing,
  formatChangesMarkdown,
  mergeFreshPrices,
  type MergeWarning,
} from "../src/pricing/changes";
import { normalizePricing } from "../src/pricing/normalize";
import { fetchModelPricing } from "../src/pricing/providers/litellm";
import { validateChange, validateDataset } from "../src/pricing/validate";
import type { ModelPricing } from "../src/pricing/providers/types";
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

const fetched: ModelPricing[] = [];
const fetchWarnings: MergeWarning[] = [];
for (const m of MODELS) {
  try {
    fetched.push(await fetchModelPricing(m.id));
  } catch (error) {
    fetchWarnings.push({
      model: m.id,
      message: `fetch failed for ${m.id}: ${error instanceof Error ? error.message : String(error)}; kept last-known prices`,
    });
  }
}
if (fetched.length === 0) {
  console.error("could not fetch any model; aborting without changes.");
  process.exit(1);
}
console.log(`fetched ${fetched.length}/${MODELS.length} model entries`);

const fresh = normalizePricing(fetched, today);
// Models missing from the fetch keep last-known prices with a warning
// instead of failing the whole run (upstream entries do disappear).
const { merged, warnings: staleWarnings } = mergeFreshPrices(previous, fresh);
const failed = new Set(fetchWarnings.map((w) => w.model));
const warnings = [
  ...fetchWarnings,
  ...staleWarnings.filter((w) => !failed.has(w.model)),
];

const changes = diffPricing(previous, merged, today, providerOf);

const errors = validateDataset(providers, models, merged).filter(
  (i) => i.severity === "error",
);
if (errors.length > 0) {
  for (const e of errors) console.error(`error [${e.code}] ${e.message}`);
  process.exit(1);
}

writeFileSync(join(root, "data", "pricing.json"), `${JSON.stringify(merged, null, 2)}\n`);

const anomalies = changes.flatMap((c) => validateChange(c));
let body = formatChangesMarkdown(changes);
if (warnings.length > 0) {
  body += `\n\n## Fetch warnings\n\n${warnings.map((w) => `- ${w.message}`).join("\n")}\n`;
}
writeFileSync(join(root, "pricing-changes.md"), `${body}\n`);
writeFileSync(
  join(root, ".pricing-meta.json"),
  JSON.stringify(
    {
      has_changes: changes.length > 0,
      has_anomaly: anomalies.length > 0,
      change_count: changes.length,
      warnings: warnings.map((w) => w.message),
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
for (const w of warnings) console.warn(`warning ${w.message}`);
if (anomalies.length > 0) {
  for (const a of anomalies) console.warn(`warning [${a.code}] ${a.message}`);
}
