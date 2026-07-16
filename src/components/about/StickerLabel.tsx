export interface StickerLabelProps {
  children: React.ReactNode;
  tone?: "yellow" | "green";
  className?: string;
}

const TONES: Record<NonNullable<StickerLabelProps["tone"]>, React.CSSProperties> = {
  yellow: { background: "var(--accent-yellow)", color: "var(--ink)" },
  green: { background: "var(--accent-green)", color: "var(--ink)" },
};

/**
 * Peel-and-stick section label: a small accent sticker slapped on at a
 * slight angle with a hard press shadow.
 */
export function StickerLabel({ children, tone = "yellow", className }: StickerLabelProps) {
  return (
    <span
      className={[
        "inline-block -rotate-1 rounded-[2px] border border-[var(--ink)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] shadow-[var(--shadow-press-sm)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={TONES[tone]}
    >
      {children}
    </span>
  );
}

export default StickerLabel;
