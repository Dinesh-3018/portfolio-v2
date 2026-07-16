"use client";

import { useEffect, useRef, useState } from "react";

export interface FooterPlaygroundProps {
  children: React.ReactNode;
  className?: string;
}

interface PressedStamp {
  id: number;
  x: number;
  y: number;
  rotation: number;
  kind: number;
  tone: string;
  leaving: boolean;
}

/** Alternate stamp inks: postal red and plain ink, both faint via opacity. */
const TONES = ["var(--postal-red)", "var(--ink)"];

/** Cap of stamps on screen; the oldest fades out when a new one exceeds it. */
const MAX_STAMPS = 10;

/** Eight-ray asterisk burst. */
function StarMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="stamp-rough"
    >
      <path d="M14 3v22M3 14h22M6.2 6.2l15.6 15.6M21.8 6.2L6.2 21.8" />
    </svg>
  );
}

/** Mini mail cancellation: double ring plus three wavy exit lines. */
function PostmarkMark() {
  return (
    <svg width="46" height="34" viewBox="0 0 46 34" fill="none" stroke="currentColor" className="stamp-rough">
      <circle cx="15" cy="17" r="13" strokeWidth="1.5" />
      <circle cx="15" cy="17" r="8" strokeWidth="1" />
      <path d="M31 11q4-2.5 8 0t6 0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 17q4-2.5 8 0t5 0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M31 23q4-2.5 8 0t6 0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Tiny rounded-rect stamp frame with a star pressed inside. */
function BoxStarMark() {
  return (
    <svg width="36" height="26" viewBox="0 0 36 26" fill="none" stroke="currentColor" className="stamp-rough">
      <rect x="1.5" y="1.5" width="33" height="23" rx="5" strokeWidth="1.5" />
      <path
        d="M18 6.5l1.9 3.7 4.1.6-3 2.9.7 4.1L18 15.9l-3.7 1.9.7-4.1-3-2.9 4.1-.6z"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MARKS = [StarMark, PostmarkMark, BoxStarMark];

/**
 * Desk-surface playground wrapping the footer panel. Clicking bare paper
 * (never links/buttons) presses a faint postmark or star stamp at the
 * click point with a quick stamp-pop; at most MAX_STAMPS live at once,
 * the oldest fading out. Purely decorative: the stamp layer is
 * aria-hidden and pointer-events-none, the wrapper takes no focus, and
 * reduced-motion users still get the stamp (globals.css collapses the
 * pop/fade to ~0s).
 */
export function FooterPlayground({ children, className }: FooterPlaygroundProps) {
  const [stamps, setStamps] = useState<PressedStamp[]>([]);
  const nextId = useRef(0);
  const timeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    // Never hijack real interactions — links, buttons, form controls.
    if (target?.closest("a, button, input, textarea, select, summary, [data-no-stamp]")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const id = nextId.current++;
    const stamp: PressedStamp = {
      id,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      rotation: Math.round(Math.random() * 44 - 22),
      kind: id % MARKS.length,
      tone: TONES[id % TONES.length],
      leaving: false,
    };

    setStamps((prev) => {
      let next = [...prev, stamp];
      const alive = next.filter((s) => !s.leaving);
      if (alive.length > MAX_STAMPS) {
        const oldest = alive[0];
        next = next.map((s) => (s.id === oldest.id ? { ...s, leaving: true } : s));
        const t = setTimeout(() => {
          timeouts.current.delete(t);
          setStamps((current) => current.filter((s) => s.id !== oldest.id));
        }, 480);
        timeouts.current.add(t);
      }
      return next;
    });
  };

  return (
    // Decorative easter egg only: not focusable, no role — real controls
    // inside keep their own semantics and are excluded from stamping.
    <div className={["relative", className].filter(Boolean).join(" ")} onClick={handleClick}>
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] select-none overflow-hidden">
        {stamps.map((stamp) => {
          const Mark = MARKS[stamp.kind];
          return (
            <span
              key={stamp.id}
              className={["absolute block", stamp.leaving ? "animate-stamp-fade" : ""].filter(Boolean).join(" ")}
              style={{
                left: stamp.x,
                top: stamp.y,
                color: stamp.tone,
                opacity: 0.42,
                transform: `translate(-50%, -50%) rotate(${stamp.rotation}deg)`,
              }}
            >
              <span className="animate-stamp-pop block">
                <Mark />
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default FooterPlayground;
