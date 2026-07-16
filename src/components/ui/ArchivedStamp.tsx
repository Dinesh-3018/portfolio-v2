export interface ArchivedStampProps {
  className?: string;
  rotate?: number;
  size?: "sm" | "md";
}

/**
 * Small rubber-stamp marker for shelved projects: an ink-bordered, letter-
 * spaced "ARCHIVED" chip with a filled bullet, tilted a touch. Colors are
 * inherited (border + dot + text all currentColor), so callers set the tone
 * by wrapping it in a text-color class — muted ink on paper, card ink on the
 * pastel featured cards.
 */
export function ArchivedStamp({ className, rotate = -4, size = "md" }: ArchivedStampProps) {
  const pad = size === "sm" ? "gap-1.5 px-2 py-[3px] text-[9px]" : "gap-1.5 px-2.5 py-1 text-[10px]";
  return (
    <span
      role="img"
      aria-label="Archived project"
      className={[
        "inline-flex items-center rounded-[3px] border-[1.5px] border-current font-mono font-bold uppercase leading-none tracking-[0.2em]",
        pad,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ rotate: `${rotate}deg` }}
    >
      <span aria-hidden="true" className="inline-block h-[5px] w-[5px] rounded-full bg-current" />
      Archived
    </span>
  );
}

export default ArchivedStamp;
