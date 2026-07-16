export interface StampBadgeProps {
  children: React.ReactNode;
  /** Any CSS color; defaults to rubber-stamp red. */
  tone?: string;
  rotate?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<StampBadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-base",
};

/**
 * Rubber-stamp label: bold mono uppercase in a 2px ring of its own color,
 * uneven ink via `.stamp-rough`, slightly rotated. Nº stamps, date stamps,
 * OPEN-FOR-WORK, VIEW, CASE FILE.
 */
export function StampBadge({
  children,
  tone = "var(--postal-red)",
  rotate = -4,
  size = "md",
  className,
}: StampBadgeProps) {
  return (
    <span
      className={[
        "stamp-rough inline-flex items-center rounded-[6px] border-2 border-current font-mono font-bold uppercase tracking-[0.1em]",
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ color: tone, transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

export default StampBadge;
