export interface TicketTagProps {
  accent?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Notched ticket-stub chip: accent-wash background, side punch-outs via
 * the `.ticket` mask, inset hairline. Used for project tags.
 */
export function TicketTag({ accent = "var(--accent-blue)", children, className }: TicketTagProps) {
  return (
    <span
      className={[
        "ticket inline-flex items-center px-4 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-[var(--ink)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: `color-mix(in srgb, ${accent} 14%, var(--card))`,
        boxShadow: "inset 0 0 0 1px rgba(22, 22, 22, 0.25)",
      }}
    >
      {children}
    </span>
  );
}

export default TicketTag;
