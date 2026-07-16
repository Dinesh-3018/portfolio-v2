"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin top progress bar shown during route navigations, so clicking a nav
 * link always gives immediate feedback even before the next page paints.
 *
 * App Router has no global router events, so: start the bar on an internal
 * link/anchor click, trickle it toward 90%, and complete it when the
 * pathname changes (navigation done). A safety timeout finishes a stuck bar
 * (e.g. a cancelled navigation). Prefetched static routes just flash a quick
 * sweep — that's the intended "it registered your click" feedback.
 */
export default function TopLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const active = useRef(false);
  const trickle = useRef<number | null>(null);
  const hide = useRef<number | null>(null);
  const safety = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    for (const r of [trickle, hide, safety]) {
      if (r.current !== null) {
        window.clearInterval(r.current);
        window.clearTimeout(r.current);
        r.current = null;
      }
    }
  }, []);

  const finish = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    clearTimers();
    setProgress(100);
    hide.current = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => setProgress(0), 250);
    }, 220);
  }, [clearTimers]);

  const start = useCallback(() => {
    if (active.current) return;
    active.current = true;
    clearTimers();
    setVisible(true);
    setProgress(8);
    trickle.current = window.setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.max(0.4, (90 - p) * 0.08)));
    }, 200);
    // Auto-finish if a navigation never completes (cancelled, blocked, etc.).
    safety.current = window.setTimeout(() => finish(), 10_000);
  }, [clearTimers, finish]);

  // Complete when the pathname changes (skips the initial mount via the guard
  // inside finish()).
  useEffect(() => {
    finish();
  }, [pathname, finish]);

  // Start on internal link clicks.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same page
      start();
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, [start, clearTimers]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 250ms ease" }}
    >
      <div
        className="h-full bg-[var(--accent-pink)]"
        style={{
          width: `${progress}%`,
          transition: "width 200ms ease-out",
          boxShadow: "0 0 8px var(--accent-pink), 0 0 3px var(--accent-pink)",
        }}
      />
    </div>
  );
}
