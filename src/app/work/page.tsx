import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import { ScribbleUnderline } from "@/components/ui/Scribble";
import WorkLedger from "@/components/work/WorkLedger";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "All Works - Dinesh Ganesan",
  description:
    "Dinesh's work ledger — a couple of archived builds kept on the shelf, with new work landing here soon.",
};

export default function WorkPage() {
  const count = String(projects.length).padStart(2, "0");
  return (
    <div className="min-h-screen pb-32 text-[var(--ink)]">
      <section className="flex flex-col items-center px-5 pt-14 text-center sm:px-8 sm:pt-16">
        <Reveal className="flex flex-col items-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[var(--ink-soft)]">
            The desk drawer —
          </p>
          <h1 className="font-display relative mt-7 text-[clamp(2.8rem,9vw,6.5rem)] font-bold leading-[0.95] tracking-tight">
            ALL WORKS
            <ScribbleUnderline className="absolute -bottom-3 left-1/2 h-4 w-[76%] -translate-x-1/2 text-[var(--accent-pink)] sm:-bottom-4 sm:h-5" />
          </h1>
          <p className="mt-10 max-w-md text-sm font-medium leading-relaxed text-[var(--ink-soft)] sm:text-base">
            {profile.allWorksBlurb}
          </p>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.24em]">
            {count} on the shelf · restocking
          </p>
        </Reveal>
      </section>

      <WorkLedger projects={projects} />
    </div>
  );
}
