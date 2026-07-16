/**
 * Line-art paper plane drifting along a faint dashed loop across the
 * footer panel (~20s CSS motion-path loop, see `.plane-flier` in
 * globals.css). Decorative: aria-hidden, pointer-events-none. When
 * `offset-path` is unsupported — or under prefers-reduced-motion — the
 * plane parks statically instead.
 *
 * Below md the full-width loop can't fit, so a compact variant takes
 * over: a shorter dashed loop tucked into the panel's upper right with a
 * smaller dart on a slower (26s) lap, styled by the component-scoped
 * `.plane-flier-sm` rules below (reduced motion parks it at the loop's
 * top). Its left arc slips behind the overlapping sticky note at the
 * narrowest widths — deliberate desk layering: the plane circles out
 * from behind the note.
 *
 * NOTE: each dashed SVG path and its `offset-path` (globals.css for the
 * desktop loop, the scoped <style> here for the mobile one) trace the
 * same coordinates inside the same fixed box, so they stay aligned.
 * Change one, change both.
 */
const LOOP_PATH =
  "M 340 30 C 520 30, 660 86, 660 150 C 660 214, 520 270, 340 270 C 160 270, 20 214, 20 150 C 20 86, 160 30, 340 30 Z";

/** Compact mobile loop inside a fixed 190x95 box. Anchored at the right
 *  apex so the parked plane (reduced motion / no offset-path) sits in the
 *  loop's fully visible right half, clear of the sticky note at 360px. */
const LOOP_PATH_SM =
  "M 180 47 C 180 65, 145 81, 95 81 C 45 81, 10 65, 10 47 C 10 30, 45 14, 95 14 C 145 14, 180 30, 180 47 Z";

/** Shared dart glyph — nose points +x so offset-rotate:auto faces along the path. */
function Dart({ width, height }: { width: number; height: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 38 28" fill="none">
      <path
        d="M36 14 L2 2 L10 14 L2 26 Z"
        fill="var(--card)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M36 14 L10 14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function PaperPlane() {
  return (
    <>
      {/* md+: the original wide loop across the panel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-8 z-0 hidden h-[300px] w-[680px] -translate-x-1/2 select-none md:block"
      >
        <svg viewBox="0 0 680 300" width="680" height="300" fill="none" className="absolute inset-0">
          <path
            d={LOOP_PATH}
            stroke="var(--ink)"
            strokeOpacity="0.15"
            strokeWidth="1.5"
            strokeDasharray="2 9"
            strokeLinecap="round"
          />
        </svg>
        <div className="plane-flier text-[var(--ink)]/70">
          <Dart width={38} height={28} />
        </div>
      </div>

      {/* Below md: compact loop tucked into the panel's upper right. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1 top-7 z-0 h-[95px] w-[190px] select-none md:hidden"
      >
        <svg viewBox="0 0 190 95" width="190" height="95" fill="none" className="absolute inset-0">
          <path
            d={LOOP_PATH_SM}
            stroke="var(--ink)"
            strokeOpacity="0.15"
            strokeWidth="1.5"
            strokeDasharray="2 8"
            strokeLinecap="round"
          />
        </svg>
        <div className="plane-flier-sm text-[var(--ink)]/70">
          <Dart width={26} height={19} />
        </div>
      </div>

      {/* Scoped styles for the compact flier (the desktop `.plane-flier`
          lives in globals.css). Without offset-path support — or when the
          plane-fly animation is disabled under prefers-reduced-motion via
          `animation: none` — the dart parks instead of flying. */}
      <style>{`
        .plane-flier-sm {
          position: absolute;
          right: 8%;
          top: 38%;
          transform: rotate(76deg);
        }
        @supports (offset-path: path("M 0 0 L 1 1")) {
          .plane-flier-sm {
            left: 0;
            top: 0;
            transform: none;
            offset-path: path("${LOOP_PATH_SM}");
            offset-rotate: auto;
            animation: 26s linear infinite plane-fly;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .plane-flier-sm {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}

export default PaperPlane;
