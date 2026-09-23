const DOTS = {
  live: "bg-green-400",
  syncing: "bg-[#ffb224] animate-pulse",
  cached: "bg-[#ffb224]",
} as const;

export type StatusTone = keyof typeof DOTS;

/** Status dot for live/syncing/cached states. */
export default function StatusDot({ tone }: { tone: StatusTone }) {
  return <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${DOTS[tone]}`} />;
}
