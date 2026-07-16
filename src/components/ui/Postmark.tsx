export interface PostmarkProps {
  tone?: "ink" | "red";
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Circular mail-cancellation mark: double ring, curved mono label around
 * the top, "MKR / 2026" center, three wavy cancellation lines exiting
 * right. Decorative — rendered aria-hidden, rotated -8deg, stamp-rough ink.
 */
export function Postmark({ tone = "ink", size = 72, label = "SHIPPED", className }: PostmarkProps) {
  // Deterministic id: safe for RSC + hydration. Duplicate labels on one
  // page resolve to an identical arc path, so collisions are harmless.
  const arcId = `pm-arc-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const color = tone === "red" ? "var(--postal-red)" : "var(--ink)";
  return (
    <svg
      aria-hidden="true"
      width={size * 1.5}
      height={size}
      viewBox="0 0 150 100"
      fill="none"
      className={["stamp-rough", className].filter(Boolean).join(" ")}
      style={{ color, opacity: 0.85, transform: "rotate(-8deg)" }}
    >
      <defs>
        <path id={arcId} d="M 13 50 A 37 37 0 0 1 87 50" />
      </defs>
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" />
      <text
        fill="currentColor"
        style={{
          fontFamily: "var(--font-space-mono), monospace",
          fontSize: "10px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
          {label}
        </textPath>
      </text>
      <text
        x="50"
        y="47"
        fill="currentColor"
        textAnchor="middle"
        style={{
          fontFamily: "var(--font-space-mono), monospace",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.12em",
        }}
      >
        MKR
      </text>
      <text
        x="50"
        y="62"
        fill="currentColor"
        textAnchor="middle"
        style={{
          fontFamily: "var(--font-space-mono), monospace",
          fontSize: "11px",
          letterSpacing: "0.14em",
        }}
      >
        2026
      </text>
      <path
        d="M 96 38 q 9 -5 18 0 t 18 0 t 14 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 99 50 q 9 -5 18 0 t 18 0 t 12 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 96 62 q 9 -5 18 0 t 18 0 t 14 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Postmark;
