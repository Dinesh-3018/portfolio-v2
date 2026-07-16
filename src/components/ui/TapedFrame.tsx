export interface TapedFrameProps {
  rotate?: number;
  className?: string;
  children: React.ReactNode;
}

/** Jagged-ended washi strip. drop-shadow (not box-shadow) survives the clip. */
function TapeStrip({ corner }: { corner: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "pointer-events-none absolute top-0 z-10 block h-[26px] w-[84px]",
        corner === "left" ? "left-0" : "right-0",
      ].join(" ")}
      style={{
        background: "var(--tape)",
        clipPath:
          "polygon(4% 0, 96% 2%, 100% 18%, 95% 36%, 100% 55%, 96% 74%, 100% 92%, 94% 100%, 5% 98%, 0 82%, 5% 62%, 0 45%, 4% 28%, 0 10%)",
        filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))",
        transform:
          corner === "left"
            ? "translate(-30%, -45%) rotate(-6deg)"
            : "translate(30%, -45%) rotate(5deg)",
      }}
    />
  );
}

/**
 * Card-stock mat held down by two washi-tape strips. Taped things sit flat
 * on the desk, so the shadow is a soft paper shadow, never a hard offset.
 */
export function TapedFrame({ rotate, className, children }: TapedFrameProps) {
  return (
    <div
      className={["relative bg-[var(--card)] p-2.5", className].filter(Boolean).join(" ")}
      style={{
        border: "1px solid rgba(22, 22, 22, 0.12)",
        boxShadow: "var(--shadow-paper)",
        ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
      }}
    >
      {children}
      <TapeStrip corner="left" />
      <TapeStrip corner="right" />
    </div>
  );
}

export default TapedFrame;
