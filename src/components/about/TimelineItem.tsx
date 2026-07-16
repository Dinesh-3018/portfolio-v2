import type { TimelineEntry } from "@/data/types";
import { ACCENT_INK } from "@/components/ui/accentInk";
import StampBadge from "@/components/ui/StampBadge";

export interface TimelineItemProps {
  entry: TimelineEntry;
  first?: boolean;
}

/**
 * One logbook row: a small pink square rotated onto the rail, company name
 * (linked when a url exists), mono uppercase role, description, and the
 * period inked on as a rubber date stamp in the entry's text-safe accent.
 */
export function TimelineItem({ entry, first }: TimelineItemProps) {
  const accent = ACCENT_INK[entry.accent];
  return (
    <article
      className={["flex gap-5 py-8", first ? "" : "border-t border-[var(--line)]"].join(" ")}
    >
      <span
        aria-hidden="true"
        className="relative z-10 mt-2 flex h-8 w-8 flex-shrink-0 justify-center"
      >
        <span className="mt-1 block h-2.5 w-2.5 rotate-45 bg-[var(--accent-pink)]" />
      </span>
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
          {entry.url ? (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent-pink)] hover:underline"
            >
              {entry.company}
            </a>
          ) : (
            entry.company
          )}
        </h3>
        <p className="mt-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          {entry.role}
        </p>
        <p className="logbook-rule mt-3 max-w-2xl text-sm text-[var(--ink)]/80 sm:text-base">
          {entry.description}
        </p>
        <StampBadge size="sm" tone={accent} rotate={-2} className="mt-5">
          {entry.period}
        </StampBadge>
      </div>
    </article>
  );
}

export default TimelineItem;
