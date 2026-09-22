/** Validates data/*.json. Exits 1 on errors; anomalies vs git HEAD
 *  are warnings only (the pricing workflow labels those PRs instead of
 *  failing). Run: npm run validate:pricing */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { diffPricing } from "../src/pricing/changes";
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
const pricing = load<PricingRow[]>("pricing.json");

const issues = validateDataset(providers, models, pricing);
const errors = issues.filter((i) => i.severity === "error");
for (const e of issues) {
  console.log(`${e.severity} [${e.code}] ${e.message}`);
}
if (errors.length > 0) {
  console.error(`${errors.length} validation error(s) found.`);
  process.exit(1);
}

// Best-effort anomaly check: compare the working tree against the last
// committed snapshot so huge jumps in uncommitted changes get flagged.
try {
  const head = execSync("git show HEAD:data/pricing.json", {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const previous = JSON.parse(head) as PricingRow[];
  const providerOf = (model: string): string =>
    models.find((m) => m.id === model)?.provider ?? "unknown";
  const warnings = diffPricing(previous, pricing, today, providerOf).flatMap((c) =>
    validateChange(c),
  );
  for (const w of warnings) console.warn(`warning [${w.code}] ${w.message}`);
} catch {
  console.log("no git history available, skipping change check");
}

console.log("pricing data is valid.");
