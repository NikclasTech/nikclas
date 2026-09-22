import { useEffect, useState } from "react";

/* Data layer: live pricing from the LiteLLM Model Catalog API.
   GET https://api.litellm.ai/model_catalog/{model_id} returns per-token
   costs (input_cost_per_token, output_cost_per_token) — multiply by 1M
   for $/1M tokens — plus max_input_tokens (context) and provider.
   Free tier: 100 req/day per IP, no key. Responses are cached in
   localStorage for 24h; the bundled snapshot below (verified 2026-09-22)
   renders while loading or if the request fails.
   Presentation helpers (fmt, vendor labels, bar scales) live in ./format. */
export const LITELLM_API = "https://api.litellm.ai";
const CACHE_KEY = "nikclas:litellm-prices:v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type StaticSpec = {
  id: string;
  name: string;
  vendor: string;
  speed: string;
};

export type LivePrice = {
  /** $ per 1M tokens */
  input: number;
  /** $ per 1M tokens */
  output: number;
  maxInputTokens: number;
  provider: string;
};

/** Catalog — every id verified to exist in the API on 2026-09-22. */
export const MODELS: StaticSpec[] = [
  { id: "gpt-4o-mini", name: "gpt-4o-mini", vendor: "openai", speed: "72 tok/s" },
  { id: "deepseek-chat", name: "deepseek-chat", vendor: "deepseek", speed: "64 tok/s" },
  { id: "deepseek-v4-flash", name: "deepseek-v4-flash", vendor: "deepseek", speed: "61 tok/s" },
  { id: "gemini-2.5-flash-lite", name: "gemini-2.5-flash-lite", vendor: "google", speed: "68 tok/s" },
  { id: "gpt-5.6-luna", name: "gpt-5.6-luna", vendor: "openai", speed: "70 tok/s" },
  { id: "zai/glm-5.3", name: "zai/glm-5.3", vendor: "z.ai", speed: "52 tok/s" },
  { id: "xai/grok-4.5", name: "xai/grok-4.5", vendor: "xAI", speed: "55 tok/s" },
  { id: "gpt-4o", name: "gpt-4o", vendor: "openai", speed: "48 tok/s" },
  { id: "claude-sonnet-4-6", name: "claude-sonnet-4-6", vendor: "anthropic", speed: "44 tok/s" },
  { id: "moonshot/kimi-k3", name: "moonshot/kimi-k3", vendor: "kimi", speed: "46 tok/s" },
  { id: "claude-fable-5-1", name: "claude-fable-5-1", vendor: "anthropic", speed: "38 tok/s" },
  { id: "gpt-6-astra", name: "gpt-6-astra", vendor: "openai", speed: "40 tok/s" },
  { id: "claude-opus-4-1", name: "claude-opus-4-1", vendor: "anthropic", speed: "31 tok/s" },
];

/** Bundled snapshot — verified against the API on 2026-09-22. */
export const FALLBACK_PRICES: Record<string, LivePrice> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6, maxInputTokens: 128000, provider: "openai" },
  "deepseek-chat": { input: 0.28, output: 0.42, maxInputTokens: 131072, provider: "deepseek" },
  "deepseek-v4-flash": { input: 0.3, output: 1.2, maxInputTokens: 1000000, provider: "deepseek" },
  "gemini-2.5-flash-lite": { input: 0.1, output: 0.4, maxInputTokens: 1048576, provider: "vertex_ai-language-models" },
  "gpt-5.6-luna": { input: 0.2, output: 1.2, maxInputTokens: 922000, provider: "openai" },
  "zai/glm-5.3": { input: 1.4, output: 4.4, maxInputTokens: 1000000, provider: "zai" },
  "xai/grok-4.5": { input: 2.0, output: 6.0, maxInputTokens: 500000, provider: "xai" },
  "gpt-4o": { input: 2.5, output: 10.0, maxInputTokens: 128000, provider: "openai" },
  "claude-sonnet-4-6": { input: 3.0, output: 15.0, maxInputTokens: 1000000, provider: "anthropic" },
  "moonshot/kimi-k3": { input: 3.0, output: 15.0, maxInputTokens: 1048576, provider: "moonshot" },
  "claude-fable-5-1": { input: 10.0, output: 50.0, maxInputTokens: 1000000, provider: "anthropic" },
  "gpt-6-astra": { input: 10.0, output: 50.0, maxInputTokens: 922000, provider: "openai" },
  "claude-opus-4-1": { input: 15.0, output: 75.0, maxInputTokens: 200000, provider: "anthropic" },
};

type CatalogEntry = {
  input_cost_per_token: number | null;
  output_cost_per_token: number | null;
  max_input_tokens: number | null;
  provider: string | null;
};

let inflight: Promise<Record<string, LivePrice>> | null = null;

async function fetchEntry(id: string): Promise<LivePrice> {
  const res = await fetch(`${LITELLM_API}/model_catalog/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`litellm ${res.status} for ${id}`);
  const j = (await res.json()) as CatalogEntry;
  if (j.input_cost_per_token == null || j.output_cost_per_token == null) {
    throw new Error(`no pricing for ${id}`);
  }
  return {
    input: j.input_cost_per_token * 1_000_000,
    output: j.output_cost_per_token * 1_000_000,
    maxInputTokens: j.max_input_tokens ?? FALLBACK_PRICES[id]?.maxInputTokens ?? 0,
    provider: j.provider ?? FALLBACK_PRICES[id]?.provider ?? "",
  };
}

export function fetchAllLive(): Promise<Record<string, LivePrice>> {
  if (!inflight) {
    inflight = (async () => {
      const out: Record<string, LivePrice> = {};
      await Promise.all(
        MODELS.map(async (m) => {
          try {
            out[m.id] = await fetchEntry(m.id);
          } catch {
            out[m.id] = FALLBACK_PRICES[m.id];
          }
        }),
      );
      return out;
    })().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

type Cached = { savedAt: number; prices: Record<string, LivePrice> };

export function readCache(): Cached | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cached;
    if (!c.savedAt || !c.prices) return null;
    if (Date.now() - c.savedAt > CACHE_TTL_MS) return null;
    return c;
  } catch {
    return null;
  }
}

export function writeCache(prices: Record<string, LivePrice>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), prices } satisfies Cached));
  } catch {
    /* storage full or unavailable — live data still renders */
  }
}

export type PriceState = {
  status: "loading" | "live" | "stale";
  prices: Record<string, LivePrice>;
  updatedAt: number | null;
};

/** Shared hook — board and comparator both use it; one fetch feeds both. */
export function useLivePrices(): PriceState {
  const [state, setState] = useState<PriceState>({
    status: "loading",
    prices: FALLBACK_PRICES,
    updatedAt: null,
  });

  useEffect(() => {
    let alive = true;
    const cached = readCache();
    if (cached) {
      setState({ status: "stale", prices: cached.prices, updatedAt: cached.savedAt });
    }
    fetchAllLive()
      .then((prices) => {
        if (!alive) return;
        writeCache(prices);
        setState({ status: "live", prices, updatedAt: Date.now() });
      })
      .catch(() => {
        if (!alive) return;
        setState((s) => (s.updatedAt ? s : { status: "stale", prices: FALLBACK_PRICES, updatedAt: null }));
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
