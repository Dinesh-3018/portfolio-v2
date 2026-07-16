import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/types";
import { ACCENT } from "@/data/site";
import { ACCENT_INK } from "@/components/ui/accentInk";
import ArchivedStamp from "@/components/ui/ArchivedStamp";
import StampBadge from "@/components/ui/StampBadge";
import TicketTag from "@/components/ui/TicketTag";

/** Rest tilts for the Nº stamps: every entry in the ledger sits a little
 *  crooked until its row is hovered (straighten is CSS in WorkLedger). */
const STAMP_TILTS = [-3, 2.5, -2, 3, -2.5, 2, -3.5, 2.5, -2];

/** Zigzag-ended washi strip (same construction as TapedFrame's tape),
 *  sized by the caller — holds the mobile thumbnail's mat down. */
function Tape({ className, rotate }: { className?: string; rotate: number }) {
  return (
    <span
      aria-hidden="true"
      className={["absolute block", className].filter(Boolean).join(" ")}
      style={{
        background: "var(--tape)",
        clipPath:
          "polygon(4% 0, 96% 2%, 100% 18%, 95% 36%, 100% 55%, 96% 74%, 100% 92%, 94% 100%, 5% 98%, 0 82%, 5% 62%, 0 45%, 4% 28%, 0 10%)",
        filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))",
        transform: `rotate(${rotate}deg)`,
      }}
    />
  );
}

/** Hand-drawn arrow: a wobbly shaft plus a loose two-stroke head. */
function ArrowDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2 11 C 12 9, 24 12.5, 38 10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M31 4.5 C 34.5 7, 38 9, 41.5 10.4 C 37 12.2, 33.5 14.5, 30.5 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface LedgerRowProps {
  project: Project;
  /** Position in the ledger — picks the stamp's rest tilt. */
  index: number;
  /** Hover-in on the row (peek choreography lives in WorkLedger). */
  onPeekStart: (event: React.PointerEvent<HTMLAnchorElement>) => void;
  /** Hover-out on the row. */
  onPeekEnd: (event: React.PointerEvent<HTMLAnchorElement>) => void;
}

/**
 * One entry in the ledger. The entire row is a single Link to the case
 * study. Desktop (md+): Nº stamp | Fraunces title | focus line + ticket
 * tags + hand-drawn arrow, with the hover choreography handled by the
 * wl-* rules in WorkLedger's scoped stylesheet. Below md (and as the
 * no-hover fallback) it renders as a compact card: stamp + title +
 * blurb with a small taped thumbnail on the right.
 */
export function LedgerRow({ project, index, onPeekStart, onPeekEnd }: LedgerRowProps) {
  const accent = ACCENT[project.accent];
  const ink = ACCENT_INK[project.accent];
  const number = `Nº ${String(project.order).padStart(2, "0")}`;

  return (
    <Link
      href={`/work/${project.slug}`}
      aria-label={`${project.title} — case study`}
      data-hide-cursor="true"
      onPointerEnter={onPeekStart}
      onPointerLeave={onPeekEnd}
      className="wl-row group block rounded-[2px] px-3 py-6 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--accent-pink)] sm:px-4 md:px-5 md:py-7"
      style={
        {
          "--wl-accent": accent,
          "--wl-tilt": `${STAMP_TILTS[index % STAMP_TILTS.length]}deg`,
        } as React.CSSProperties
      }
    >
      {/* Mobile / no-hover fallback: compact card with an inline taped thumbnail. */}
      <span className="flex items-center gap-4 md:hidden">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="wl-stamp">
              <StampBadge size="sm" rotate={0} tone={ink}>
                {number}
              </StampBadge>
            </span>
            {project.archived ? (
              <ArchivedStamp size="sm" className="text-[var(--ink-soft)]" />
            ) : null}
          </span>
          <span className="font-display mt-2.5 block text-2xl font-semibold leading-tight tracking-tight">
            {project.title}
          </span>
          <span className="mt-1.5 block text-sm leading-snug text-[var(--ink-soft)]">
            {project.cardBlurb}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="relative w-24 shrink-0 rotate-2 border border-[rgba(22,22,22,0.12)] bg-[var(--card)] p-1 shadow-[var(--shadow-paper)]"
        >
          <span className="relative block aspect-[4/3] w-full overflow-hidden">
            <Image
              src={project.cover.src}
              alt=""
              width={96}
              height={72}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </span>
          <Tape className="-top-1.5 left-1/2 h-3 w-10 -translate-x-1/2" rotate={-5} />
        </span>
      </span>

      {/* Desktop ledger row: stamp | title | focus + tags + arrow. */}
      <span className="hidden md:grid md:grid-cols-[6.5rem_minmax(0,1fr)_auto] md:items-center md:gap-x-8">
        <span className="wl-stamp">
          <StampBadge size="sm" rotate={0} tone={ink}>
            {number}
          </StampBadge>
        </span>
        <span className="wl-title font-display block text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          {project.title}
        </span>
        <span className="flex items-center gap-3">
          {project.archived ? (
            <ArchivedStamp size="sm" className="text-[var(--ink-soft)]" />
          ) : null}
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)] lg:inline">
            {project.meta.focus}
          </span>
          {project.tags.slice(0, 2).map((tag) => (
            <TicketTag key={tag} accent={accent}>
              {tag}
            </TicketTag>
          ))}
          <ArrowDoodle className="wl-arrow h-5 w-9 shrink-0 text-[var(--ink)]" />
        </span>
      </span>
    </Link>
  );
}

export default LedgerRow;
