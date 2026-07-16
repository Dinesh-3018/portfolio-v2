export interface FilterChipsProps {
  options: string[];
  active: string;
  onSelect: (value: string) => void;
}

/**
 * Ticket-stub filter row for the ledger. Each chip is a real button
 * (keyboard-operable, aria-pressed) whose face is a notched `.ticket`
 * span — the mask lives on the inner span so the focus ring on the
 * button itself never gets clipped. The active chip takes the yellow
 * sticker treatment: accent-yellow wash, a -1deg tilt, and a small
 * postal-red asterisk pinned to its corner (all driven by the wl-chip
 * classes in WorkLedger's scoped stylesheet).
 */
export function FilterChips({ options, active, onSelect }: FilterChipsProps) {
  return (
    <div
      role="group"
      aria-label="Filter projects by tag"
      className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-3"
    >
      {options.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(option)}
            className={[
              "wl-chip relative cursor-pointer rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)]",
              isActive ? "wl-chip-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span
              className="wl-chip-face ticket inline-flex items-center px-4 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-[var(--ink)]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(22, 22, 22, 0.25)" }}
            >
              {option}
            </span>
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute -right-1.5 -top-2 font-mono text-base font-bold leading-none text-[var(--postal-red)]"
              >
                *
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default FilterChips;
