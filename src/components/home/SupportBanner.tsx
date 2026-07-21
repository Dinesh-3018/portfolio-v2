import { supportBanner } from "@/data/support";
import StrikeDay from "./StrikeDay";

/**
 * Circular protest seal, postmark-style: the demand big in the middle, the
 * question arced around the rim, uneven ink via `.stamp-rough`. Fixed id on
 * the text arc keeps server/client markup identical (RSC hydration).
 */
function ProtestSeal({ center, rim, tone }: { center: string; rim: string; tone: string }) {
  const lines = center.split(" ");
  const rimText = `${rim} · ${rim} · `;
  return (
    <span className="stamp-rough block" style={{ color: tone }}>
      <svg viewBox="0 0 150 150" width={150} height={150} aria-hidden="true">
        <circle cx="75" cy="75" r="71" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="75" cy="75" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <defs>
          <path id="sb-seal-arc" d="M 75,75 m -60,0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0" />
        </defs>
        <text
          fontSize="9.5"
          fontWeight="700"
          letterSpacing="2.6"
          fill="currentColor"
          style={{ fontFamily: "var(--font-space-mono), monospace" }}
        >
          <textPath href="#sb-seal-arc" startOffset="0">
            {rimText}
          </textPath>
        </text>
        <path d="M22 75 h12 M116 75 h12" stroke="currentColor" strokeWidth="1.5" />
        {lines.map((line, i) => (
          <text
            key={line}
            x="75"
            y={75 + (i - (lines.length - 1) / 2) * 24 + 8}
            textAnchor="middle"
            fontSize="25"
            fontWeight="700"
            letterSpacing="2"
            fill="currentColor"
            style={{ fontFamily: "var(--font-space-mono), monospace" }}
          >
            {line}
          </text>
        ))}
      </svg>
    </span>
  );
}

/** Blood-red hand-painted underline — a streak with two running drips. */
function BloodLine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 230 30"
      aria-hidden="true"
      className={className}
      width={230}
      height={30}
      fill="#e12b36"
    >
      <path d="M2 5 C 50 1, 150 2, 226 6 C 228 8, 227 9, 224 10 C 150 13, 60 13, 4 10 C 2 8, 1 6, 2 5 Z" />
      <path d="M46 10 C 45 16, 44 21, 47 26 C 50 21, 49 15, 50 10 Z" />
      <path d="M148 11 C 147.3 15, 147 18, 149.5 21 C 152 18, 151.2 14, 152 11 Z" />
    </svg>
  );
}

/**
 * Full-bleed solidarity band at the top of the home page — an ink placard,
 * deliberately the strongest element on the page, signed openly. Content
 * and the on/off switches live in src/data/support.ts.
 *
 * Static and still on purpose (a statement, not a toy): the only motion is
 * the pulse on the status dots, which the global reduced-motion block
 * already silences.
 */
export function SupportBanner() {
  if (!supportBanner.enabled) return null;

  const tagQuery = encodeURIComponent(supportBanner.hashtag);
  const strike = supportBanner.hungerStrike;
  const blood = "#e12b36";

  return (
    <section
      aria-label="Solidarity statement"
      className="relative border-b-2 border-[var(--ink)] bg-[var(--ink)] text-[#f5f2ea]"
    >
      {/* barricade-tape edge in blood red */}
      <div
        aria-hidden="true"
        className="h-[6px] w-full"
        style={{
          background: `repeating-linear-gradient(135deg, ${blood} 0 14px, transparent 14px 28px)`,
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <p
            className="font-pixel flex items-center gap-3 text-[13px] tracking-[0.18em] text-[var(--accent-yellow)] sm:text-[15px]"
            style={{ textTransform: "uppercase" }}
          >
            <span
              aria-hidden="true"
              className="animate-status-pulse h-2.5 w-2.5 flex-none rounded-full"
              style={{ background: blood }}
            />
            {supportBanner.eyebrow}
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-[2.6rem]">
            {supportBanner.headline}
          </h2>
          <BloodLine className="-mt-1 block" />

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#f5f2ea]/75 sm:text-[15px]">
            {supportBanner.message}
          </p>

          {strike.show ? (
            <p
              className="font-pixel mt-5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[2px] border-[1.5px] px-4 py-2.5 text-[14px] uppercase tracking-[0.1em] sm:text-[15px]"
              style={{ borderColor: blood, background: "rgba(225, 43, 54, 0.12)" }}
            >
              <span
                aria-hidden="true"
                className="animate-status-pulse h-2 w-2 flex-none rounded-full"
                style={{ background: blood }}
              />
              <span style={{ color: blood }}>{strike.name}</span>
              <span className="text-[#f5f2ea]">
                HUNGER STRIKE · DAY <StrikeDay since={strike.since} />
              </span>
              <span className="text-[#f5f2ea]/65">{strike.note}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-none flex-col items-start gap-4 lg:items-end">
          {/* The hashtag as a placard sticker, linking to the live tag */}
          <a
            href={`https://x.com/search?q=${tagQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            data-track="support_banner_hashtag"
            className="inline-block -rotate-2 rounded-[2px] border-2 border-[var(--ink)] bg-[var(--accent-yellow)] px-4 py-2.5 font-mono text-sm font-bold tracking-[0.04em] text-[var(--ink)] shadow-[4px_4px_0_rgba(245,242,234,0.35)] transition-transform duration-150 ease-out hover:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)] motion-reduce:transition-none"
          >
            {supportBanner.hashtag}
          </a>

          <a
            href={supportBanner.link.href}
            target="_blank"
            rel="noopener noreferrer"
            data-track="support_banner_link"
            className="border-b-[1.5px] border-dashed border-[#f5f2ea]/60 pb-0.5 font-mono text-xs font-bold tracking-[0.12em] text-[#f5f2ea] transition-colors hover:border-[var(--accent-pink)] hover:text-[var(--accent-pink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)]"
          >
            {supportBanner.link.label} <span aria-hidden="true">→</span>
          </a>

          {/* Signed openly — his statement, his name. */}
          <p className="font-hand -rotate-2 text-2xl text-[#f5f2ea]/90">{supportBanner.signature}</p>
        </div>
      </div>

      {/* The seal: slammed across the band's bottom-right edge from lg (half
          on the placard, half on the paper below — z-10 keeps it above the
          hero); sits in-flow, centered, on smaller screens. */}
      <div className="pointer-events-none relative z-10 mx-auto -mt-1 w-fit -rotate-12 pb-5 lg:absolute lg:-bottom-10 lg:right-10 lg:m-0 lg:p-0">
        <div className="animate-stamp-slam">
          <ProtestSeal
            center={supportBanner.stamp.center}
            rim={supportBanner.stamp.rim}
            tone={blood}
          />
        </div>
      </div>
    </section>
  );
}

export default SupportBanner;
