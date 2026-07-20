"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { doodleFor, doodleForKey, fullDateKey, type DeskDoodle as Doodle } from "@/data/doodles";

/** A `?doodle=` preview pins the tag for the page's lifetime; resolved once
 *  (undefined = not yet checked, null = no override present). */
let override: Doodle | null | undefined;
function readOverride(): Doodle | null {
  if (override === undefined) {
    override = null;
    try {
      const raw = new URLSearchParams(window.location.search).get("doodle");
      // Accepts "MM-DD" and "YYYY-MM-DD" — the latter is needed to preview
      // per-year pinned days like Pongal.
      if (raw && /^(\d{4}-)?\d{2}-\d{2}$/.test(raw)) override = doodleForKey(raw);
    } catch {
      // URL parsing hiccup — fall through to today's real date.
    }
  }
  return override;
}

/** Today's tag, cached by date so the store snapshot stays referentially
 *  stable across renders (useSyncExternalStore requires that). */
let cached: { key: string; value: Doodle | null } | null = null;

function clientDoodle(): Doodle | null {
  const previewed = readOverride();
  if (previewed) return previewed;
  const now = new Date();
  const key = fullDateKey(now);
  if (!cached || cached.key !== key) cached = { key, value: doodleFor(now) };
  return cached.value;
}

/**
 * A tab left open across local midnight would otherwise keep yesterday's tag
 * forever — the champagne tag lingering all through New Year's Day, or worse,
 * a grabbable cream tag persisting into a remembrance day. So the store
 * re-resolves itself at midnight and notifies React.
 */
const listeners = new Set<() => void>();
let midnightTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleMidnight() {
  const now = new Date();
  // A couple of seconds past midnight, to stay clear of clock jitter.
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
  midnightTimer = setTimeout(() => {
    cached = null;
    for (const notify of listeners) notify();
    scheduleMidnight();
  }, next.getTime() - now.getTime());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (midnightTimer === null) scheduleMidnight();
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && midnightTimer !== null) {
      clearTimeout(midnightTimer);
      midnightTimer = null;
    }
  };
}

/** Rest length of the string (matches the h-3 rest state). */
const STRING_REST = 12;
/** Pointer distance where the rubber-band resistance kicks in. */
const SOFT_RADIUS = 70;

/**
 * enter  → first paint: shared drop-in + sway (.animate-doodle)
 * held   → being dragged: raw pointer tracking, string stretches
 * return → released: elastic spring back to rest
 * idle   → after a grab: sway-only loop (no entrance replay)
 */
type Phase = "enter" | "held" | "return" | "idle";

/**
 * Google-Doodle-style day tag: on days listed in `DOODLES`, a small paper
 * tag dangles on a string from the dock. It's also a toy — grab it and the
 * string stretches like elastic; let go and it springs back with a bounce.
 * Preview any date with `?doodle=MM-DD`; renders nothing on plain days.
 */
