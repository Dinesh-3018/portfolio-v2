"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Project } from "@/data/types";
import { isTouchDevice, prefersReducedMotion } from "@/lib/media";

const subscribeNoop = () => () => {};

/** Outer mat width; the photo inside is the mat minus 2×10px padding. */
const PEEK_WIDTH = 260;
const SHOT_WIDTH = 240;
const SHOT_HEIGHT = 150;
/** Rest offset from the pointer: down and to the right. */
const OFFSET_X = 26;
const OFFSET_Y = 32;
/** The mat never gets closer than this to a viewport edge. */
const EDGE_MARGIN = 12;
/** Lerp factor per frame for position and tilt. */
const LERP = 0.12;
/** Horizontal-velocity tilt is clamped to ±6deg around the base tilt. */
const MAX_TILT = 6;
const BASE_ROTATION = 2;

export interface PeekPoint {
  x: number;
  y: number;
}

/** Small washi strip pinning the peek mat's top corners. */
function Tape({ corner }: { corner: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "pointer-events-none absolute top-0 block h-[22px] w-[70px]",
        corner === "left" ? "left-0" : "right-0",
      ].join(" ")}
      style={{
        background: "var(--tape)",
        clipPath:
          "polygon(4% 0, 96% 2%, 100% 18%, 95% 36%, 100% 55%, 96% 74%, 100% 92%, 94% 100%, 5% 98%, 0 82%, 5% 62%, 0 45%, 4% 28%, 0 10%)",
        filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))",
        transform:
          corner === "left"
            ? "translate(-30%, -45%) rotate(-7deg)"
            : "translate(30%, -45%) rotate(6deg)",
      }}
    />
  );
}

export interface PhotoPeekProps {
  projects: Project[];
  /** Index into `projects` of the hovered row, or null when none. */
  activeIndex: number | null;
  /** Seed coordinates from the row's pointerenter — used to snap the mat
   *  to the pointer when it first appears (covers scroll-under-cursor
   *  hovers that never fire a mousemove). */
  pointRef: React.RefObject<PeekPoint | null>;
}

/**
 * The taped polaroid that trails the cursor over the ledger. A fixed,
 * pointer-events-none, aria-hidden layer (z-120: above page content,
 * below the Desk Dock at z-150 and DeskCursor at z-9990) lerps toward
 * the pointer at 0.12/frame, offset right/below it, clamped inside the
 * viewport, and tilts with horizontal velocity (±6deg). All nine covers
 * render stacked once; switching rows crossfades them in ~150ms (CSS in
 * WorkLedger's scoped stylesheet). The rAF loop wakes on activity and
 * parks itself once settled. Entirely disabled on touch devices and
 * under reduced motion — SSR and the first client render output nothing
 * (DeskCursor pattern), so hydration stays deterministic.
 */
export function PhotoPeek({ projects, activeIndex, pointRef }: PhotoPeekProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<number | null>(null);
  const snapRef = useRef(false);
  const wakeRef = useRef<(() => void) | null>(null);
  // Last hovered project: keeps the outgoing shot/caption during fade-out.
  // Adjusted during render (guarded compare-and-set — React re-renders
  // before commit) rather than in an effect, per the react-hooks lint.
  const [shown, setShown] = useState(0);
  if (activeIndex !== null && activeIndex !== shown) {
    setShown(activeIndex);
  }

  const enabled = useSyncExternalStore(
    subscribeNoop,
    () => !isTouchDevice() && !prefersReducedMotion(),
    () => false
  );

  useEffect(() => {
    // Appearing from idle: snap to the pointer instead of flying in.
    if (activeIndex !== null && activeRef.current === null) snapRef.current = true;
    activeRef.current = activeIndex;
    wakeRef.current?.();
  }, [activeIndex]);

  useEffect(() => {
    if (!enabled) return;
    const el = layerRef.current;
    if (!el) return;

    let raf = 0;
    let running = false;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let tilt = 0;

    const loop = () => {
      if (snapRef.current) {
        snapRef.current = false;
        const seed = pointRef.current;
        if (seed) {
          targetX = seed.x;
          targetY = seed.y;
        }
        x = targetX;
        y = targetY;
        tilt = 0;
      }
      const prevX = x;
      x += (targetX - x) * LERP;
      y += (targetY - y) * LERP;
      const tiltTarget = Math.max(-MAX_TILT, Math.min(MAX_TILT, (x - prevX) * 0.55));
      tilt += (tiltTarget - tilt) * LERP;

      // Clamp near viewport edges so the mat never spills out of view.
      const width = el.offsetWidth || PEEK_WIDTH;
      const height = el.offsetHeight || 220;
      const left = Math.min(
        Math.max(x + OFFSET_X, EDGE_MARGIN),
        Math.max(EDGE_MARGIN, window.innerWidth - width - EDGE_MARGIN)
      );
      const top = Math.min(
        Math.max(y + OFFSET_Y, EDGE_MARGIN),
        Math.max(EDGE_MARGIN, window.innerHeight - height - EDGE_MARGIN)
      );
      el.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${(BASE_ROTATION + tilt).toFixed(2)}deg)`;

      // Park once faded out and settled; wake() restarts on activity.
      const idle =
        activeRef.current === null &&
        Math.abs(targetX - x) < 0.3 &&
        Math.abs(targetY - y) < 0.3 &&
        Math.abs(tilt) < 0.05;
      if (idle) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    wakeRef.current = wake;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (activeRef.current !== null) wake();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    if (activeRef.current !== null) wake();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      wakeRef.current = null;
    };
  }, [enabled, pointRef]);

  if (!enabled) return null;

  const caption = projects[shown];

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className={[
        "wl-peek pointer-events-none fixed left-0 top-0 z-[120] w-[260px]",
        activeIndex !== null ? "wl-peek-on" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="wl-peek-card relative border border-[rgba(22,22,22,0.12)] bg-[var(--card)] p-2.5 shadow-[var(--shadow-lift)]">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {projects.map((project, index) => (
            <Image
              key={project.slug}
              src={project.cover.src}
              alt=""
              width={SHOT_WIDTH}
              height={SHOT_HEIGHT}
              loading="lazy"
              className={[
                "wl-peek-shot absolute inset-0 h-full w-full object-cover",
                index === shown ? "wl-peek-shot-on" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
        <div className="flex items-baseline justify-between gap-2 px-0.5 pt-2">
          <span className="font-hand truncate text-xl leading-none text-[var(--ink)]">
            {caption?.title}
          </span>
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            Nº {String(caption?.order ?? 0).padStart(2, "0")}
          </span>
        </div>
        <Tape corner="left" />
        <Tape corner="right" />
      </div>
    </div>
  );
}

export default PhotoPeek;
