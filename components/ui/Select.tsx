import type { ReactNode } from "react";

export type SelectOption = {
  value: string;
  label: ReactNode;
};

/** Brand-styled native select (keeps the platform dropdown arrow). */
export default function Select({
  id,
  value,
  onChange,
  options,
  ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
}) {
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full cursor-pointer rounded-md border border-[#22304f] bg-[#0c1429] px-3 py-2.5 font-mono text-[13px] text-[#eaf0fb] transition-colors duration-200 hover:border-[#4de3ff]/50 focus:border-[#4de3ff]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#0c1429]">
          {o.label}
        </option>
      ))}
    </select>
  );
}
