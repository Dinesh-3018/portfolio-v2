"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Project } from "@/data/types";
import { useReveal } from "@/lib/useReveal";
import FilterChips from "./FilterChips";
import LedgerRow from "./LedgerRow";
import PhotoPeek, { type PeekPoint } from "./PhotoPeek";

const subscribeNoop = () => () => {};

/** "ALL" plus the unique first tags across projects, capped at 6 chips. */
const MAX_CHIPS = 6;

/* ---------------------------------------------------------------- */
/* Scoped choreography                                               */
/* ---------------------------------------------------------------- */

/**
 * All ledger choreography in one sheet. Hover rules are gated to
 * hover-capable pointers; the reduced-motion block comes LAST so it
 * wins specificity ties and collapses everything to instant states.
 */
const LEDGER_CSS = `
/* Entrance: rows rise in a fast stagger once the list scrolls into
   view. SSR renders fully visible; .wl-pre is only added client-side
   before intersection (the Reveal pattern). .wl-settled retires the
   per-row animation afterward so filter toggles that un-hide rows
   don't replay the stagger. */
.wl-pre .wl-item { opacity: 0; }
.wl-in .wl-item {
  animation: wl-rise 0.45s ease-out both;
  animation-delay: calc(var(--wl-i, 0) * 55ms);
}
.wl-settled .wl-item { animation: none; opacity: 1; }
@keyframes wl-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

/* Filter swap: one quick fade/rise on the whole list. Two identical
   keyframes alternate so consecutive filter clicks re-trigger the
   animation without remounting rows — DOM order never changes and
   filtered-out rows are simply display:none via [hidden]. */
@keyframes wl-swap-a { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes wl-swap-b { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.wl-swap-a { animation: wl-swap-a 0.2s ease-out both; }
.wl-swap-b { animation: wl-swap-b 0.2s ease-out both; }

/* Row choreography (hover-capable pointers only): the row washes with
   the project accent, title and arrow nudge right, and the Nº stamp
   straightens from its rest tilt. Focus-visible mirrors hover. */
.wl-row { transition: background-color 0.25s ease-out; }
.wl-title, .wl-arrow { transition: translate 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.wl-stamp {
  display: inline-flex;
  rotate: var(--wl-tilt, -3deg);
  transition: rotate 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (hover: hover) {
  .wl-row:hover { background-color: color-mix(in srgb, var(--wl-accent) 14%, transparent); }
  .wl-row:hover .wl-title { translate: 7px 0; }
  .wl-row:hover .wl-arrow { translate: 6px 0; }
  .wl-row:hover .wl-stamp { rotate: 0deg; }
}
.wl-row:focus-visible { background-color: color-mix(in srgb, var(--wl-accent) 14%, transparent); }
.wl-row:focus-visible .wl-title { translate: 7px 0; }
.wl-row:focus-visible .wl-arrow { translate: 6px 0; }
.wl-row:focus-visible .wl-stamp { rotate: 0deg; }

/* Ticket-stub filter chips: the active one gets the yellow sticker
   treatment — accent-yellow wash and a slight tilt (the red asterisk
   lives in the markup). */
.wl-chip { rotate: 0deg; transition: rotate 0.2s ease-out; }
.wl-chip-active { rotate: -1deg; }
.wl-chip-face { background-color: var(--card); transition: background-color 0.2s ease-out; }
.wl-chip-active .wl-chip-face { background-color: color-mix(in srgb, var(--accent-yellow) 36%, var(--card)); }
@media (hover: hover) {
  .wl-chip:not(.wl-chip-active):hover .wl-chip-face {
    background-color: color-mix(in srgb, var(--accent-yellow) 14%, var(--card));
  }
}

/* Photo peek: the layer fades in ~150ms, the mat scales up slightly
   (the scale property composes with the JS-driven translate/rotate
   transform), and shots crossfade when the hovered row changes. */
.wl-peek { opacity: 0; transition: opacity 0.15s ease-out; will-change: transform; }
.wl-peek-on { opacity: 1; }
.wl-peek-card { scale: 0.94; transition: scale 0.18s cubic-bezier(0.22, 1, 0.36, 1); }
.wl-peek-on .wl-peek-card { scale: 1; }
.wl-peek-shot { opacity: 0; transition: opacity 0.15s ease-out; }
.wl-peek-shot-on { opacity: 1; }

/* Reduced motion: entrances and filter swaps land instantly, hover
   nudges and tilt changes are disabled (rest tilts stay — they are
   static, not motion). The peek layer never mounts under reduced
   motion (JS gate in PhotoPeek), so its rules are moot here. */
@media (prefers-reduced-motion: reduce) {
  .wl-in .wl-item, .wl-swap-a, .wl-swap-b { animation-duration: 0.01s; animation-delay: 0s; }
  .wl-row, .wl-title, .wl-arrow, .wl-stamp,
  .wl-chip, .wl-chip-face,
  .wl-peek, .wl-peek-card, .wl-peek-shot { transition: none; }
  .wl-row:hover .wl-title, .wl-row:focus-visible .wl-title,
  .wl-row:hover .wl-arrow, .wl-row:focus-visible .wl-arrow { translate: none; }
  .wl-row:hover .wl-stamp, .wl-row:focus-visible .wl-stamp { rotate: var(--wl-tilt, -3deg); }
}
`;

