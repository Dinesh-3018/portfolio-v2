"use client";

import type { TimelineEntry } from "@/data/types";
import { timeline } from "@/data/timeline";
import { useReveal } from "@/lib/useReveal";
import Reveal from "@/components/ui/Reveal";
import TimelineItem from "./TimelineItem";
import StackSection from "./StackSection";

/** One labelled group (EXPERIENCE / EDUCATION) with its own drawing rail. */
function TimelineGroup({ label, entries }: { label: string; entries: TimelineEntry[] }) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  if (entries.length === 0) return null;

  return (
    <div>
      <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
        {label}
      </h3>
      <hr className="mt-4 border-[var(--line)]" />

      <div ref={ref} className="relative">
        {/* Vertical rail: faint track + ink line that draws downward. */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-10 left-4 top-10 w-px">
          <span className="absolute inset-0 bg-[var(--ink)]/5" />
          <span
            className={["block w-full bg-[var(--ink)]/20", inView ? "animate-timeline-draw" : ""]
              .filter(Boolean)
              .join(" ")}
            style={inView ? undefined : { height: 0 }}
          />
        </div>

        {entries.map((entry, i) => (
          <Reveal key={entry.company} delay={Math.min(i + 1, 6)}>
            <TimelineItem entry={entry} first={i === 0} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/**
 * LOGBOOK: a ruled ledger panel with a hard press shadow. Work history and
 * education are kept in separate labelled groups (EXPERIENCE / EDUCATION),
 * divided by a dashed seam, followed by the stack list.
 */
export function Timeline() {
  const work = timeline.filter((e) => e.kind !== "education");
  const education = timeline.filter((e) => e.kind === "education");

  return (
    <section id="work" className="scroll-mt-28 px-5 pb-28 pt-24 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2px] border border-[var(--ink)] bg-[var(--card)] shadow-[var(--shadow-press)]">
          <div className="px-6 py-10 sm:px-12 sm:py-12">
            <TimelineGroup label="LOGBOOK — EXPERIENCE" entries={work} />

            {education.length > 0 && (
              <div
                aria-hidden="true"
                className="my-12 border-t border-dashed border-[var(--ink)]/25"
              />
            )}
            <TimelineGroup label="LOGBOOK — EDUCATION" entries={education} />

            <StackSection />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Timeline;
