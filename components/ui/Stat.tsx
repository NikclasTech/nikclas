/** One definition-list stat (hero numbers row). */
export default function Stat({
  label,
  value,
  accent = false,
  className,
}: {
  label: string;
  value: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="uppercase tracking-[0.18em] text-[#93a0b8]">{label}</dt>
      <dd className={`mt-1 text-lg font-bold ${accent ? "text-[#4de3ff]" : "text-[#eaf0fb]"}`}>
        {value}
      </dd>
    </div>
  );
}
