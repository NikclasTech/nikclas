import type { ReactNode } from "react";

/** Underlined signal-colored external link. */
export default function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`text-[#4de3ff]/80 underline decoration-[#4de3ff]/30 underline-offset-4 transition-colors duration-200 hover:text-[#4de3ff]${className ? ` ${className}` : ""}`}
    >
      {children}
    </a>
  );
}
