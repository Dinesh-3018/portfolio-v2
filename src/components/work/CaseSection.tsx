export interface CaseSectionProps {
  title: string;
  /** Chapter number for the mono "SECTION 0N" eyebrow (omitted = no eyebrow). */
  number?: number;
  variant?: "prose" | "list";
  /** Paragraphs (prose) or bullet items (list). Ignored when children are given. */
  items?: string[];
  children?: React.ReactNode;
}

/**
 * Narrow prose column for a case-study chapter: mono SECTION 0N eyebrow
 * over a Fraunces title. "prose" renders paragraphs; "list" renders
 * square pink-marker bullets with generous leading.
 */
export function CaseSection({ title, number, variant = "prose", items, children }: CaseSectionProps) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-24">
      {number ? (
        <p className="mb-4 font-mono text-xs font-bold tracking-[0.22em] text-[var(--ink-soft)]">
          SECTION {String(number).padStart(2, "0")}
        </p>
      ) : null}
      <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-[2.6rem] sm:leading-tight">
        {title}
      </h2>
      <div className="mt-7 space-y-6 text-[17px] leading-relaxed text-[var(--ink)]/90">
        {children ??
          (variant === "list" ? (
            <ul className="list-[square] space-y-3 pl-5 leading-loose marker:text-[var(--accent-pink)]">
              {items?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            items?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          ))}
      </div>
    </section>
  );
}

export default CaseSection;
