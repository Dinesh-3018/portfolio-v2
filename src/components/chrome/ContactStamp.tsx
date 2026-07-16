"use client";

import { useSyncExternalStore } from "react";
import { useReveal } from "@/lib/useReveal";
import StampButton from "./StampButton";

const subscribeNoop = () => () => {};

export interface ContactStampProps {
  email: string;
}

/**
 * Reveal-triggered CONTACT stamp. SSR renders the stamp fully visible;
 * on the client it hides until the footer scrolls into view, then SLAMS
 * in (stamp-slam keyframe) while a one-time faint ink ripple ring expands
 * behind it. Both effects are neutered under prefers-reduced-motion via
 * the globals.css media block.
 *
 * Sizing: deliberately compact (~60% of the old giant CTA) so it anchors
 * the footer without shouting — built on StampButton's `sm` frame, with
 * the type nudged up to clamp(1.4rem,3vw,2.1rem), a slightly roomier
 * double ring, and the hard press shadow stepped down to match. The
 * shadow overrides need `!` (they conflict with StampButton's own
 * same-specificity shadow utilities); the child-selector padding/type
 * overrides win on specificity alone.
 */
export function ContactStamp({ email }: ContactStampProps) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  // false on the server render, true once hydrated on the client.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  return (
    <div ref={ref} className="relative">
      {inView && (
        <span
          aria-hidden="true"
          className="animate-ink-ripple pointer-events-none absolute -inset-2.5 rounded-[14px] border-2 border-[var(--postal-red)] opacity-0"
        />
      )}
      <div className={mounted && !inView ? "opacity-0" : inView ? "animate-stamp-slam" : undefined}>
        <StampButton
          email={email}
          size="sm"
          className="shadow-[var(--shadow-press)]! hover:shadow-none! [&>span]:px-5 [&>span]:py-3 sm:[&>span]:px-7 sm:[&>span]:py-4 [&>span>span]:text-[clamp(1.4rem,3vw,2.1rem)]"
        />
      </div>
    </div>
  );
}

export default ContactStamp;
