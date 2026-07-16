"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/lib/LenisProvider";

const SECTIONS = [
  { id: "bio", label: "BIO" },
  { id: "story", label: "STORY" },
  { id: "work", label: "WORK" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/**
 * Floating section dock (md+), bottom-center: a small paper card in the
 * Desk Dock language — ink border, hard press shadow — holding the three
 * section links. The active section gets a tilted yellow sticker highlight
 * and the counter on the right ticks 01/03 → 03/03. Scrollspy via
 * IntersectionObserver; clicks scroll smoothly through Lenis.
 */
export function SideNav() {
  const lenis = useLenis();
  const [active, setActive] = useState<SectionId>("bio");
  const [overFooter, setOverFooter] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id as SectionId);
          }
        }
      },
      // A horizontal band near the top of the viewport: the section crossing
      // it is the one considered "current".
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const footer = document.querySelector("footer");
    if (!footer) return;

    // Fade the dock away once the footer climbs into its zone (the bottom
    // ~96px of the viewport) so it never floats on top of the footer bar's
    // email/social links at tablet widths.
    const observer = new IntersectionObserver(
      ([entry]) => setOverFooter(entry.isIntersecting),
      { rootMargin: "0px 0px -96px 0px", threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    if (!lenis) return; // reduced motion / no Lenis: native anchor jump
    e.preventDefault();
    lenis.scrollTo(`#${id}`, { offset: -110 });
    setActive(id);
  };

  const activeIndex = SECTIONS.findIndex((s) => s.id === active);

  return (
    <nav
      aria-label="About sections"
      inert={overFooter}
      className={[
        "fixed bottom-5 left-1/2 z-[140] hidden -translate-x-1/2 items-center gap-1 rounded-[4px] border border-[var(--ink)] bg-[var(--card)] py-1.5 pl-1.5 pr-3 shadow-[var(--shadow-press)] md:flex",
        "transition-opacity duration-200 motion-reduce:transition-none",
        // animate-fade-in fills forwards (opacity: 1), so the hidden state
        // must drop the animation class rather than stack opacity-0 on it.
        overFooter ? "pointer-events-none opacity-0" : "animate-fade-in",
      ].join(" ")}
    >
      {SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => onClick(e, id)}
            aria-current={isActive ? "true" : undefined}
            className={[
              "rounded-[3px] px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink)]",
              "transition-[background-color,transform] duration-200 motion-reduce:transition-none",
              isActive
                ? "-rotate-1 bg-[var(--accent-yellow)] shadow-[2px_2px_0_rgba(22,22,22,0.35)]"
                : "hover:bg-[var(--ink)]/5",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink-ink)]",
            ].join(" ")}
          >
            {label}
          </a>
        );
      })}
      <span
        aria-hidden="true"
        className="ml-2 border-l-[1.5px] border-dashed border-[var(--ink)]/25 pl-3 font-mono text-[10px] font-bold tabular-nums tracking-[0.1em] text-[var(--ink-soft)]"
      >
        0{activeIndex + 1}/0{SECTIONS.length}
      </span>
    </nav>
  );
}

export default SideNav;
