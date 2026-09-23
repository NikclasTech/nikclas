import { useMemo, useState } from "react";
import { FALLBACK_PRICES, MODELS, useLivePrices } from "../../src/lib/litellm";
import { fmt, fmtAgo, linearBarWidth, vendorLabel } from "../../src/lib/format";
import Calculator from "./Calculator";
import ModelCard, { type MergedModel } from "./ModelCard";
import CompareForm, { ALL_PROVIDERS, type ProviderOption, type SideValue } from "./CompareForm";

function modelsForProvider(provider: string) {
  if (provider === ALL_PROVIDERS) return MODELS;
  return MODELS.filter((m) => vendorLabel(m.vendor) === provider);
}

export default function CompareSection() {
  const [a, setA] = useState<SideValue>({ provider: ALL_PROVIDERS, model: "gpt-4o-mini" });
  const [b, setB] = useState<SideValue>({ provider: ALL_PROVIDERS, model: "gpt-4o" });
  const { status, prices, updatedAt } = useLivePrices();

  // Providers come from the static catalog vendors (the makers being
  // compared), not from whichever host bills each row upstream.
  const providers: ProviderOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of MODELS) {
      const label = vendorLabel(m.vendor);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ id: label, label, count }))
      .sort((x, y) => x.label.localeCompare(y.label));
  }, []);

  const withBars: MergedModel[] = useMemo(() => {
    const base = MODELS.map((m) => ({ ...m, ...(prices[m.id] ?? FALLBACK_PRICES[m.id]) }));
    const maxInput = Math.max(...base.map((m) => m.input), 0.01);
    return base.map((m) => ({ ...m, barWidth: linearBarWidth(m.input, maxInput) }));
  }, [prices]);

  const byId = useMemo(
    () => Object.fromEntries(withBars.map((m) => [m.id, m])) as Record<string, MergedModel>,
    [withBars],
  );

  function fixSide(v: SideValue): SideValue {
    const list = modelsForProvider(v.provider);
    if (list.some((m) => m.id === v.model)) return v;
    return { provider: v.provider, model: list[0]?.id ?? MODELS[0].id };
  }

  const modelA = byId[fixSide(a).model] ?? withBars[0];
  const modelB = byId[fixSide(b).model] ?? withBars[3];
  const tied = modelA.id === modelB.id;
  const aWins = modelA.input <= modelB.input;
  const cheap = aWins ? modelA : modelB;
  const pricey = aWins ? modelB : modelA;
  const savings = pricey.input - cheap.input;
  const pct = tied ? 0 : Math.round((savings / pricey.input) * 100);

  function swap() {
    setA(b);
    setB(a);
  }

  const statusMeta =
    status === "live"
      ? { dot: "bg-green-400", text: `live prices · updated ${updatedAt ? fmtAgo(updatedAt) : "just now"}` }
      : status === "loading"
        ? { dot: "bg-[#ffb224] animate-pulse", text: "fetching live prices…" }
        : {
            dot: "bg-[#ffb224]",
            text: updatedAt ? `cached prices · updated ${fmtAgo(updatedAt)}` : "bundled snapshot · retrying live",
          };

  return (
    <>
    <section
      id="versus"
      aria-labelledby="versus-title"
      aria-busy={status === "loading"}
      className="relative mx-auto w-full max-w-6xl px-6 pb-4"
    >
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#4de3ff]/80">
          Head-to-head — same 2k draft task
        </p>
        <h2
          id="versus-title"
          className="display-tight mt-3 font-display text-3xl font-bold uppercase text-[#eaf0fb] sm:text-4xl"
        >
          Pick two. See the gap.
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#93a0b8]">
          Choose a provider and model on each side. Prices load live from the
          LiteLLM catalog — the cheaper input price wins.
        </p>
        <p aria-live="polite" className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
          <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} aria-hidden />
          <span className="text-[#93a0b8]">{statusMeta.text}</span>
          <a
            href="https://api.litellm.ai/"
            target="_blank"
            rel="noreferrer"
            className="text-[#4de3ff]/80 underline decoration-[#4de3ff]/30 underline-offset-4 hover:text-[#4de3ff]"
          >
            api.litellm.ai
          </a>
        </p>
      </div>

      <CompareForm
        providers={providers}
        a={a}
        b={b}
        onChangeA={(v) => setA(fixSide(v))}
        onChangeB={(v) => setB(fixSide(v))}
        onSwap={swap}
        modelsFor={modelsForProvider}
        priceOf={(id) => byId[id]?.input ?? 0}
      />

      <div className="mt-4 grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
        <ModelCard model={modelA} winner={tied || aWins} tied={tied} />

        <div
          aria-live="polite"
          aria-label={tied ? "Same model selected" : `${cheap.name} is ${pct} percent cheaper`}
          className="flex items-center gap-3 md:flex-col md:justify-center md:gap-4 md:px-1"
        >
          <span aria-hidden className="h-px flex-1 bg-[#22304f] md:h-full md:w-px md:flex-none" />
          <span className="inline-flex flex-col items-center rounded-lg border border-[#ffb224]/40 bg-[#ffb224]/10 px-4 py-2.5">
            <span className="font-display text-2xl font-bold tabular-nums text-[#ffb224]">
              {tied ? "—" : `−${pct}%`}
            </span>
            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#ffb224]/80">
              {tied ? "same pick" : "cheaper"}
            </span>
          </span>
          <span aria-hidden className="h-px flex-1 bg-[#22304f] md:h-full md:w-px md:flex-none" />
        </div>

        <ModelCard model={modelB} winner={tied || !aWins} tied={tied} />
      </div>

      <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[#22304f] bg-[#0c1429]/60 px-4 py-3 font-mono text-xs leading-relaxed text-[#93a0b8]">
        <span className="text-green-400">›</span>
        {tied ? (
          <span>
            <span className="text-[#eaf0fb]">verdict:</span> pick two different
            models to see the savings.
          </span>
        ) : (
          <span>
            <span className="text-[#eaf0fb]">verdict:</span> run drafts on{" "}
            <span className="text-[#ffb224]">{cheap.name}</span>, save{" "}
            <span className="text-[#eaf0fb]">{fmt(savings)} per 1M input tokens</span>.
          </span>
        )}
        <span className="ml-auto hidden sm:inline">
          {status === "live" ? "live via api.litellm.ai" : "snapshot · source api.litellm.ai"}
        </span>
      </p>
    </section>
    <Calculator />
    </>
  );
}
