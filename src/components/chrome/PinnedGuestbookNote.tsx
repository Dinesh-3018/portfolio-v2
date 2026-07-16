"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Pinned visitor-log note: a torn mustard card-stock scrap + glossy pushpin
 * linking to /guestbook (accessible name; the arrow glyph alone is
 * aria-hidden). It sits in the flow of the centered footer column, drifting
 * to the column's LEFT edge on larger screens (the stamp hint takes the
 * right), so it never collides with the sticky note, stamping station,
 * watermark, or plane loop at any width. FooterPlayground ignores clicks on
 * links, so pressing it navigates instead of stamping.
 *
 * It hides itself on /guestbook — no point pointing visitors to the page
 * they're already on.
 */
export function PinnedGuestbookNote() {
  const pathname = usePathname();
  if (pathname === "/guestbook") return null;

  return (
    <Link
      href="/guestbook"
      data-hide-cursor="true"
      className="wiggle-on-hover relative mt-6 block w-56 -rotate-2 self-center rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-pink)] sm:self-start lg:-ml-20"
      style={{ filter: "drop-shadow(0 8px 16px rgba(22, 22, 22, 0.18))" }}
    >
      {/* Glossy pushpin pierced through the scrap's top edge. */}
      <span
        aria-hidden="true"
        className="absolute -top-1.5 left-1/2 z-10 block h-4 w-4 -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 30%, rgba(255, 255, 255, 0.9), var(--accent-pink) 45%, color-mix(in srgb, var(--accent-pink) 65%, var(--ink)) 100%)",
          boxShadow: "0 1px 1px rgba(22, 22, 22, 0.45)",
        }}
      />
      {/* Torn note in warm mustard so it pops off the paper (and off the
          card-white stamp hint beside it); clip on the inner layer so the
          drop shadow traces the ragged silhouette. */}
      <span
        className="block px-4 py-3.5"
        style={{
          background: "var(--accent-yellow)",
          clipPath:
            "polygon(0% 4%, 18% 0%, 41% 6%, 66% 1%, 88% 5%, 100% 2%, 99% 48%, 100% 94%, 79% 99%, 55% 94%, 30% 100%, 8% 95%, 1% 99%, 0% 52%)",
        }}
      >
        <span className="font-mono mb-1 block text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--ink)]/70">
          Visitor Log
        </span>
        <span className="font-hand block text-[1.35rem] leading-tight text-[var(--ink)]">
          been here? sign it <span aria-hidden="true">→</span>
        </span>
      </span>
    </Link>
  );
}

export default PinnedGuestbookNote;
