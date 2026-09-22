import { fmt, vendorLabel } from "../../src/lib/format";
import type { StaticSpec } from "../../src/lib/litellm";

export const ALL_PROVIDERS = "all";

export type SideValue = {
  /** vendor label, or "all" */
  provider: string;
  model: string;
};

export type ProviderOption = {
  id: string;
  label: string;
  count: number;
};

const selectClass =
  "w-full cursor-pointer appearance-none rounded-md border border-[#22304f] bg-[#0c1429] px-3 py-2.5 pr-9 font-mono text-[13px] text-[#eaf0fb] transition-colors duration-200 hover:border-[#4de3ff]/50 focus:border-[#4de3ff]";

const labelClass =
  "font-mono text-[11px] uppercase tracking-[0.2em] text-[#93a0b8]";

function SidePicker({
  side,
  providers,
  value,
  onChange,
  models,
  priceOf,
}: {
  side: "A" | "B";
  providers: ProviderOption[];
  value: SideValue;
  onChange: (v: SideValue) => void;
  models: StaticSpec[];
  priceOf: (id: string) => number;
}) {
  return (
    <fieldset className="flex min-w-0 flex-1 flex-col gap-3">
      <legend className="sr-only">Side {side}</legend>
      <div className="flex flex-col gap-2">
        <label htmlFor={`provider-${side}`} className={labelClass}>
          Provider {side}
        </label>
        <select
          id={`provider-${side}`}
          value={value.provider}
          onChange={(e) => onChange({ provider: e.target.value, model: value.model })}
          className={selectClass}
        >
          <option value={ALL_PROVIDERS} className="bg-[#0c1429]">
            All providers
          </option>
          {providers.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#0c1429]">
              {p.label} ({p.count})
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`model-${side}`} className={labelClass}>
          Model {side}
        </label>
        <select
          id={`model-${side}`}
          value={value.model}
          onChange={(e) => onChange({ provider: value.provider, model: e.target.value })}
          className={selectClass}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id} className="bg-[#0c1429]">
              {m.name} — {fmt(priceOf(m.id))}/1M · {vendorLabel(m.vendor)}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}

export default function CompareForm({
  providers,
  a,
  b,
  onChangeA,
  onChangeB,
  onSwap,
  modelsFor,
  priceOf,
}: {
  providers: ProviderOption[];
  a: SideValue;
  b: SideValue;
  onChangeA: (v: SideValue) => void;
  onChangeB: (v: SideValue) => void;
  onSwap: () => void;
  modelsFor: (provider: string) => StaticSpec[];
  priceOf: (id: string) => number;
}) {
  return (
    <form
      aria-label="Choose providers and models to compare"
      onSubmit={(e) => e.preventDefault()}
      className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-[#22304f] bg-[#0c1429]/60 p-4 sm:p-5 md:grid-cols-[1fr_auto_1fr] md:items-center"
    >
      <SidePicker
        side="A"
        providers={providers}
        value={a}
        onChange={onChangeA}
        models={modelsFor(a.provider)}
        priceOf={priceOf}
      />
      <button
        type="button"
        onClick={onSwap}
        aria-label="Swap sides"
        title="Swap sides"
        className="inline-flex items-center justify-center gap-2 self-center rounded-md border border-[#22304f] px-4 py-2.5 font-mono text-sm text-[#eaf0fb] transition-colors duration-200 hover:border-[#4de3ff]/60 hover:text-[#4de3ff]"
      >
        <span aria-hidden>⇄</span> Swap
      </button>
      <SidePicker
        side="B"
        providers={providers}
        value={b}
        onChange={onChangeB}
        models={modelsFor(b.provider)}
        priceOf={priceOf}
      />
    </form>
  );
}
