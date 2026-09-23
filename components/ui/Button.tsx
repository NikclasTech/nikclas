import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "ghost" | "pill";
type Size = "md" | "lg";

const SIZES: Record<Size, string> = {
  md: "px-4 py-2.5",
  lg: "px-5 py-3",
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "group bg-[#ffb224] font-display text-sm font-semibold uppercase tracking-wide text-[#060b1a] transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0",
  ghost:
    "border border-[#22304f] bg-transparent font-mono text-sm text-[#eaf0fb] transition-colors duration-200 hover:border-[#4de3ff]/60 hover:text-[#4de3ff]",
  pill:
    "rounded-full border border-[#22304f] px-3 py-1.5 font-mono text-xs text-[#93a0b8] transition-colors duration-200 hover:border-[#4de3ff]/60 hover:text-[#4de3ff]",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type Props =
  | (Common & { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | (Common & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>);

/** Brand button. Renders an anchor when `href` is given, else a button. */
export default function Button(props: Props) {
  const { variant = "ghost", size = "md", className } = props;
  const cls = `inline-flex items-center justify-center gap-2 rounded-md ${SIZES[size]} ${VARIANTS[variant]}${className ? ` ${className}` : ""}`;
  if (props.href) {
    const { variant: _v, size: _s, className: _c, ...rest } = props as Common &
      AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    void _v;
    void _s;
    void _c;
    return <a className={cls} {...rest} />;
  }
  const { variant: _v, size: _s, className: _c, ...rest } = props as Common &
    ButtonHTMLAttributes<HTMLButtonElement>;
  void _v;
  void _s;
  void _c;
  return <button type="button" className={cls} {...rest} />;
}
