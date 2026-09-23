import type { PriceState } from "../../src/lib/litellm";
import { Badge, Bar, StatusDot } from "../ui";
import type { StatusTone } from "../ui";

export type BoardRow = {
  id: string;
  name: string;
  price: string;
  width: string;
  hot: boolean;
  tag: string | null;
};

const STATUS_TONE: Record<PriceState["status"], StatusTone> = {
  live: "live",
  loading: "syncing",
  stale: "cached",
};

const STATUS_LABEL: Record<PriceState["status"], string> = {
  live: "live",
  loading: "syncing",
  stale: "cached",
};

export default function PriceBoard({
  rows,
  status,
}: {
  rows: BoardRow[];
  status: PriceState["status"];
}) {
  return (
    <div id="compare" className="animate-rise relative items-center" style={{ animationDelay: "220ms" }}>
      <div aria-hidden className="absolute -left-2 -top-2 h-4 w-4 border-l-2 border-t-2 border-[#4de3ff]/70" />
      <div aria-hidden className="absolute -right-2 -top-2 h-4 w-4 border-r-2 border-t-2 border-[#4de3ff]/70" />
      <div aria-hidden className="absolute -bottom-2 -left-2 h-4 w-4 border-b-2 border-l-2 border-[#4de3ff]/70" />
      <div aria-hidden className="absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-[#4de3ff]/70" />

      <div className="relative overflow-hidden rounded-xl border border-[#22304f] bg-[#0c1429]/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur">
        <div aria-hidden className="absolute left-0 right-0 h-16 animate-scan bg-gradient-to-b from-transparent via-[#4de3ff]/[0.07] to-transparent" />

        <div className="flex items-center justify-between border-b border-[#22304f] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5" aria-hidden>
              <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </span>
            <p className="font-mono text-xs text-[#93a0b8]">
              nikclas <span className="text-[#eaf0fb]">--compare</span> --sort $/1M
            </p>
          </div>
          <p
            className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] ${
              status === "live" ? "text-[#4de3ff]" : "animate-pulse text-[#ffb224]"
            }`}
          >
            <StatusDot tone={STATUS_TONE[status]} />
            {STATUS_LABEL[status]}
          </p>
        </div>

        <ul className="space-y-4 px-4 py-5 sm:px-5">
          {rows.map((m, i) => (
            <li key={m.id} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5">
              <p className="flex items-center gap-2 font-mono text-[13px] text-[#eaf0fb]">
                <span className={m.hot ? "text-[#ffb224]" : "text-[#93a0b8]"}>
                  {m.hot ? "▸" : "·"}
                </span>
                <span className="break-all">{m.name}</span>
                {m.tag && <Badge tone={m.tag === "BEST" ? "amber" : "muted"}>{m.tag}</Badge>}
              </p>
              <p className="font-mono text-[13px] font-medium tabular-nums text-[#eaf0fb]">
                {m.price}
                <span className="text-[#93a0b8]">/1M</span>
              </p>
              <Bar
                width={m.width}
                tone={m.hot ? "amber" : "signal"}
                animate
                delayMs={400 + i * 120}
                className="col-span-2"
              />
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-[#22304f] px-4 py-3 font-mono text-xs text-[#93a0b8]">
          <p>
            <span className="text-green-400">›</span>{" "}
            {status === "live"
              ? "live · updated just now"
              : status === "loading"
                ? "syncing live prices…"
                : "cached snapshot"}
            <span className="animate-blink ml-1 inline-block h-3.5 w-[7px] translate-y-[3px] bg-[#4de3ff]" />
          </p>
          <p className="hidden sm:block">in $ · out $ · via api.litellm.ai</p>
        </div>
      </div>

      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[#93a0b8]/70">
        Bar length = input $/1M · log scale
      </p>
    </div>
  );
}
