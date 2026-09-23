import { afterEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_PRICES, readCache, writeCache } from "./litellm";

function stubStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  });
  return store;
}

describe("readCache", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when storage is empty", () => {
    stubStorage();
    expect(readCache()).toBeNull();
  });

  it("round-trips fresh entries", () => {
    stubStorage();
    writeCache(FALLBACK_PRICES);
    const cached = readCache();
    expect(cached).not.toBeNull();
    expect(cached?.prices["gpt-4o-mini"].input).toBe(0.15);
  });

  it("rejects entries written before capabilities existed", () => {
    const legacy = {
      savedAt: Date.now(),
      prices: {
        "gpt-4o-mini": {
          input: 0.15,
          output: 0.6,
          maxInputTokens: 128000,
          provider: "openai",
        },
      },
    };
    stubStorage({ "nikclas:litellm-prices:v2": JSON.stringify(legacy) });
    expect(readCache()).toBeNull();
  });

  it("rejects corrupt payloads", () => {
    stubStorage({ "nikclas:litellm-prices:v2": "not-json{" });
    expect(readCache()).toBeNull();
  });
});
