import type { ReactNode } from "react";

/** Labelled form field wrapper. */
export default function Field({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2${className ? ` ${className}` : ""}`}>
      <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#93a0b8]">
        {label}
      </label>
      {children}
    </div>
  );
}
