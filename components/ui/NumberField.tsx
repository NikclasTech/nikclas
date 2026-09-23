import Field from "./Field";

/** Labelled numeric input bound to a string state value. */
export default function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field id={id} label={label}>
      <input
        id={id}
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[#22304f] bg-[#0c1429] px-3 py-2.5 font-mono text-[13px] tabular-nums text-[#eaf0fb] transition-colors duration-200 hover:border-[#4de3ff]/50 focus:border-[#4de3ff]"
      />
    </Field>
  );
}
