/** Eyebrow + display title + lede shared by content sections. */
export default function SectionHeader({
  eyebrow,
  title,
  titleId,
  description,
}: {
  eyebrow: string;
  title: string;
  titleId?: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#4de3ff]/80">
        {eyebrow}
      </p>
      <h2
        id={titleId}
        className="display-tight mt-3 font-display text-3xl font-bold uppercase text-[#eaf0fb] sm:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#93a0b8]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
