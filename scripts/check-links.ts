/** Link checker for pricing sources (run by .github/workflows/link-check.yml).
 *  Sequential HEAD requests with a timeout and a delay between them so
 *  sources are never hammered. Exits 1 when any URL fails. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  PricingRow,
  ProviderEntry,
} from "../src/pricing/types";

const TIMEOUT_MS = 12000;
const DELAY_MS = 400;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function load<T>(name: string): T {
  return JSON.parse(readFileSync(join(root, "data", name), "utf8")) as T;
}

async function check(url: string): Promise<{ url: string; ok: boolean; detail: string }> {
  for (const method of ["HEAD", "GET"]) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { method, signal: ctrl.signal, redirect: "follow" });
      if ((res.status === 405 || res.status === 501) && method === "HEAD") continue;
      await res.body?.cancel();
      return { url, ok: res.ok, detail: `HTTP ${res.status}` };
    } catch (error) {
      if (method === "GET") {
        return {
          url,
          ok: false,
          detail: error instanceof Error ? error.message : String(error),
        };
      }
    } finally {
      clearTimeout(timer);
    }
  }
  return { url, ok: false, detail: "request failed" };
}

const providers = load<ProviderEntry[]>("providers.json");
const pricing = load<PricingRow[]>("pricing.json");

const urls = [
  ...providers.map((p) => p.website),
  ...providers.map((p) => p.pricing_url).filter((u): u is string => u != null),
  ...pricing.map((r) => r.source),
].filter((u, i, all) => all.indexOf(u) === i);

console.log(`checking ${urls.length} source URL(s)...`);
const results = [];
for (const url of urls) {
  const result = await check(url);
  results.push(result);
  console.log(`${result.ok ? "ok  " : "FAIL"} ${result.detail}  ${url}`);
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
}

const failed = results.filter((r) => !r.ok);
const report = [
  "# Source link check",
  "",
  ...results.map((r) => `- ${r.ok ? "ok" : "FAIL"} (${r.detail}) ${r.url}`),
  "",
].join("\n");
writeFileSync(join(root, "link-report.md"), report);

if (failed.length > 0) {
  console.error(`${failed.length} broken source URL(s).`);
  process.exit(1);
}
console.log("all source URLs are reachable.");
