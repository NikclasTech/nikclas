import type { ReactNode } from "react";

const TONES = {
  amber: "border-[#ffb224]/40 bg-[#ffb224]/10 text-[#ffb224]",
  muted: "border-[#22304f] text-[#93a0b8]",
} as const;

export type BadgeTone = keyof typeof TONES;

/** Small uppercase tag (BEST, AVOID, Best value...). */
export default function Badge({
  tone = "muted",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${TONES[tone]}${className ? ` ${className}` : ""}`}
    >
      {children}
    </span>
  );
}
