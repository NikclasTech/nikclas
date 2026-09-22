import type { LivePrice } from "./litellm";

/** Raw provider id from the API -> short label shown in the UI. */
export const VENDOR_LABEL: Record<string, string> = {
  openai: "openai",
  anthropic: "anthropic",
  deepseek: "deepseek",
  "vertex_ai-language-models": "google",
  zai: "z.ai",
  moonshot: "kimi",
  xai: "xAI",
};

export function vendorLabel(provider: string) {
  return VENDOR_LABEL[provider] ?? provider;
}

/** $ per 1M tokens, e.g. 0.15 -> "$0.15". */
export function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

/** Context window, e.g. 128000 -> "128k", 1048576 -> "1M". */
export function fmtCtx(tokens: number) {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) {
    const m = tokens / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}k`;
  return `${tokens}`;
}

export function fmtAgo(ts: number) {
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/** Bar width for a linear $/1M scale with a visibility floor. */
export function linearBarWidth(input: number, maxInput: number) {
  return `${Math.max(6, (input / Math.max(maxInput, 0.01)) * 100)}%`;
}

/** Bar width for a log $/1M scale (matches the board caption). */
export function logBarWidth(input: number, minInput: number, maxInput: number) {
  const span = Math.log(maxInput) - Math.log(minInput);
  if (!(span > 0)) return "100%";
  return `${Math.round(6 + (94 * (Math.log(input) - Math.log(minInput))) / span)}%`;
}

export type { LivePrice };
