import HandwrittenNote from "@/components/ui/HandwrittenNote";
import Reveal from "@/components/ui/Reveal";
import Squiggle from "@/components/ui/Squiggle";
import { profile } from "@/data/profile";
import HeroClock from "./HeroClock";
import NameInk from "./NameInk";

/** Zigzag-ended washi strip (same construction as TapedFrame's tape).
 *  Size comes from the caller's className (e.g. h-7 w-24). */
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

/** Rounded sticker pill with an ink border and hard offset shadow. */
function StickerPill({
  children,
  bg,
  color,
  tilt,
}: {
  children: string;
  bg: string;
  color: string;
  tilt: number;
}) {
  return (
    <span
      className="inline-block whitespace-nowrap rounded-full border-2 border-[var(--ink)] px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] shadow-[3px_3px_0_rgba(22,22,22,0.9)]"
      style={{ background: bg, color, transform: `rotate(${tilt}deg)` }}
    >
      {children}
    </span>
  );
}

/** Rectangular employer sticker (mint/cream), gently tilted. The label only
 *  locks to one line from lg — at md the chip column is narrow, so the text
 *  may wrap to stay inside it instead of getting clipped mid-word. */
function EmployerChip({ children, bg, tilt }: { children: string; bg: string; tilt: number }) {
  return (
    <span
      className="inline-block max-w-full px-4 py-2 text-sm font-medium text-[var(--ink)] shadow-[var(--shadow-paper)] lg:whitespace-nowrap"
      style={{ background: bg, transform: `rotate(${tilt}deg)` }}
    >
      {children}
    </span>
  );
}

/**
 * Home hero — an asymmetric two-column layout: name column left, sticker
 * cluster right. The pixel-type name sits on a washi-taped label card
 * (Maker's Desk); availability is a rubber stamp; role/location are plain
 * sticker pills. Live IST clock pinned top-right. On mobile everything
 * stacks centered.
 */
export function Hero() {
  const [firstPill, secondPill] = profile.employerPills;

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-8 sm:px-8 sm:pb-20 lg:pt-10">
      {/* Scoped entrance: the name card "slaps down" onto the desk when the
          hero reveals (keyed off Reveal's animate-fade-in-up class), then
          the washi strips press on a beat later. hero-name-card / hero-tape
          exist only in this component, so the selectors can't leak. */}
      <style>{`
        @keyframes hero-place {
          0% { opacity: 0; scale: 1.07; rotate: -3.5deg; translate: 0 -12px; }
          60% { opacity: 1; scale: 0.995; rotate: -0.5deg; }
          100% { opacity: 1; scale: 1; rotate: -1deg; translate: 0 0; }
        }
        @keyframes hero-tape-in {
          from { opacity: 0; scale: 0.6; }
          to { opacity: 1; scale: 1; }
        }
        .animate-fade-in-up .hero-name-card {
          animation: hero-place 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
        }
        .animate-fade-in-up .hero-tape {
          animation: hero-tape-in 0.28s ease-out 0.5s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up .hero-name-card,
          .animate-fade-in-up .hero-tape {
            animation-duration: 0.01s;
            animation-delay: 0s;
          }
        }
      `}</style>
      <Reveal className="mx-auto max-w-5xl">
        <div className="flex justify-center md:justify-end">
          <HeroClock />
        </div>

        {/* md gives the chip column a wider share (0.85fr) so the employer
            chips fit at 768-1023; lg restores the original asymmetric split. */}
        <div className="mt-4 md:mt-6 md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-center md:gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          {/* Name column */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <HandwrittenNote className="text-3xl sm:text-4xl">my name is</HandwrittenNote>
              <Squiggle className="mt-0.5 text-[var(--ink)]" />
            </div>

            {/* The name on a washi-taped label card. */}
            <div className="hero-name-card relative mt-3 inline-block -rotate-1 border border-[rgba(22,22,22,0.12)] bg-[var(--card)] px-6 py-3 shadow-[0_1px_2px_rgba(22,22,22,0.10),0_8px_20px_rgba(22,22,22,0.08)] sm:px-9 sm:py-4">
              <Tape className="hero-tape -left-8 -top-3 h-7 w-24" rotate={-8} />
              <Tape className="hero-tape -right-8 -top-3 h-7 w-24" rotate={7} />
              <NameInk name={profile.name} />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <StickerPill bg="var(--accent-yellow)" color="var(--ink)" tilt={-2}>
                {profile.role}
              </StickerPill>
              <StickerPill bg="var(--accent-pink)" color="#ffffff" tilt={2}>
                {profile.location}
              </StickerPill>
            </div>
          </div>

          {/* Employer chips, taped down as a captioned cluster (annotation:
              they previously floated disconnected, "hanging in nowhere"). */}
          <div className="mt-12 flex flex-col items-center gap-5 md:mt-0 md:items-start md:pl-4">
            <span className="font-hand text-2xl text-[var(--ink-soft)] md:ml-6">
              where I&apos;ve been shipping ↓
            </span>
            {/* The staggered offsets only kick in at lg, where the column is
                wide enough — at md they pushed the nowrap chips past the
                viewport edge and the section's overflow-hidden cut the text. */}
            {firstPill && (
              <span className="relative inline-block max-w-full lg:ml-2">
                <Tape className="-top-2.5 left-1/2 h-5 w-16 -translate-x-1/2" rotate={-6} />
                <EmployerChip bg="var(--accent-mint)" tilt={-3}>
                  {firstPill}
                </EmployerChip>
              </span>
            )}
            {secondPill && (
              <span className="relative inline-block max-w-full lg:ml-12">
                <Tape className="-top-2.5 left-1/2 h-5 w-16 -translate-x-1/2" rotate={5} />
                <EmployerChip bg="var(--accent-cream)" tilt={2}>
                  {secondPill}
                </EmployerChip>
              </span>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default Hero;
