import Link from "next/link";
import HandwrittenNote from "@/components/ui/HandwrittenNote";
import Postmark from "@/components/ui/Postmark";
import Reveal from "@/components/ui/Reveal";
import { ScribbleCircle } from "@/components/ui/Scribble";
import StampBadge from "@/components/ui/StampBadge";
import { ACCENT_INK } from "@/components/ui/accentInk";
import { profile } from "@/data/profile";

/** Ruled index-card treatments for the pinned field notes (cream/mint washes).
 *  The collage stagger on the second note waits until lg: at md (768) the
 *  column is only ~365px, so an ml-10 push shoved the card's right edge and
 *  tape past the viewport, where the section's overflow-hidden clipped them. */
const NOTE_STYLES = [
  { rotate: "-rotate-[1.4deg]", offset: "", bg: "var(--accent-cream)" },
  {
    rotate: "rotate-[1.8deg]",
    offset: "lg:ml-10",
    bg: "color-mix(in srgb, var(--accent-mint) 55%, var(--card))",
  },
];

/** Light accent washes behind the FOCUS chips — ink text stays readable on all. */
const FOCUS_WASHES = [
  "color-mix(in srgb, var(--accent-yellow) 40%, var(--card))",
  "color-mix(in srgb, var(--accent-mint) 48%, var(--card))",
  "color-mix(in srgb, var(--accent-blue) 36%, var(--card))",
  "color-mix(in srgb, var(--accent-pink) 22%, var(--card))",
];

/** REAL Code 128 bar/space widths (bars first, checksum included) encoding
 *  "youtu.be/dQw4w9WgXcQ" — scan the badge and get exactly what you deserve. */
const RICKROLL_SBS =
  "2112142121411341111242111241121242111222311214211122141132221412212113314211122212314211123211223113211221143311211411222113311221322331112";

/** Static SVG render of the Code 128 pattern with quiet zones. */
function RickrollBarcode({ className }: { className?: string }) {
  const QUIET = 10;
  let x = QUIET;
  const bars: { x: number; w: number }[] = [];
  RICKROLL_SBS.split("").forEach((ch, i) => {
    const w = Number(ch);
    if (i % 2 === 0) bars.push({ x, w });
    x += w;
  });
  return (
    <svg viewBox={`0 0 ${x + QUIET} 24`} preserveAspectRatio="none" className={className}>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={24} fill="var(--ink)" />
      ))}
    </svg>
  );
}

/** Zigzag-ended washi strip (same construction as the Hero's tape).
 *  Size comes from the caller's className (e.g. h-6 w-20). */
function Tape({ className, rotate }: { className?: string; rotate: number }) {
  return (
    <span
      aria-hidden="true"
      className={["absolute", className].filter(Boolean).join(" ")}
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

/** One ledger row of the maker ID card: mono micro-label + value, hairline rule. */
function IdRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 border-b border-[var(--line)] py-2.5 last:border-b-0">
      <dt className="w-16 shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-sm font-semibold tracking-tight text-[var(--ink)]">
        {children}
      </dd>
    </div>
  );
}

/**
 * About teaser, rebuilt as "MAKER ID + field notes": centered header (ringed
 * "what's up" + the who-am-I lead), then a two-column composition — a
 * library-card style maker ID artifact on the left (a hanging badge: hover
 * swings it on its lanyard slot while a scanner line sweeps the barcode;
 * ledger rows from profile data, an ACTIVE stamp that thumps in on reveal,
 * barcode strip + postmark) and the two teaser paragraphs as washi-taped ruled
 * field notes on the right, with the handwritten link to /about beneath them.
 * The old separate skill-label row is absorbed into the card's FOCUS row.
 */
