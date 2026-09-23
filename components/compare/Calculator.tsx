import { useMemo, useState } from "react";
import { FALLBACK_PRICES, MODELS, useLivePrices } from "../../src/lib/litellm";
import { fmt, linearBarWidth } from "../../src/lib/format";
import { estimateMonthlyCost, rankByMonthlyCost } from "../../src/pricing/estimate";
import { Bar, Button, Field, NumberField, SectionHeader, Select } from "../ui";

const PRESETS = [
  { label: "Side project", inputM: "5", outputM: "1" },
  { label: "Startup", inputM: "50", outputM: "10" },
  { label: "Scale", inputM: "500", outputM: "100" },
];

export default function CostCalculator() {
  const { status, prices } = useLivePrices();
  const [modelId, setModelId] = useState("gpt-4o-mini");
  const [inputM, setInputM] = useState("10");
  const [outputM, setOutputM] = useState("2");

  const inM = Math.max(0, Number(inputM) || 0);
  const outM = Math.max(0, Number(outputM) || 0);

  const rows = useMemo(
    () =>
      MODELS.map((m) => {
        const p = prices[m.id] ?? FALLBACK_PRICES[m.id];
        return { id: m.id, name: m.name, input: p.input, output: p.output };
      }),
    [prices],
  );
  const ranked = useMemo(() => rankByMonthlyCost(rows, inM, outM), [rows, inM, outM]);
  const max = Math.max(...ranked.map((r) => r.monthly), 0.01);
  const current = rows.find((r) => r.id === modelId) ?? rows[0];
  const estimate = estimateMonthlyCost(current.input, current.output, inM, outM);

  return (
    <section
      id="calculator"
      aria-labelledby="calculator-title"
      aria-busy={status === "loading"}
      className="relative mx-auto mt-4 w-full max-w-6xl px-6 pb-20"
    >
      <div className="rounded-xl border border-[#22304f] bg-[#0c1429]/60 p-5 backdrop-blur sm:p-6">
        <SectionHeader
          eyebrow="Monthly estimate — your usage, every model"
          title="What will it cost per month?"
          titleId="calculator-title"
          description=""
        />

        <form
          aria-label="Monthly usage"
          onSubmit={(e) => e.preventDefault()}
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <Field id="calc-model" label="Model" className="min-w-0 flex-1">
            <Select
              id="calc-model"
              value={current.id}
              onChange={setModelId}
              options={rows.map((m) => ({ value: m.id, label: m.name }))}
            />
          </Field>
          <NumberField id="calc-input" label="Input M tokens / mo" value={inputM} onChange={setInputM} />
          <NumberField id="calc-output" label="Output M tokens / mo" value={outputM} onChange={setOutputM} />
        </form>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Usage presets">
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              variant="pill"
              onClick={() => {
                setInputM(p.inputM);
                setOutputM(p.outputM);
              }}
            >
              {p.label}: {p.inputM}M in / {p.outputM}M out
            </Button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-[#22304f]/80 pt-6">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold tabular-nums text-[#ffb224]">
              {fmt(estimate.monthly)}
            </span>
            <span className="font-mono text-xs text-[#93a0b8]">/mo · {current.name}</span>
          </p>
          <p className="font-mono text-sm text-[#93a0b8]">
            ≈ <span className="text-[#eaf0fb]">{fmt(estimate.daily)}</span> /day
          </p>
        </div>

        <ol aria-label="Models ranked by monthly cost" className="mt-6 space-y-2.5">
          {ranked.map((r, i) => (
            <li
              key={r.id}
              className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2 transition-colors duration-200 ${
                r.id === current.id
                  ? "border-[#ffb224]/50 bg-[#ffb224]/[0.06]"
                  : "border-transparent hover:border-[#22304f]"
              }`}
            >
              <span className="w-6 font-mono text-xs text-[#93a0b8]">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-[13px] text-[#eaf0fb]">{r.name}</span>
                <Bar width={linearBarWidth(r.monthly, max)} tone={i === 0 ? "amber" : "signal"} size="sm" className="mt-1" />
              </span>
              <span className="font-mono text-[13px] font-medium tabular-nums text-[#eaf0fb]">
                {fmt(r.monthly)}
                <span className="text-[#93a0b8]">/mo</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
