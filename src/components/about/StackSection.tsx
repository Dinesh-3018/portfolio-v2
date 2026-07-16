import StampBadge from "@/components/ui/StampBadge";
import { ACCENT_INK } from "@/components/ui/accentInk";
import { ACCENT } from "@/data/site";
import { skillGroups } from "@/data/skills";
import type { Accent } from "@/data/types";

/** One accent per group, cycling through the palette. */
const GROUP_ACCENTS: Accent[] = ["blue", "pink", "yellow", "green", "brown"];

/** Deterministic sticker tilts, cycling per chip. */
const TILT_CLASS = ["-rotate-1", "rotate-1", "-rotate-[1.5deg]", "rotate-[0.5deg]"];

/**
 * Stack as a sticker sheet: each group gets a rubber-stamp label in its own
 * accent, and every technology is a die-cut sticker chip — accent-washed,
 * ink-bordered, slightly tilted — that straightens and lifts on hover.
 */
export function StackSection() {
  return (
    <div>
      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
          LOGBOOK — STACK
        </h2>
        <span aria-hidden="true" className="font-hand text-xl text-[var(--ink-soft)]">
          tools I reach for daily
        </span>
      </div>
      <hr className="mt-4 border-[var(--line)]" />
      <dl className="mt-7 space-y-6">
        {skillGroups.map((group, gi) => {
          const accent = GROUP_ACCENTS[gi % GROUP_ACCENTS.length];
          return (
            <div
              key={group.label}
              className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6"
            >
              <dt className="w-28 flex-shrink-0 pt-0.5">
                <StampBadge size="sm" tone={ACCENT_INK[accent]} rotate={-2}>
                  {group.label}
                </StampBadge>
              </dt>
              <dd className="flex flex-wrap gap-2.5">
                {group.items.map((item, i) => (
                  <span
                    key={item}
                    className={[
                      "inline-block rounded-[3px] border-[1.5px] border-[var(--ink)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--ink)]",
                      TILT_CLASS[i % TILT_CLASS.length],
                      "transition-[rotate,translate,box-shadow] duration-200 ease-out motion-reduce:transition-none",
                      "hover:-translate-y-0.5 hover:rotate-0 hover:shadow-[2px_2px_0_rgba(22,22,22,0.3)]",
                    ].join(" ")}
                    style={{
                      background: `color-mix(in srgb, ${ACCENT[accent]} 16%, var(--card))`,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export default StackSection;