export interface WorkLedgerProps {
  projects: Project[];
}

/**
 * The ledger: every project as a full-width row between hairline rules,
 * filterable by ticket-stub chips, with a cursor-trailing photo peek on
 * hover-capable desktops. Rows keep a stable DOM order; filtering only
 * toggles the [hidden] attribute, so it's purely render-level.
 */
export function WorkLedger({ projects }: WorkLedgerProps) {
  const ordered = useMemo(() => [...projects].sort((a, b) => a.order - b.order), [projects]);
  const chips = useMemo(() => {
    const list: string[] = ["ALL"];
    for (const project of ordered) {
      const first = project.tags[0];
      if (first && !list.includes(first)) list.push(first);
      if (list.length === MAX_CHIPS) break;
    }
    return list;
  }, [ordered]);

  const [filter, setFilter] = useState("ALL");
  // Bumped per filter change: alternates the swap animation class so it
  // re-triggers without remounting rows. 0 = no swap on first paint.
  const [epoch, setEpoch] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [settled, setSettled] = useState(false);
  const pointRef = useRef<PeekPoint | null>(null);

  const { ref: listRef, inView } = useReveal<HTMLUListElement>();
  // false on the server render, true once hydrated on the client.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  // Retire the entrance stagger shortly after it has played out.
  useEffect(() => {
    if (!inView) return;
    const timer = window.setTimeout(() => setSettled(true), 1100);
    return () => window.clearTimeout(timer);
  }, [inView]);

  const selectFilter = (value: string) => {
    if (value === filter) return;
    setFilter(value);
    setEpoch((current) => current + 1);
    setActive(null);
  };

  const staggerClass = inView ? "wl-in" : mounted ? "wl-pre" : "";
  const swapClass = epoch === 0 ? "" : epoch % 2 === 1 ? "wl-swap-a" : "wl-swap-b";

  return (
    <section className="mx-auto mt-14 max-w-5xl px-5 sm:px-8">
      <FilterChips options={chips} active={filter} onSelect={selectFilter} />

      <ul
        ref={listRef}
        role="list"
        className={[
          "mt-12 list-none border-t border-[var(--line)]",
          staggerClass,
          settled ? "wl-settled" : "",
          swapClass,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {ordered.map((project, index) => (
          <li
            key={project.slug}
            hidden={filter !== "ALL" && !project.tags.includes(filter)}
            className="wl-item border-b border-[var(--line)]"
            style={{ "--wl-i": index } as React.CSSProperties}
          >
            <LedgerRow
              project={project}
              index={index}
              onPeekStart={(event) => {
                if (event.pointerType === "touch") return;
                pointRef.current = { x: event.clientX, y: event.clientY };
                setActive(index);
              }}
              onPeekEnd={(event) => {
                if (event.pointerType === "touch") return;
                setActive((current) => (current === index ? null : current));
              }}
            />
          </li>
        ))}
      </ul>

      {/* Margin note after the last rule. */}
      <div className="flex justify-end pr-2 pt-6">
        <p className="font-hand rotate-[-1.5deg] text-2xl text-[var(--ink-soft)]">
          kept on the shelf, for the record
          <span className="text-[var(--accent-pink)]">.</span>
        </p>
      </div>

      <PhotoPeek projects={ordered} activeIndex={active} pointRef={pointRef} />
      <style>{LEDGER_CSS}</style>
    </section>
  );
}

export default WorkLedger;
