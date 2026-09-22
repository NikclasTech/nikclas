import type { PriceChange, PricingRow } from "./types";

/** A change of 3x or more in either direction is flagged as a possible
 *  scraping error (e.g. $3 -> $300). It still opens a PR, but labelled. */
export const ANOMALY_FACTOR = 3;

export function isAnomaly(previous: number, current: number): boolean {
  if (!(previous > 0) || !(current >= 0)) return false;
  return current >= previous * ANOMALY_FACTOR || current <= previous / ANOMALY_FACTOR;
}

function keyOf(model: string, type: string): string {
  return `${model}|${type}`;
}

/** Diff two pricing snapshots. Pure: unit-tested. */
export function diffPricing(
  previous: PricingRow[],
  current: PricingRow[],
  detectedAt: string,
  providerOf: (model: string) => string,
): PriceChange[] {
  const prev = new Map(previous.map((r) => [keyOf(r.model, r.type), r]));
  const seen = new Set<string>();
  const changes: PriceChange[] = [];

  for (const row of current) {
    const key = keyOf(row.model, row.type);
    seen.add(key);
    const old = prev.get(key);
    if (!old) {
      changes.push({
        provider: providerOf(row.model),
        model: row.model,
        type: row.type,
        previous: null,
        current: row.price_per_1m,
        currency: row.currency,
        source: row.source,
        detectedAt,
        anomaly: false,
        kind: "added",
      });
    } else if (old.price_per_1m !== row.price_per_1m) {
      changes.push({
        provider: providerOf(row.model),
        model: row.model,
        type: row.type,
        previous: old.price_per_1m,
        current: row.price_per_1m,
        currency: row.currency,
        source: row.source,
        detectedAt,
        anomaly: isAnomaly(old.price_per_1m, row.price_per_1m),
        kind: "changed",
      });
    }
  }

  for (const row of previous) {
    if (!seen.has(keyOf(row.model, row.type))) {
      changes.push({
        provider: providerOf(row.model),
        model: row.model,
        type: row.type,
        previous: row.price_per_1m,
        current: null,
        currency: row.currency,
        source: row.source,
        detectedAt,
        anomaly: false,
        kind: "removed",
      });
    }
  }

  return changes;
}

function money(n: number | null): string {
  return n == null ? "n/a" : `$${n.toFixed(2)}`;
}

/** Human-readable PR body for a list of changes. Pure: unit-tested. */
export function formatChangesMarkdown(changes: PriceChange[]): string {
  if (changes.length === 0) return "No changes detected.";
  const lines: string[] = [];
  if (changes.some((c) => c.anomaly)) {
    lines.push(
      "> [!WARNING]",
      "> One or more changes look anomalous (3x or more). Review the source before merging.",
      "",
    );
  }
  lines.push("## Pricing changes", "");
  lines.push("| Provider | Model | Type | Previous | Current | Change |");
  lines.push("| -------- | ----- | ---- | -------- | ------- | ------ |");
  for (const c of changes) {
    const pct =
      c.previous != null && c.current != null && c.previous !== 0
        ? `${(((c.current - c.previous) / c.previous) * 100).toFixed(1)}%`
        : "n/a";
    const flag = c.anomaly ? " ANOMALY" : c.kind === "added" ? " NEW" : c.kind === "removed" ? " REMOVED" : "";
    lines.push(
      `| ${c.provider} | ${c.model} | ${c.type} | ${money(c.previous)} / 1M tokens | ${money(c.current)} / 1M tokens | ${pct}${flag} |`,
    );
  }
  lines.push("", `Detected: ${changes[0].detectedAt}`, "");
  lines.push("Sources:");
  for (const source of [...new Set(changes.map((c) => c.source))]) {
    lines.push(`- ${source}`);
  }
  return lines.join("\n");
}
