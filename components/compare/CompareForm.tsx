import { fmt, vendorLabel } from "../../src/lib/format";
import type { StaticSpec } from "../../src/lib/litellm";
import { Button, Field, Select } from "../ui";

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
      <Field id={`provider-${side}`} label={`Provider ${side}`}>
        <Select
          id={`provider-${side}`}
          value={value.provider}
          onChange={(provider) => onChange({ provider, model: value.model })}
          options={[
            { value: ALL_PROVIDERS, label: "All providers" },
            ...providers.map((p) => ({ value: p.id, label: `${p.label} (${p.count})` })),
          ]}
        />
      </Field>
      <Field id={`model-${side}`} label={`Model ${side}`}>
        <Select
          id={`model-${side}`}
          value={value.model}
          onChange={(model) => onChange({ provider: value.provider, model })}
          options={models.map((m) => ({
            value: m.id,
            label: `${m.name} — ${fmt(priceOf(m.id))}/1M · ${vendorLabel(m.vendor)}`,
          }))}
        />
      </Field>
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
      <Button onClick={onSwap} aria-label="Swap sides" title="Swap sides" className="self-center">
        <span aria-hidden>⇄</span> Swap
      </Button>
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
