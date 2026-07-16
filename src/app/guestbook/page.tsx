import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import { ScribbleUnderline } from "@/components/ui/Scribble";
import HandwrittenNote from "@/components/ui/HandwrittenNote";
import Guestbook from "@/components/desk/Guestbook";

export const metadata: Metadata = {
  title: "Visitor Log - Dinesh Ganesan",
  description:
    "The visitor log on Dinesh's desk — a pinboard of notes left by people passing through. Read the board, then pin a card of your own.",
};

/** Fresh signatures must show on every request, and the entry store
 *  shouldn't be read at build time — render dynamically. */
export const dynamic = "force-dynamic";

export default function GuestbookPage() {
  return (
    <div className="min-h-screen pb-32 text-[var(--ink)]">
      {/* ---- Centered header ---- */}
      <section className="flex flex-col items-center px-5 pt-14 text-center sm:px-8 sm:pt-16">
        <Reveal className="flex flex-col items-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[var(--ink-soft)]">
            The visitor log —
          </p>
          <h1 className="font-display relative mt-7 text-[clamp(2.8rem,9vw,6.5rem)] font-bold leading-[0.95] tracking-tight">
            GUESTBOOK
            <ScribbleUnderline className="absolute -bottom-3 left-1/2 h-4 w-[76%] -translate-x-1/2 text-[var(--accent-pink)] sm:-bottom-4 sm:h-5" />
          </h1>
          <p className="mt-10 max-w-md text-sm font-medium leading-relaxed text-[var(--ink-soft)] sm:text-base">
            Notes from everyone who wandered across this desk — hellos, hot takes, whatever fits
            on a card. Add yours and it goes up with the rest.
          </p>
        </Reveal>
        <Reveal delay={1}>
          <HandwrittenNote rotate={-2} className="mt-6 text-2xl text-[var(--ink)]/80 sm:text-3xl">
            the marker&apos;s already uncapped ↓
          </HandwrittenNote>
        </Reveal>
      </section>

      {/* ---- The board ---- */}
      <section aria-label="Guestbook" className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
        <Reveal delay={2}>
          <Guestbook />
        </Reveal>
      </section>
    </div>
  );
}
