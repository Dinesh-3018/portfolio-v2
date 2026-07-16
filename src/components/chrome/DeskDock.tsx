"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { profile } from "@/data/profile";
import { prefersReducedMotion } from "@/lib/media";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";

const subscribeNoop = () => () => {};

const MOBILE_MENU_ID = "desk-dock-mobile-menu";

function findSocial(label: string): string {
  return profile.socials.find((s) => s.label.toUpperCase().includes(label))?.href ?? "#";
}

/**
 * rAF-throttled scroll state for the dock. Condensed past 24px; hidden
 * while scrolling down past 400px, revealed by any upward scroll. Runs
 * only after mount (`enabled`), so the server always renders the
 * non-scrolled, visible state. Under reduced motion the dock never hides.
 */
function useDockScroll(enabled: boolean) {
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const reduced = prefersReducedMotion();
    let raf = 0;
    let queued = false;
    let lastY = window.scrollY;

    const update = () => {
      queued = false;
      const y = window.scrollY;
      setCondensed(y > 24);
      if (!reduced) {
        if (y < lastY) setHidden(false);
        else if (y > lastY && y > 400) setHidden(true);
      }
      lastY = y;
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
    };
  }, [enabled]);

  return { condensed, hidden };
}

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)]";

const CHIP_CLASS = [
  "flex h-8 w-8 items-center justify-center rounded-[2px] border border-[var(--ink)] bg-[var(--card)]",
  "font-mono text-[10px] font-bold tracking-[0.08em] text-[var(--ink)] shadow-[var(--shadow-press-sm)]",
  "transition-[translate,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none",
  "hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[color-mix(in_srgb,var(--accent-cream)_60%,var(--card))] hover:shadow-none",
  FOCUS_RING,
].join(" ");

/**
 * The "Desk Dock": a floating paper card pinned near the top of the
 * viewport — ink logo chip, text nav with a sliding sticker highlight,
 * icon chips (GitHub / LinkedIn / email), and a detached mobile
 * panel. Replaces the old full-width header bar.
 */
export function DeskDock() {
  // false on the server / during hydration, then true once mounted.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const { condensed, hidden } = useDockScroll(mounted);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile panel whenever the route changes (state adjustment
  // during render — same pattern the old MobileMenu used).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  const dockHidden = hidden && !menuOpen;
  const github = findSocial("GITHUB");
  const linkedin = findSocial("LINKEDIN");

  return (
    <header
      className={[
        // Floating card: centered, inset from the edges, capped width.
        // z-[150] sits above page chrome (SideNav z-[95]) but below the
        // work Lightbox (z-[200]) and the grain overlay (z-250).
        "fixed inset-x-3 top-3 z-[150] mx-auto max-w-6xl sm:top-4",
        "transition-transform duration-300 ease-out motion-reduce:transition-none",
        dockHidden ? "-translate-y-[140%]" : "translate-y-0",
      ].join(" ")}
    >
      <div
        className={[
          "relative flex items-center gap-2 rounded-[4px] border border-[var(--ink)] bg-[var(--card)] px-3 shadow-[4px_4px_0_rgba(22,22,22,0.9)] sm:gap-3 sm:px-5",
          "transition-all duration-[250ms] ease-out motion-reduce:transition-none",
          condensed ? "py-1.5" : "py-2.5",
        ].join(" ")}
      >
        <Link href="/" aria-label="Home" className={`group flex-none rounded-[2px] ${FOCUS_RING}`}>
          <span
            className={[
              "flex items-center justify-center rounded-[2px] bg-[var(--ink)] shadow-[var(--shadow-press-sm)]",
              "transition-all duration-150 ease-out motion-reduce:transition-none",
              "group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none",
              condensed ? "h-7 w-7" : "h-9 w-9",
            ].join(" ")}
          >
            <span
              className={[
                "font-pixel leading-none text-white",
                condensed ? "text-base" : "text-lg",
              ].join(" ")}
            >
              {profile.initials.charAt(0)}
            </span>
          </span>
        </Link>

        <div className="ml-2 sm:ml-4">
          <NavLinks />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          <div className="hidden items-center gap-2 md:flex">
            <a
              href={github}
              title="GitHub"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
              className={CHIP_CLASS}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.13-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.69 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
            </a>
            <a
              href={linkedin}
              title="LinkedIn"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className={CHIP_CLASS}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
              </svg>
            </a>
            <a
              href={`mailto:${profile.email}`}
              title={`Email — ${profile.email}`}
              aria-label={`Email ${profile.email}`}
              className={CHIP_CLASS}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-none stroke-current"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2.5" y="5" width="19" height="14" rx="2" />
                <path d="m3.5 6.5 8.5 7 8.5-7" />
              </svg>
            </a>
          </div>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls={MOBILE_MENU_ID}
            onClick={() => setMenuOpen((v) => !v)}
            className={[
              // py-2.5 lifts the toggle to ~40px tall (touch-target floor
              // for the only nav control below md); the dock card's own
              // padding still condenses on scroll for the tighter look.
              "flex items-center gap-2 rounded-[2px] border-2 border-[var(--ink)] bg-[var(--card)] px-3 py-2.5 font-mono text-xs font-bold tracking-[0.08em] text-[var(--ink)] md:hidden",
              "transition-colors hover:bg-[var(--ink)] hover:text-[var(--card)]",
              FOCUS_RING,
            ].join(" ")}
          >
            {menuOpen ? "CLOSE" : "MENU"}
            <svg width="14" height="11" viewBox="0 0 16 12" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path
                  d="M2 1.5l12 9M14 1.5l-12 9"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M1 2.5h14M1 9.5h14"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} pathname={pathname} id={MOBILE_MENU_ID} />
    </header>
  );
}

export default DeskDock;