export default function DeskDoodle() {
  // Server snapshot is null on purpose: the tag is date-dependent, so
  // rendering it server-side would risk a hydration mismatch.
  const doodle = useSyncExternalStore(subscribe, clientDoodle, () => null);
  const [phase, setPhase] = useState<Phase>("enter");

  const tagRef = useRef<HTMLSpanElement>(null);
  const stringRef = useRef<HTMLSpanElement>(null);
  const grab = useRef<{ x: number; y: number; id: number } | null>(null);
  const settleTimer = useRef<number | null>(null);

  function applyOffset(ox: number, oy: number) {
    const tag = tagRef.current;
    const string = stringRef.current;
    if (!tag || !string) return;
    // Tag follows the pointer, tilting with horizontal pull like a pendulum.
    const tilt = Math.max(-26, Math.min(26, ox * 0.3));
    tag.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px) rotate(${tilt.toFixed(1)}deg)`;
    // String stays pinned to the dock and stretches to the tag's top.
    // (CSS +rotation is clockwise, which swings the hanging end toward -x,
    // so the angle toward the tag needs negating.)
    const sy = Math.max(4, STRING_REST + oy);
    const angle = -Math.atan2(ox, sy);
    string.style.height = `${Math.hypot(ox, sy).toFixed(1)}px`;
    string.style.transform = `rotate(${angle.toFixed(4)}rad)`;
  }

  // "still" tiers (respectful + solemn) share the no-grab, no-sway behaviour;
  // only solemn also mutes the paper.
  const still = doodle?.tone === "respectful" || doodle?.tone === "solemn";
  const muted = doodle?.tone === "solemn";

  function onPointerDown(e: React.PointerEvent<HTMLSpanElement>) {
    if (e.button > 0 || still) return;
    e.preventDefault();
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    grab.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // capture unsupported — drag still resolves on pointerup
    }
    setPhase("held");
  }

  function onPointerMove(e: React.PointerEvent<HTMLSpanElement>) {
    const g = grab.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    // Rubber-band: full travel up close, growing resistance further out.
    const len = Math.hypot(dx, dy);
    const eased = len > SOFT_RADIUS ? SOFT_RADIUS + (len - SOFT_RADIUS) * 0.3 : len;
    const k = len > 0 ? eased / len : 0;
    applyOffset(dx * k, dy * k);
  }

  function release(e: React.PointerEvent<HTMLSpanElement>) {
    const g = grab.current;
    if (!g || g.id !== e.pointerId) return;
    grab.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // nothing to release
    }
    setPhase("return");
    // Next frame: snap targets back to rest so the spring transition runs.
    requestAnimationFrame(() => {
      const tag = tagRef.current;
      const string = stringRef.current;
      if (tag) tag.style.transform = "translate(0px, 0px) rotate(0deg)";
      if (string) {
        string.style.height = `${STRING_REST}px`;
        string.style.transform = "rotate(0rad)";
      }
    });
    // Once the spring lands, clear inline styles and hand off to the sway.
    settleTimer.current = window.setTimeout(() => {
      const tag = tagRef.current;
      const string = stringRef.current;
      if (tag) tag.style.transform = "";
      if (string) {
        string.style.height = "";
        string.style.transform = "";
      }
      setPhase("idle");
    }, 640);
  }

  if (!doodle) return null;

  // Respectful + remembrance days skip the whole grab/sway toy: lowered,
  // still, untouchable.
  const tagPhaseClass = still
    ? "animate-doodle-still"
    : phase === "enter"
      ? "animate-doodle"
      : phase === "held"
        ? "doodle-held cursor-grabbing"
        : phase === "return"
          ? "doodle-return"
          : "animate-doodle-idle";

  const stringPhaseClass =
    still || phase === "enter" || phase === "idle"
      ? ""
      : phase === "held"
        ? "doodle-string-held"
        : "doodle-string-return";

  // Solemn mutes the paper; respectful keeps the normal cream sticker and
  // only gives up the motion and the grabbing.
  const tagSkinClass = muted
    ? "border-[var(--ink)]/35 bg-[var(--card)] text-[var(--ink-soft)] shadow-none"
    : [
        "border-[var(--ink)] bg-[var(--accent-cream)] text-[var(--ink)] shadow-[var(--shadow-press-sm)]",
        still ? "" : "cursor-grab",
      ]
        .filter(Boolean)
        .join(" ");

  return (
    <div
      className="absolute right-5 top-full flex flex-col items-center pt-3 sm:right-8"
      aria-label={`Today is ${doodle.title}`}
    >
      {/* The string: absolutely pinned to the dock edge (out of flow, so
          stretching it never pushes the tag), rest length = the pt-3 gap. */}
      <span
        ref={stringRef}
        aria-hidden="true"
        className={[
          "absolute -top-px left-[calc(50%-0.5px)] h-3 w-px origin-top",
          muted ? "bg-[var(--ink)]/25" : "bg-[var(--ink)]/45",
          "animate-doodle-string",
          stringPhaseClass,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {/* The tag: drops in with the shared doodle-hang settle, sways from the
          string's tip, and doubles as a grab-and-release elastic toy. */}
      <span
        ref={tagRef}
        title={doodle.title}
        data-hide-cursor="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        className={[
          "flex touch-none select-none items-center gap-1.5 rounded-[2px] border py-1 pl-2 pr-2.5",
          tagSkinClass,
          tagPhaseClass,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={["text-sm leading-none", muted ? "opacity-80" : ""].filter(Boolean).join(" ")}
          aria-hidden="true"
        >
          {doodle.emoji}
        </span>
        <span className="whitespace-nowrap font-mono text-[9px] font-bold uppercase leading-none tracking-[0.14em]">
          {doodle.label}
        </span>
      </span>
    </div>
  );
}
