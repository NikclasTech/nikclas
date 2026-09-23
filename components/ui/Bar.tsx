/** Proportional bar with track. Set `animate` for the entrance sweep. */
export default function Bar({
  width,
  tone = "signal",
  size = "md",
  animate = false,
  delayMs = 0,
  className,
}: {
  width: string;
  tone?: "amber" | "signal";
  size?: "sm" | "md";
  animate?: boolean;
  delayMs?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`${size === "sm" ? "h-1" : "h-1.5"} overflow-hidden rounded-full bg-white/[0.07]${className ? ` ${className}` : ""}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500${animate ? " origin-left animate-bar" : ""} ${
          tone === "amber" ? "bg-[#ffb224]" : "bg-[#4de3ff]/70"
        }`}
        style={{ width, ...(animate && delayMs > 0 ? { animationDelay: `${delayMs}ms` } : {}) }}
      />
    </div>
  );
}
