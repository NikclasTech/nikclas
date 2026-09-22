import { useMemo } from "react";
import { FALLBACK_PRICES, MODELS, useLivePrices } from "../../src/lib/litellm";
import { fmt, logBarWidth } from "../../src/lib/format";
import PriceBoard from "./PriceBoard";

/** The board shows only the 4 highest-traffic flagships; the full
    catalog lives in the comparator below. */
const BOARD_IDS = ["gpt-4o-mini", "gpt-4o", "claude-sonnet-4-6", "deepseek-chat"];

export default function HeroSection() {
  const { status, prices } = useLivePrices();

  const rows = useMemo(() => {
    const merged = MODELS.filter((m) => BOARD_IDS.includes(m.id)).map((m) => ({
      ...m,
      input: (prices[m.id] ?? FALLBACK_PRICES[m.id]).input,
    })).sort((a, b) => a.input - b.input);
    const min = Math.min(...merged.map((m) => m.input));
    const max = Math.max(...merged.map((m) => m.input));
    return merged.map((m, i) => ({
      ...m,
      price: fmt(m.input),
      width: logBarWidth(m.input, min, max),
      hot: i === 0,
      tag: i === 0 ? "BEST" : i === merged.length - 1 ? "AVOID" : null,
    }));
  }, [prices]);

  const floor = useMemo(
    () => fmt(Math.min(...MODELS.map((m) => (prices[m.id] ?? FALLBACK_PRICES[m.id]).input))),
    [prices],
  );

  return (
    <section className="relative overflow-hidden pt-12">
      <div aria-hidden className="hero-bg absolute inset-0" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4de3ff]/60 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-14 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
        {/* Thesis */}
        <div>
          <h1
            className="display-tight animate-rise mt-6 font-display text-[13vw] font-bold uppercase text-[#eaf0fb] sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "90ms" }}
          >
            Stop
            <br />
            overpaying
            <br />
            <span className="text-outline">for tokens.</span>
          </h1>

          <p
            className="animate-rise mt-6 max-w-md text-base leading-relaxed text-[#93a0b8] md:text-lg"
            style={{ animationDelay: "180ms" }}
          >
            Nikclas compares input $/1M tokens across frontier models. Same
            quality,{" "}
            <span className="font-mono font-medium text-[#ffb224]">
              73% less spend
            </span>
            . No benchmark fluff — just the price board.
          </p>

          <div
            className="animate-rise mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "260ms" }}
          >
            <a
              href="#compare"
              className="group inline-flex items-center gap-2 rounded-md bg-[#ffb224] px-5 py-3 font-display text-sm font-semibold uppercase tracking-wide text-[#060b1a] transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
            >
              Compare models
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href="https://github.com/NikclasTech/nikclas"
              className="inline-flex items-center gap-2 rounded-md border border-[#22304f] bg-[#0c1429]/60 px-5 py-3 font-mono text-sm text-[#eaf0fb] transition-colors duration-200 hover:border-[#4de3ff]/60 hover:text-[#4de3ff]"
            >
              $ go to gh
            </a>
          </div>

          <dl
            className="animate-rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[#22304f]/80 pt-6 font-mono text-xs"
            style={{ animationDelay: "340ms" }}
          >
            <div>
              <dt className="uppercase tracking-[0.18em] text-[#93a0b8]">Median saving</dt>
              <dd className="mt-1 text-lg font-bold text-[#eaf0fb]">−73%</dd>
            </div>
            <div className="border-l border-[#22304f] pl-8">
              <dt className="uppercase tracking-[0.18em] text-[#93a0b8]">Floor /1M</dt>
              <dd className="mt-1 text-lg font-bold text-[#4de3ff]">{floor}</dd>
            </div>
            <div className="border-l border-[#22304f] pl-8">
              <dt className="uppercase tracking-[0.18em] text-[#93a0b8]">Coverage</dt>
              <dd className="mt-1 text-lg font-bold text-[#eaf0fb]">{MODELS.length} live</dd>
            </div>
          </dl>
        </div>

        {/* Instrument: the price board */}
        <PriceBoard rows={rows} status={status} />
      </div>
    </section>
  );
}
