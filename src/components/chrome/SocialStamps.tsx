import { profile } from "@/data/profile";

/**
 * Social links as a strip of mini perforated postage stamps — the same
 * hole-mask construction as the LetsTalk stamp sheet, shrunk to a 44px
 * square: holes every 11px punched into all four edges (the four
 * radial-gradient layers intersect).
 */
const STAMP_MASK: React.CSSProperties = {
  maskImage:
    "radial-gradient(circle 2px at 5.5px 0, transparent 2px, black 2.5px), radial-gradient(circle 2px at 5.5px 100%, transparent 2px, black 2.5px), radial-gradient(circle 2px at 0 5.5px, transparent 2px, black 2.5px), radial-gradient(circle 2px at 100% 5.5px, transparent 2px, black 2.5px)",
  maskSize: "11px 100%, 11px 100%, 100% 11px, 100% 11px",
  maskRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
  maskComposite: "intersect",
};

/** Pastel wash rotation (one accent per stamp, cycling). */
const WASH_ACCENTS = [
  "var(--accent-mint)",
  "var(--accent-blue)",
  "var(--accent-yellow)",
  "var(--accent-pink)",
];

/** Slight per-stamp rest tilts; hover/focus straightens the stamp. */
const TILTS = ["-3deg", "2deg", "-2.5deg", "3deg"];

/* ---- Ink icons (GitHub + LinkedIn paths shared with DeskDock) ---- */

const ICON_CLASS = "h-[18px] w-[18px]";

const STROKE = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function GithubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${ICON_CLASS} fill-current`}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.13-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.69 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${ICON_CLASS} fill-current`}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

/** Simple X glyph for X (Twitter). */
function XIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS}>
      <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" {...STROKE} strokeWidth={2.4} />
    </svg>
  );
}

/** Simple "C" monogram for Contra. */
function ContraIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS}>
      <path d="M16.9 7.1 A7 7 0 1 0 16.9 16.9" {...STROKE} strokeWidth={2.4} />
    </svg>
  );
}

/** Asterisk doodle fallback for any platform without a drawn icon. */
function AsteriskIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS}>
      <path d="M12 4v16M5.1 8l13.8 8M18.9 8 5.1 16" {...STROKE} />
    </svg>
  );
}

function iconFor(label: string): React.ReactNode {
  const key = label.toUpperCase();
  if (key.includes("GITHUB")) return <GithubIcon />;
  if (key.includes("LINKEDIN")) return <LinkedInIcon />;
  if (key.includes("TWITTER") || key === "X") return <XIcon />;
  if (key.includes("CONTRA")) return <ContraIcon />;
  return <AsteriskIcon />;
}

/**
 * One mini stamp per social: a 44px perforated square (hole-mask edges,
 * pastel wash + 1px inset hairline, ink icon) resting at a slight tilt.
 * Hover / focus-visible springs it up 3px, straightens it, and slides a
 * soft lift shadow underneath (shadow lives on the unmasked <a> so the
 * perforation can't clip it). Tailwind's hover variant is gated behind
 * `(hover: hover)`, so touch devices skip the hover state, and
 * motion-reduce collapses the spring to an instant change.
 */
export function SocialStamps({ className }: { className?: string }) {
  return (
    <ul
      className={["flex flex-wrap items-center justify-center gap-2.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      {profile.socials.map((social, i) => (
        <li key={social.label}>
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            title={social.label}
            data-hide-cursor="true"
            style={{ "--tilt": TILTS[i % TILTS.length] } as React.CSSProperties}
            className={[
              "block h-11 w-11 rotate-[var(--tilt)]",
              "transition-[rotate,translate,box-shadow] duration-[250ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
              "hover:-translate-y-[3px] hover:rotate-0 hover:shadow-[var(--shadow-lift)]",
              "focus-visible:-translate-y-[3px] focus-visible:rotate-0 focus-visible:shadow-[var(--shadow-lift)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)]",
            ].join(" ")}
          >
            <span
              className="pointer-events-none flex h-full w-full items-center justify-center text-[var(--ink)]"
              style={{
                background: `color-mix(in srgb, ${WASH_ACCENTS[i % WASH_ACCENTS.length]} 18%, var(--card))`,
                boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--ink) 30%, transparent)",
                ...STAMP_MASK,
              }}
            >
              {iconFor(social.label)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default SocialStamps;
