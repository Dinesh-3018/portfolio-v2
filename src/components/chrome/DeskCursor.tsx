"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { isTouchDevice, prefersReducedMotion } from "@/lib/media";

/** The crosshair is a desktop affordance: md and up only. */
const DESKTOP_WIDTH_QUERY = "(min-width: 768px)";

/**
 * Real matchMedia subscription (not a noop): the width gate must
 * re-evaluate when the viewport crosses the md threshold, e.g. a desktop
 * browser window resized down to phone widths.
 */
const subscribeDesktopWidth = (onStoreChange: () => void) => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia(DESKTOP_WIDTH_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
};

const isDesktopWidth = () =>
  typeof window.matchMedia === "function" && window.matchMedia(DESKTOP_WIDTH_QUERY).matches;

const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");

/**
 * Registration-mark crosshair + live x/y readout trailing the pointer with
 * a slight lerp. The native cursor stays visible. Over elements marked
 * [data-hide-cursor="true"] the readout fades and the crosshair turns pink
 * and scales up (the "accent" state). Hidden entirely on touch devices AND
 * below md (so previewing mobile widths in a desktop browser doesn't show
 * a crosshair over phone layouts); lerp is instant under reduced motion.
 */
export function DeskCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<SVGSVGElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);
  // false on the server / during hydration, then the real capability +
  // width check. The width half re-evaluates live via the matchMedia
  // subscription, so the crosshair unmounts below md and remounts above.
  const enabled = useSyncExternalStore(
    subscribeDesktopWidth,
    () => !isTouchDevice() && isDesktopWidth(),
    () => false
  );

  useEffect(() => {
    if (!enabled) return;
    const el = wrapRef.current;
    const mark = markRef.current;
    const readout = readoutRef.current;
    const xEl = xRef.current;
    const yEl = yRef.current;
    if (!el || !mark || !readout || !xEl || !yEl) return;

    const reduced = prefersReducedMotion();
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let started = false;
    let visible = false;

    const loop = () => {
      const k = reduced ? 1 : 0.35;
      x += (targetX - x) * k;
      y += (targetY - y) * k;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.style.opacity = visible ? "1" : "0";
      xEl.textContent = pad(x);
      yEl.textContent = pad(y);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!started) {
        x = targetX;
        y = targetY;
        started = true;
      }
      visible = true;
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const accent = !!target?.closest?.('[data-hide-cursor="true"]');
      mark.style.color = accent ? "var(--accent-pink)" : "var(--ink)";
      mark.style.transform = accent ? "scale(1.4)" : "scale(1)";
      readout.style.opacity = accent ? "0" : "0.7";
    };

    const onLeave = () => {
      visible = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9990] opacity-0 transition-opacity duration-300"
    >
      {/* 20px registration mark: 1.5px lines with a 4px open center. */}
      <svg
        ref={markRef}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="absolute -left-2.5 -top-2.5 transition-[transform,color] duration-200"
        style={{ color: "var(--ink)" }}
      >
        <path d="M0 10h8M12 10h8M10 0v8M10 12v8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span
        ref={readoutRef}
        className="absolute left-3.5 top-3.5 block whitespace-nowrap font-mono text-[10px] text-[var(--ink)] transition-opacity duration-200"
        style={{ opacity: 0.7, fontVariantNumeric: "tabular-nums" }}
      >
        x <span ref={xRef}>0000</span> · y <span ref={yRef}>0000</span>
      </span>
    </div>
  );
}

export default DeskCursor;
