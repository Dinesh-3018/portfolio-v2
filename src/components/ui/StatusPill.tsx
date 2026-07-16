export interface StatusPillProps {
  label: string;
  dotColor?: string;
}

/** Pulsing status dot + mono uppercase tracked label. */
export function StatusPill({ label, dotColor = "var(--accent-blue)" }: StatusPillProps) {
  return (
    <p className="flex items-center gap-2.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink)] sm:text-sm">
      <span
        aria-hidden="true"
        className="animate-status-pulse h-3.5 w-3.5 rounded-full"
        style={{ background: dotColor }}
      />
      {label}
    </p>
  );
}

export default StatusPill;
