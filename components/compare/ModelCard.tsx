import { fmt, fmtCtx, vendorLabel, websiteForVendor } from "../../src/lib/format";
import type { LivePrice, StaticSpec } from "../../src/lib/litellm";
import type { Capabilities } from "../../src/pricing/types";

export type MergedModel = StaticSpec & LivePrice & { barWidth: string };

const DEV_CAPS: { key: keyof Capabilities; label: string }[] = [
  { key: "function_calling", label: "Functions" },
  { key: "vision", label: "Vision" },
  { key: "structured_output", label: "JSON mode" },
  { key: "prompt_caching", label: "Caching" },
];

function SpecRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-[#22304f]/70 py-2.5">
      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#93a0b8]">
        {label}
      </dt>
      <dd
        className={`font-mono text-[13px] tabular-nums ${
          accent ? "font-bold text-[#ffb224]" : "text-[#eaf0fb]"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function ModelCard({ model, winner, tied }: { model: MergedModel; winner: boolean; tied: boolean }) {
  const tag = tied ? "Tie" : winner ? "Best value" : "Baseline";
  const site = websiteForVendor(vendorLabel(model.vendor));
  const hostname = site ? new URL(site).hostname : null;
  return (
    <article
      aria-label={`${model.name} datasheet`}
      className={`relative flex flex-col rounded-xl border p-5 backdrop-blur transition-colors duration-200 sm:p-6 ${
        winner && !tied
          ? "border-[#ffb224]/50 bg-[#0c1429] shadow-[0_0_50px_-18px_rgba(255,178,36,0.45)]"
          : "border-[#22304f] bg-[#0c1429]/60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#93a0b8]">
          {vendorLabel(model.vendor)}
        </p>
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
            winner && !tied
              ? "border-[#ffb224]/40 bg-[#ffb224]/10 text-[#ffb224]"
              : "border-[#22304f] text-[#93a0b8]"
          }`}
        >
          {tag}
        </span>
      </div>

      <h3 className="mt-3 break-all font-display text-xl font-semibold tracking-tight text-[#eaf0fb]">
        {model.name}
      </h3>

      <p className="mt-4 flex items-baseline gap-1.5">
        <span
          className={`font-display text-5xl font-bold tabular-nums ${
            winner && !tied ? "text-[#ffb224]" : "text-[#eaf0fb]"
          }`}
        >
          {fmt(model.input)}
        </span>
        <span className="font-mono text-xs text-[#93a0b8]">/1M in</span>
      </p>

      <div aria-hidden className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${winner && !tied ? "bg-[#ffb224]" : "bg-[#4de3ff]/70"}`}
          style={{ width: model.barWidth }}
        />
      </div>

      <dl className="mt-4">
        <SpecRow label="Input /1M" value={fmt(model.input)} accent={winner && !tied} />
        <SpecRow label="Output /1M" value={fmt(model.output)} />
        <SpecRow label="Context" value={fmtCtx(model.maxInputTokens)} />
        <SpecRow label="Median speed" value={model.speed} />
      </dl>

      <div className="mt-4 border-t border-[#22304f]/70 pt-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#93a0b8]">
          For developers
        </p>
        <ul aria-label={`${model.name} capabilities`} className="mt-2.5 flex flex-wrap gap-1.5">
          {DEV_CAPS.map(({ key, label }) => {
            const on = model.capabilities[key];
            return (
              <li
                key={key}
                title={`${label}: ${on ? "supported" : "not supported"}`}
                className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[11px] ${
                  on
                    ? "border-[#4de3ff]/40 bg-[#4de3ff]/10 text-[#4de3ff]"
                    : "border-[#22304f] text-[#93a0b8]/60"
                }`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${on ? "bg-[#4de3ff]" : "bg-[#93a0b8]/40"}`}
                />
                {on ? label : `No ${label.toLowerCase()}`}
              </li>
            );
          })}
        </ul>
        {site && hostname && (
          <a
            href={site}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-[#4de3ff]/80 underline decoration-[#4de3ff]/30 underline-offset-4 transition-colors duration-200 hover:text-[#4de3ff]"
          >
            {hostname}
            <span aria-hidden>↗</span>
          </a>
        )}
      </div>
    </article>
  );
}
