"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { prefersReducedMotion } from "@/lib/media";

export interface StickyNoteProps {
  className?: string;
}

/** Resting size (px) of the folded bottom-right corner. */
const BASE_FOLD = 26;
/** How much further (px) the fold opens up at full peel. */
const FOLD_GROWTH = 38;
/** Drag distance (px) past which releasing tears the note off. */
const TEAR_DISTANCE = 90;
/** Per-axis cap (px) on how far the corner follows the pointer. */
const DRAG_CAP = 130;
/** Peak tilt (deg) while peeling, hinged at the top-left corner. */
const MAX_TILT = 8;
/** Fraction of the pointer delta the note actually travels (peel drag). */
const FOLLOW = 0.6;

type Phase = "idle" | "dragging" | "springing" | "tearing" | "returning";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Cream sticky note with a folded bottom-right corner carrying the
 * "note to self" availability blurb. Idle it sways slowly and wiggles on
 * hover (both suspended the moment a drag starts so they can't fight the
 * drag transform). The folded corner is a ~44px grab zone: dragging it
 * peels the note — the fold clip grows and the sheet tilts/translates
 * with the pointer, hinged top-left. Release early and it springs back
 * (200ms); drag past ~90px and it tears clean off (note-tear keyframe),
 * with a fresh note stamping back in ~700ms later so nothing is lost.
 * Reduced motion disables the drag entirely (static note). SSR renders
 * the plain idle note — all interaction state starts static.
 *
 * Below md the note renders a compact variant (240px, base/lg hand text,
 * tighter padding) so it overlaps the footer's torn edge without eating a
 * whole phone screen; the peel/tear pointer logic is size-independent and
 * keeps working with touch pointers (the grab flap stays a 44px target).
 */
export function StickyNote({ className }: StickyNoteProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const grabStart = useRef({ x: 0, y: 0 });
  const pointerId = useRef<number | null>(null);
  const timeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timeouts.current.delete(t);
      fn();
    }, ms);
    timeouts.current.add(t);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Reduced motion: the note stays a static sheet of paper.
    if (phase !== "idle" || prefersReducedMotion()) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerId.current = event.pointerId;
    grabStart.current = { x: event.clientX, y: event.clientY };
    setDrag({ x: 0, y: 0 });
    setPhase("dragging");
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== "dragging" || event.pointerId !== pointerId.current) return;
    setDrag({
      x: clamp(event.clientX - grabStart.current.x, 0, DRAG_CAP),
      y: clamp(event.clientY - grabStart.current.y, 0, DRAG_CAP),
    });
  };

  const handleRelease = (event: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== "dragging" || event.pointerId !== pointerId.current) return;
    pointerId.current = null;
    if (Math.hypot(drag.x, drag.y) >= TEAR_DISTANCE) {
      // Tear off. Drag values stay put so the keyframe starts where the
      // pointer let go; once the scrap has flown, pop a fresh note in.
      setPhase("tearing");
      later(() => {
        setDrag({ x: 0, y: 0 });
        setPhase("returning");
        later(() => setPhase("idle"), 340);
      }, 700);
    } else {
      // Not far enough — spring back onto the desk.
      setDrag({ x: 0, y: 0 });
      setPhase("springing");
      later(() => setPhase("idle"), 210);
    }
  };

  const peel = Math.min(1, Math.hypot(drag.x, drag.y) / TEAR_DISTANCE);
  const fold = Math.round(BASE_FOLD + peel * FOLD_GROWTH);
  const tilt = +(peel * MAX_TILT).toFixed(2);

  const style: React.CSSProperties = {
    background: "#efdca4",
    clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${fold}px), calc(100% - ${fold}px) 100%, 0 100%)`,
    filter: "drop-shadow(0 8px 16px rgba(22, 22, 22, 0.16))",
  };
  if (phase === "dragging") {
    style.transform = `translate(${drag.x * FOLLOW}px, ${drag.y * FOLLOW}px) rotate(${tilt}deg) skewX(${(-peel * 1.5).toFixed(2)}deg)`;
    style.transformOrigin = "top left";
  } else if (phase === "springing") {
    style.transform = "translate(0px, 0px) rotate(0deg) skewX(0deg)";
    style.transformOrigin = "top left";
    style.transition = "transform 0.2s ease, clip-path 0.2s ease";
  } else if (phase === "tearing") {
    style.transformOrigin = "top left";
    // Hand the final drag transform to the note-tear keyframe.
    Object.assign(style, {
      "--note-x": `${(drag.x * FOLLOW).toFixed(1)}px`,
      "--note-y": `${(drag.y * FOLLOW).toFixed(1)}px`,
      "--note-r": `${tilt}deg`,
    });
  }

  return (
    <div
      className={[
        "relative w-[240px] max-w-[80vw] origin-top -rotate-2 p-4 pb-8 md:w-[300px] md:p-6 md:pb-9",
        phase === "idle" ? "animate-sway wiggle-on-hover" : "",
        phase === "dragging" ? "select-none" : "",
        phase === "tearing" ? "animate-note-tear" : "",
        phase === "returning" ? "animate-note-return" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <p className="font-hand text-base text-[var(--ink)]/70 md:text-xl">note to self —</p>
      <p className="font-hand mt-1.5 text-lg leading-snug text-[var(--ink)] md:mt-2 md:text-[21px]">
        {profile.comment.blurb}
      </p>
      {/* Folded-back corner flap along the diagonal cut — grows as the
          note peels. */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 block"
        style={{
          width: fold,
          height: fold,
          background: "rgba(22, 22, 22, 0.16)",
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
          transition: phase === "springing" ? "width 0.2s ease, height 0.2s ease" : undefined,
        }}
      />
      {/* Grab zone over the folded corner. Decorative easter egg (the
          note always comes back), so no role/tab stop — same convention
          as the footer stamp playground. */}
      <div
        aria-hidden="true"
        className={[
          "absolute bottom-0 right-0 z-10 h-11 w-11 touch-none",
          phase === "dragging" ? "cursor-grabbing" : "cursor-grab",
        ].join(" ")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handleRelease}
        onPointerCancel={handleRelease}
      />
    </div>
  );
}

export default StickyNote;
