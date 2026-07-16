interface ScribbleProps {
  className?: string;
}

/**
 * Hand-drawn marker strokes in currentColor. Both draw on via
 * stroke-dashoffset (pathLength=1 trick) using the scribble-draw keyframe;
 * wrap in a Reveal (or render on mount) to time the draw. The second pass
 * lags slightly so the stroke reads as two swipes of the pen.
 */
function pass(delay?: string): React.CSSProperties {
  return {
    strokeDasharray: 1,
    strokeDashoffset: 1,
    ...(delay ? { animationDelay: delay } : {}),
  };
}

/** Two overlapping imperfect underline strokes. */
export function ScribbleUnderline({ className }: ScribbleProps) {
  return (
    <svg
      viewBox="0 0 200 20"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={className}
    >
      <path
        d="M4 13 C 40 8, 80 16, 120 10 S 180 12, 196 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={1}
        className="animate-scribble-draw"
        style={pass()}
      />
      <path
        d="M8 16 C 50 12, 95 18, 140 12 S 186 15, 194 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        className="animate-scribble-draw"
        style={pass("0.18s")}
      />
    </svg>
  );
}

/** Wobbly hand-drawn ellipse for ringing headings. */
export function ScribbleCircle({ className }: ScribbleProps) {
  return (
    <svg
      viewBox="0 0 300 120"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={className}
    >
      <path
        d="M150 14 C 60 10, 14 34, 16 62 C 18 94, 90 112, 160 108 C 240 104, 286 84, 283 54 C 280 24, 210 8, 130 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        className="animate-scribble-draw"
        style={pass()}
      />
      <path
        d="M140 18 C 66 18, 24 40, 26 64 C 28 92, 96 106, 162 102 C 234 98, 278 80, 275 56"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        className="animate-scribble-draw"
        style={pass("0.2s")}
      />
    </svg>
  );
}