export function AboutTeaser() {
  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-6 sm:px-8">
      {/* Scoped keyframe: the ACTIVE stamp thumps in once, keyed off the
          animation class Reveal applies to the ID card wrapper (delay=1).
          `.at-active-stamp` exists only in this component, so the descendant
          selector can't leak. `both` keeps it hidden through its delay; the
          server render (no animate class) shows it statically. */}
      <style>{`
        @keyframes at-stamp-thump {
          0% { opacity: 0; transform: scale(2.4); }
          55% { opacity: 1; transform: scale(0.9); }
          78% { transform: scale(1.07); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up-delay-1 .at-active-stamp {
          animation: 0.45s ease-out 0.55s both at-stamp-thump;
        }
        /* Fresh hover: a holographic ID-card sheen — a diagonal glare sweeps
           across the card like tilting a real hologram badge into the light,
           while the red scanner line reads the barcode and the VERIFIED
           postmark inks up. (Replaces the old lanyard swing; distinct from
           the postcard's 3D tilt.) */
        .at-sheen {
          background: linear-gradient(
            105deg,
            transparent 34%,
            rgba(255, 255, 255, 0.5) 47%,
            rgba(255, 255, 255, 0.92) 50%,
            rgba(255, 255, 255, 0.5) 53%,
            transparent 66%
          );
          background-size: 220% 100%;
          background-position: 170% 0;
          opacity: 0;
        }
        @media (hover: hover) {
          .at-badge:hover .at-sheen { animation: at-sheen 0.9s ease-out; }
          .at-badge:hover .at-scan { animation: at-scan 0.95s ease-in-out 0.15s; }
          .at-badge:hover .at-barcode { animation: at-barcode-flicker 0.95s ease-in-out 0.15s; }
          .at-badge:hover .at-postmark { opacity: 0.6; }
        }
        @keyframes at-sheen {
          0% { background-position: 170% 0; opacity: 0; }
          14% { opacity: 1; }
          82% { opacity: 1; }
          100% { background-position: -70% 0; opacity: 0; }
        }
        @keyframes at-scan {
          0% { left: 4%; opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { left: 94%; opacity: 0; }
        }
        @keyframes at-barcode-flicker {
          0%, 35%, 75%, 100% { opacity: 1; }
          55% { opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up-delay-1 .at-active-stamp {
            animation-duration: 0.01s;
            animation-delay: 0s;
          }
          .at-badge:hover .at-sheen,
          .at-badge:hover .at-scan,
          .at-badge:hover .at-barcode {
            animation: none;
          }
        }
      `}</style>

      {/* Hand-drawn contour line dividing the hero from this section. */}
      <div aria-hidden="true" className="-mx-5 sm:-mx-8">
        <svg viewBox="0 0 1440 210" fill="none" preserveAspectRatio="none" className="h-auto w-full">
          <path
            d="M-4 192c96-26 190-32 288-44s192-18 288-32 190-12 288-24 192-16 288-6 194 24 296 50"
            stroke="var(--line)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Header: ringed aside + the who-am-I statement, on one centered axis. */}
      <Reveal className="mx-auto mt-4 flex max-w-3xl flex-col items-center">
        <div className="relative px-9 py-3">
          <ScribbleCircle className="pointer-events-none absolute inset-0 h-full w-full text-[var(--accent-pink)]" />
          <HandwrittenNote>what&apos;s up</HandwrittenNote>
        </div>
        <p className="mt-8 text-center text-2xl font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-4xl">
          {profile.aboutTeaser.lead}
        </p>
      </Reveal>

      {/* Main composition: maker ID card (left) + pinned field notes (right). */}
      <div className="mx-auto mt-16 grid max-w-5xl gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start md:gap-10">
        {/* THE MAKER ID CARD */}
        <Reveal delay={1}>
          <div className="at-badge mx-auto w-full max-w-md md:mx-0">
            <div className="at-card relative origin-top -rotate-[1.5deg] overflow-hidden rounded-[2px] border border-[var(--ink)] bg-[var(--card)] shadow-[var(--shadow-press-lg)] transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              {/* Punched lanyard slot — the thing the badge "hangs" from. */}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-2 z-10 h-[7px] w-9 -translate-x-1/2 rounded-full border border-[color-mix(in_srgb,var(--ink)_35%,transparent)] bg-[var(--paper)] shadow-[inset_0_1px_2px_rgba(22,22,22,0.25)]"
              />
              {/* Holographic sheen — a diagonal glare that sweeps the card on
                  hover (clipped by the card's overflow-hidden). */}
              <span aria-hidden="true" className="at-sheen pointer-events-none absolute inset-0 z-30" />
              {/* Header strip */}
              <div className="flex items-center justify-between gap-3 border-b border-[var(--ink)] px-5 py-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                  MAKER ID · Nº 001
                </span>
                <span
                  aria-hidden="true"
                  className="font-pixel flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--ink)] text-xl leading-none text-white"
                >
                  {profile.initials.charAt(0)}
                </span>
              </div>

              {/* Ledger rows */}
              <dl className="px-5 py-2">
                <IdRow label="NAME">{profile.name}</IdRow>
                <IdRow label="ROLE">{profile.role}</IdRow>
                <IdRow label="BASE">{profile.location}</IdRow>
                <IdRow label="FOCUS">
                  <span className="flex flex-wrap gap-1.5">
                    {profile.aboutTeaser.skillAreas.map((skill, i) => (
                      <span
                        key={skill}
                        className="border border-[color-mix(in_srgb,var(--ink)_30%,transparent)] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--ink)]"
                        style={{ background: FOCUS_WASHES[i % FOCUS_WASHES.length] }}
                      >
                        {skill}
                      </span>
                    ))}
                  </span>
                </IdRow>
                <IdRow label="STATUS">
                  <span className="at-active-stamp inline-block">
                    <StampBadge size="sm" tone={ACCENT_INK.green} rotate={-3}>
                      ACTIVE
                    </StampBadge>
                  </span>
                </IdRow>
              </dl>

              {/* Bottom edge: barcode strip (scanned on hover) + postmark. */}
              <div className="relative px-5 pb-5 pt-3">
                <div className="mb-1.5 flex items-end gap-1.5">
                  <span className="font-hand text-lg leading-none text-[var(--ink-soft)]">
                    scan me — trust me
                  </span>
                  <svg
                    width="14"
                    height="16"
                    viewBox="0 0 14 16"
                    fill="none"
                    aria-hidden="true"
                    className="mb-px"
                  >
                    <path
                      d="M4 1c3 3 5 7 4.5 11"
                      stroke="var(--ink-soft)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4.5 9.5 8.5 14l4-3.5"
                      stroke="var(--ink-soft)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div aria-hidden="true" className="relative">
                  <RickrollBarcode className="at-barcode h-6 w-full" />
                  <div className="mt-1 text-center font-mono text-[8px] tracking-[0.35em] text-[var(--ink-soft)]">
                    dQw4w9WgXcQ
                  </div>
                  <span className="at-scan pointer-events-none absolute -inset-y-1 left-[4%] w-[3px] rounded-full bg-[var(--postal-red)] opacity-0 shadow-[0_0_8px_2px_rgba(216,54,93,0.45)]" />
                </div>
                <span className="at-postmark pointer-events-none absolute -right-2 -top-6 opacity-30 transition-opacity duration-200 motion-reduce:transition-none">
                  <Postmark size={52} label="VERIFIED" />
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* FIELD NOTES: teaser paragraphs pinned down with washi tape. */}
        <Reveal delay={2}>
          <div className="flex flex-col items-center md:items-start">
            {profile.aboutTeaser.paragraphs.slice(0, 2).map((paragraph, i) => {
              const style = NOTE_STYLES[i % NOTE_STYLES.length];
              return (
                <div
                  key={i}
                  className={[
                    "relative w-full max-w-sm",
                    style.rotate,
                    style.offset,
                    i > 0 ? "mt-9" : "mt-2",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Tape className="-left-4 -top-3 z-10 h-6 w-20" rotate={-8} />
                  <Tape className="-right-4 -top-3 z-10 h-6 w-20" rotate={7} />
                  <div
                    className="ruled border border-[var(--ink)] px-6 pb-6 pt-9 text-sm font-medium leading-[28px] text-[var(--ink)] shadow-[var(--shadow-press-sm)] sm:text-base"
                    style={{ backgroundColor: style.bg }}
                  >
                    {paragraph}
                  </div>
                </div>
              );
            })}

            <Link
              href="/about"
              data-hide-cursor="true"
              className="group mt-12 inline-flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)] md:ml-6"
            >
              <HandwrittenNote className="transition-transform duration-300 ease-out group-hover:-rotate-3 motion-reduce:transition-none">
                explore my work!
              </HandwrittenNote>
              <svg
                width="46"
                height="22"
                viewBox="0 0 46 22"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-300 ease-out group-hover:translate-x-1.5 motion-reduce:transition-none"
              >
                <path
                  d="M2 13c13 2 26 1 40-3"
                  stroke="var(--ink)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M33 4l10 5.5L32 18"
                  stroke="var(--ink)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default AboutTeaser;
