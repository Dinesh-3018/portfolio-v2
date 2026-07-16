import Link from "next/link";

export interface UnderlineLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}

/**
 * Mono tracked link with a hairline underline that stretches slightly on
 * hover while the label nudges right (the VIEW PROJECT pattern).
 */
export function UnderlineLink({ href, children, external, className }: UnderlineLinkProps) {
  const linkClassName = [
    "group relative inline-flex w-fit items-center pb-1 font-mono text-sm font-normal tracking-[0.14em]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {/* Stitched underline: dashed seam that solidifies + stretches on hover. */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-full origin-left border-b-[1.5px] border-dashed border-current transition-transform duration-300 ease-out group-hover:scale-x-[1.06] group-hover:border-solid"
      />
      <span className="flex items-center gap-2 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
        {children}
      </span>
    </>
  );

  if (external || href.startsWith("mailto:") || /^https?:\/\//.test(href)) {
    return (
      <a
        data-hide-cursor="true"
        className={linkClassName}
        href={href}
        {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link data-hide-cursor="true" className={linkClassName} href={href}>
      {inner}
    </Link>
  );
}

export default UnderlineLink;
