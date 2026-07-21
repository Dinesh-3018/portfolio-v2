"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { story } from "@/data/story";
import { storyTa } from "@/data/storyTa";
import StampBadge from "@/components/ui/StampBadge";
import { prefersReducedMotion } from "@/lib/media";

const TOTAL = story.length;
// The "00" dedication is a preface, not a numbered chapter — the page counter
// reads out of the real story chapters (01–05) so it never shows a phantom
// page (5 chapters, not 6).
const STORY_TOTAL = story.filter((c) => c.no !== "00").length;
const STORY_TOTAL_LABEL = String(STORY_TOTAL).padStart(2, "0");

/** The story reads in English or Tamil; the flip-book swaps content only. */
type Lang = "en" | "ta";
const LANGS: { id: Lang; label: string }[] = [
  // Tamil leads — it's the story's default and first language.
  { id: "ta", label: "தமிழ்" },
  { id: "en", label: "English" },
];
const subscribeNoop = () => () => {};

/** Render inline **bold** and *italic* emphasis from the story markdown so
 *  it doesn't surface as literal asterisks on the page. */
function renderRich(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let key = 0;
  // Split on newlines so a hint can render as separate bulleted lines.
  text.split("\n").forEach((line, li) => {
    if (li > 0) nodes.push(<br key={`br${key++}`} />);
    const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      if (match.index > last) nodes.push(line.slice(last, match.index));
      if (match[1] !== undefined) {
        nodes.push(
          <strong key={key++} className="font-semibold text-[var(--ink)]">
            {match[1]}
          </strong>
        );
      } else {
        nodes.push(<em key={key++}>{match[2]}</em>);
      }
      last = pattern.lastIndex;
    }
    if (last < line.length) nodes.push(line.slice(last));
  });
  return nodes;
}

/** localStorage key for the persisted mute preference. */
const MUTE_KEY = "storybook-muted";
/** Same-tab notification that the persisted mute preference changed. */
const MUTE_EVENT = "storybook-muted-change";
/** Horizontal drag past this many px (and clearly horizontal) turns the page. */
const SWIPE_PX = 50;

/**
 * The mute preference lives in localStorage and is read through
 * useSyncExternalStore so SSR + the first client render are deterministic
 * (always `false`, sound on) and the stored value is only reflected after
 * hydration — same mount-gate discipline as the flip machinery, with no
 * setState-in-effect. Reading returns a primitive, so repeated snapshots are
 * `Object.is`-stable (no render loop).
 */
function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    // localStorage blocked (private mode / policy) — keep sound on.
    return false;
  }
}

function subscribeMuted(onChange: () => void): () => void {
  window.addEventListener(MUTE_EVENT, onChange);
  window.addEventListener("storage", onChange); // cross-tab sync
  return () => {
    window.removeEventListener(MUTE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

type Phase = "idle" | "leaving" | "entering";
type Dir = "next" | "prev";

/**
 * Paper-stack shuffle: the pages are a pile of index cards on the desk. The
 * top card slides off toward the desk (translate + tilt, fading) while the
 * next card rises from the pile and settles into place with a soft overshoot
 * — like dealing the next page off a stack. Direction-aware (next slides
 * right, prev left). Kept inline so the component is self-contained
 * (globals.css is off-limits). Reduced motion collapses it to ~instant (and
 * `go()` skips it entirely).
 */
const SHUFFLE_CSS = `
.sb-page { transform-origin: center; will-change: transform, opacity; }
.sb-leave-next { animation: sb-leave-next 260ms cubic-bezier(0.5,0,0.75,0.15) forwards; }
.sb-enter-next { animation: sb-enter-next 400ms cubic-bezier(0.2,1.1,0.35,1) forwards; }
.sb-leave-prev { animation: sb-leave-prev 260ms cubic-bezier(0.5,0,0.75,0.15) forwards; }
.sb-enter-prev { animation: sb-enter-prev 400ms cubic-bezier(0.2,1.1,0.35,1) forwards; }
@keyframes sb-leave-next{from{transform:none;opacity:1}to{transform:translate(18%,46px) rotate(9deg);opacity:0}}
@keyframes sb-enter-next{0%{transform:translateY(30px) scale(0.92);opacity:0}55%{opacity:1}100%{transform:none;opacity:1}}
@keyframes sb-leave-prev{from{transform:none;opacity:1}to{transform:translate(-18%,46px) rotate(-9deg);opacity:0}}
@keyframes sb-enter-prev{0%{transform:translateY(30px) scale(0.92);opacity:0}55%{opacity:1}100%{transform:none;opacity:1}}
@media (prefers-reduced-motion: reduce){
.sb-leave-next,.sb-enter-next,.sb-leave-prev,.sb-enter-prev{animation-duration:1ms !important;animation-delay:0s !important}
}
`;

function ArrowIcon({ dir }: { dir: Dir }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={dir === "prev" ? "" : "-scale-x-100"}
    >
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 9v6h4l5 4V5L8 9H4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {muted ? (
        <path
          d="M16.5 9.5l5 5M21.5 9.5l-5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M16.5 8.8a4.4 4.4 0 010 6.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M19.2 6.2a8 8 0 010 11.6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

/**
 * "MY STORY" journal: one chapter shown at a time as a warm paper page you
 * flip through. SSR renders every chapter as real text (chapter 1 visible,
 * the rest visibility-hidden but reserving the tallest height so turns never
 * jump the layout); after mount the flip machinery activates. Real prev/next
 * buttons, chapter dots, ArrowLeft/Right keys, and a pointer drag (mouse /
 * touch / pen) all turn the page. Each user turn plays a subtle synthesized
 * paper-swish (mutable + persisted). An off-screen live region announces the
 * current chapter.
 */
export function StoryBook() {
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dir, setDir] = useState<Dir>("next");
  const [liveMsg, setLiveMsg] = useState("");
  const [lang, setLang] = useState<Lang>("ta");
  // Active-language chapters (same length + `no` values in both languages, so
  // the index, counter, and flip machinery are identical). Tamil text gets the
  // Tamil serif face; its glyphs aren't in Fraunces/Space Grotesk/Caveat.
  const chapters = lang === "ta" ? storyTa : story;
  const isTa = lang === "ta";
  const taFont = isTa ? { fontFamily: "var(--font-tamil)" } : undefined;

  // false on the server / first client render, true once hydrated — the
  // mount gate (same shape as DeskCursor) so SSR stays static + readable.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  // Sound preference. `false` (sound on) on the server + first client render;
  // reflects the persisted choice after hydration.
  const muted = useSyncExternalStore(subscribeMuted, readMuted, () => false);

  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  // The currently-visible page element, so a drag can translate it directly
  // without a re-render on every pointer move.
  const activeArticleRef = useRef<HTMLElement>(null);
  // In-flight pointer drag (mouse / touch / pen), or null when idle.
  const pointer = useRef<{ x: number; y: number; id: number; captured: boolean } | null>(null);
  // Lazily-created on the first turn (a turn is a user gesture, so this is a
  // legal place to start audio). Closed on unmount.
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Release the AudioContext when the component goes away.
  useEffect(() => {
    return () => {
      const ctx = audioCtxRef.current;
      audioCtxRef.current = null;
      if (ctx) {
        try {
          void ctx.close();
        } catch {
          // already closing / unsupported — nothing to do.
        }
      }
    };
  }, []);

  function getAudioCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioCtxRef.current = new Ctor();
    } catch {
      return null;
    }
    return audioCtxRef.current;
  }

  // One filtered-noise burst: white noise through a bandpass that glides from
  // f0→f1 with a fast attack/decay envelope — a short "swish" like paper
  // sliding. Cheap enough to synthesize per turn.
  function playSwish(
    ctx: AudioContext,
    at: number,
    duration: number,
    peak: number,
    f0: number,
    f1: number
  ) {
    const frames = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.8;
    band.frequency.setValueAtTime(f0, at);
    band.frequency.exponentialRampToValueAtTime(Math.max(1, f1), at + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

    src.connect(band).connect(gain).connect(ctx.destination);
    src.start(at);
    src.stop(at + duration + 0.02);
  }

  // Called on every successful, user-driven turn (never on mount/first paint).
  function playTurnSound() {
    if (muted) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") void ctx.resume();
      const t = ctx.currentTime + 0.001;
      playSwish(ctx, t, 0.15, 0.12, 3200, 1500); // the slide
      playSwish(ctx, t + 0.055, 0.09, 0.05, 2400, 1300); // the settle tap
    } catch {
      // Web Audio hiccup — degrade silently.
    }
  }

  function toggleMute() {
    const next = !muted;
    try {
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      // persistence unavailable — the dispatched event still flips the session.
    }
    // Notify this tab's subscriber so the external store re-reads and the
    // label/state flip immediately (the native `storage` event only fires in
    // other tabs).
    window.dispatchEvent(new Event(MUTE_EVENT));
  }

  function go(to: number) {
    if (to < 0 || to > TOTAL - 1 || to === index) return;
    if (phase !== "idle") return; // ignore input mid-turn
    const chapter = chapters[to];
    setLiveMsg(`Chapter ${to + 1} of ${TOTAL}: ${chapter.title}`);
    playTurnSound(); // this is a real user turn — safe to sound

    // No motion (pre-mount or reduced-motion): instant swap, no 3D.
    if (!mounted || prefersReducedMotion()) {
      setIndex(to);
      return;
    }

    setDir(to > index ? "next" : "prev");
    setPending(to);
    setPhase("leaving"); // the current page animates out; commit on its end
  }

  function handlePrev() {
    const to = index - 1;
    go(to);
    // If we've landed on the first page the Prev button will disable; keep
    // focus on-screen by moving it to the still-enabled Next button.
    if (to <= 0) nextBtnRef.current?.focus();
  }

  function handleNext() {
    const to = index + 1;
    go(to);
    if (to >= TOTAL - 1) prevBtnRef.current?.focus();
  }

  function onPageAnimEnd(e: React.AnimationEvent<HTMLElement>) {
    if (!e.animationName.startsWith("sb-")) return;
    if (phase === "leaving") {
      setIndex(pending); // mid-turn: swap to the new page, then swing it in
      setPhase("entering");
    } else if (phase === "entering") {
      setPhase("idle");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    }
  }

  // Reset any in-progress drag translation on the active page. `animate` eases
  // it back (snap-back under threshold); otherwise clear instantly so the
  // shuffle animation starts from a clean transform.
  function resetDragTransform(animate: boolean) {
    const el = activeArticleRef.current;
    if (!el) return;
    el.style.transition = animate ? "transform 200ms cubic-bezier(0.2,1.1,0.35,1)" : "none";
    el.style.transform = "";
  }

  // Unified pointer drag: mirrors the old touch swipe but covers mouse + pen
  // too. We never call preventDefault, so vertical page scrolling stays with
  // the browser (which fires pointercancel — handled below — when it decides
  // the gesture is a scroll). A small movement is treated as a click and does
  // nothing, so reading / clicking a link still works.
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button > 0) return; // ignore non-primary mouse buttons
    pointer.current = { x: e.clientX, y: e.clientY, id: e.pointerId, captured: false };
    const el = activeArticleRef.current;
    if (el) el.style.transition = ""; // follow the pointer instantly
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;

    // Only claim the gesture once it's clearly a horizontal drag — leaves
    // taps / clicks / vertical scrolls untouched.
    if (!p.captured && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      p.captured = true;
      try {
        e.currentTarget.setPointerCapture(p.id);
      } catch {
        // capture unsupported — the drag still resolves on pointerup.
      }
    }

    // Optional follow: nudge the page a few px toward the pointer. Only while
    // idle + animated, so it never fights the shuffle animation.
    if (p.captured && mounted && phase === "idle" && !prefersReducedMotion()) {
      const el = activeArticleRef.current;
      if (el) {
        const damped = Math.max(-48, Math.min(48, dx * 0.4));
        el.style.transform = `translateX(${damped}px)`;
      }
    }
  }

  function finishPointer(e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) {
    const p = pointer.current;
    pointer.current = null;
    if (!p || p.id !== e.pointerId) return;
    if (p.captured) {
      try {
        e.currentTarget.releasePointerCapture(p.id);
      } catch {
        // nothing to release.
      }
    }
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    const horizontalTurn =
      !cancelled && Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.4;

    if (horizontalTurn) {
      resetDragTransform(false); // clean slate for the shuffle animation
      if (dx < 0) handleNext();
      else handlePrev();
    } else {
      resetDragTransform(true); // snap the page back
    }
  }

  const activeAnim =
    phase === "leaving"
      ? `sb-leave-${dir}`
      : phase === "entering"
        ? `sb-enter-${dir}`
        : "";

  return (
    <div
      role="group"
      aria-roledescription="story journal"
      aria-label="My story, page by page"
      onKeyDown={onKeyDown}
      className="w-full"
    >
      <style dangerouslySetInnerHTML={{ __html: SHUFFLE_CSS }} />

      {/* Language toggle — swaps the story between English and Tamil. */}
      <div className="mb-5 flex justify-center sm:justify-end">
        <div
          role="group"
          aria-label="Story language"
          className="inline-flex items-center rounded-full border border-[var(--ink)] bg-[var(--card)] p-0.5 shadow-[var(--shadow-press-sm)]"
        >
          {LANGS.map((l) => {
            const active = lang === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                aria-pressed={active}
                data-track="story_language"
                data-track-lang={l.id}
                className={[
                  "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink-ink)] motion-reduce:transition-none",
                  active
                    ? "bg-[var(--accent-yellow)] text-[var(--ink)]"
                    : "text-[var(--ink-soft)] hover:text-[var(--ink)]",
                ].join(" ")}
                style={l.id === "ta" ? { fontFamily: "var(--font-tamil)" } : { fontFamily: "var(--font-space-mono)" }}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Off-screen announcer for the current chapter. */}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveMsg}
      </p>

      {/* Prev / next flank the page so they're always within reach; the stage
          flex-shrinks between them so nothing overflows at narrow widths. */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          ref={prevBtnRef}
          type="button"
          onClick={handlePrev}
          disabled={index === 0}
          aria-label="Previous chapter"
          className="press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border border-[var(--ink)] bg-[var(--card)] text-[var(--ink)] shadow-[var(--shadow-press-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink-ink)] disabled:pointer-events-none disabled:opacity-35"
        >
          <ArrowIcon dir="prev" />
        </button>

        {/* Stage: overflow-hidden clips the card as it slides off the desk;
            padding keeps the press-shadow, tape, and the peeking pile. */}
        <div
          className="min-w-0 flex-1 overflow-hidden px-4 pb-7 pt-5 sm:px-6"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => finishPointer(e, false)}
          onPointerCancel={(e) => finishPointer(e, true)}
        >
          {/* A relative pile: two faint cards peek out behind the active page
              so it reads as a stack of papers on the desk. */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-[13px] translate-y-[15px] rotate-[2.4deg] rounded-[2px] border border-[var(--ink)]/25 bg-[var(--card)] shadow-[2px_3px_10px_rgba(22,22,22,0.07)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-[7px] translate-y-[8px] rotate-[1.2deg] rounded-[2px] border border-[var(--ink)]/40 bg-[var(--card)] shadow-[2px_3px_10px_rgba(22,22,22,0.07)]"
            />
            {/* All chapters stack in one grid cell so the cell reserves the
                tallest chapter's height — page turns never shift the layout. */}
            <div className="relative z-10 grid">
              {chapters.map((ch, i) => {
                const active = i === index;
                return (
                  <div
                    key={ch.no}
                    style={{ gridArea: "1 / 1" }}
                    aria-hidden={!active}
                    className={[
                      "flex rotate-[-0.6deg]",
                      active ? "z-10" : "invisible pointer-events-none",
                    ].join(" ")}
                  >
                    <article
                      ref={active ? activeArticleRef : undefined}
                      onAnimationEnd={active ? onPageAnimEnd : undefined}
                      data-hide-cursor="true"
                      className={[
                        "sb-page relative flex w-full cursor-grab select-none flex-col rounded-[2px] border border-[var(--ink)] bg-[var(--card)] px-6 py-9 shadow-[var(--shadow-press-lg)] active:cursor-grabbing sm:px-12 sm:py-12",
                        "min-h-[26rem]",
                        active ? activeAnim : "",
                      ].join(" ")}
                    >
                      {/* Washi-tape accent across the top edge. */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-2 left-10 h-5 w-24 -rotate-3 rounded-[1px] bg-[var(--tape)] shadow-[0_1px_2px_rgba(22,22,22,0.12)]"
                      />
                      {/* Page counter, mono micro, top-right. */}
                      <span
                        aria-hidden="true"
                        className="absolute right-4 top-4 font-mono text-[10px] font-bold tracking-[0.15em] text-[var(--ink-soft)] [font-variant-numeric:tabular-nums]"
                      >
                        {ch.no === "00" ? "PREFACE" : `${ch.no} / ${STORY_TOTAL_LABEL}`}
                      </span>

                      <StampBadge tone="var(--postal-red)" rotate={-5} size="sm" className="self-start">
                        N&ordm;&nbsp;{ch.no}
                      </StampBadge>

                      <h3
                        className={[
                          isTa ? "" : "font-display",
                          "mt-5 max-w-[20ch] text-3xl font-semibold leading-[1.15] tracking-tight text-[var(--ink)] sm:text-4xl",
                        ].join(" ")}
                        style={taFont}
                      >
                        {ch.title}
                      </h3>

                      <div
                        className="mt-6 max-w-prose space-y-5 text-[16px] leading-relaxed text-[var(--ink)]/90 sm:text-[17px]"
                        style={taFont}
                      >
                        {ch.paragraphs.map((paragraph, p) => (
                          <p key={p}>{renderRich(paragraph)}</p>
                        ))}
                      </div>

                      {ch.note ? (
                        <p
                          className={[
                            isTa ? "" : "font-hand",
                            "mt-auto max-w-[34ch] pt-9 leading-snug text-[var(--ink-soft)]",
                            isTa ? "text-lg sm:text-xl" : "text-2xl sm:text-[1.7rem]",
                          ].join(" ")}
                          style={taFont}
                        >
                          {ch.note}
                        </p>
                      ) : (
                        <span className="mt-auto" aria-hidden="true" />
                      )}
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          ref={nextBtnRef}
          type="button"
          onClick={handleNext}
          disabled={index === TOTAL - 1}
          aria-label="Next chapter"
          className="press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border border-[var(--ink)] bg-[var(--card)] text-[var(--ink)] shadow-[var(--shadow-press-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink-ink)] disabled:pointer-events-none disabled:opacity-35"
        >
          <ArrowIcon dir="next" />
        </button>
      </div>

      {/* Chapter dots, centered just below the card; mute toggle at the edge. */}
      <div className="relative mt-4 flex min-h-[2.25rem] items-center justify-center">
        <div
          role="group"
          aria-label="Jump to chapter"
          className="flex flex-wrap items-center justify-center gap-0.5 px-11"
        >
          {chapters.map((ch, i) => {
            const current = i === index;
            return (
              <button
                key={ch.no}
                type="button"
                onClick={() => go(i)}
                aria-label={ch.no === "00" ? `Preface: ${ch.title}` : `Chapter ${ch.no}: ${ch.title}`}
                aria-current={current ? "true" : undefined}
                className="group flex items-center justify-center p-2 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent-pink-ink)]"
              >
                <span
                  aria-hidden="true"
                  className={[
                    "block h-2.5 w-2.5 rounded-[2px] border transition-colors duration-200 motion-reduce:transition-none",
                    current
                      ? "border-[var(--postal-red)] bg-[var(--postal-red)]"
                      : "border-[var(--ink)]/50 bg-transparent group-hover:bg-[var(--ink)]/25",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Unmute page sound" : "Mute page sound"}
          className="press absolute right-0 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[3px] border border-[var(--ink)] bg-[var(--card)] text-[var(--ink)] shadow-[var(--shadow-press-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink-ink)]"
        >
          <SpeakerIcon muted={muted} />
        </button>
      </div>

      <p
        aria-hidden="true"
        className="mt-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]"
      >
        turn the page &mdash; {mounted ? "drag, arrows, or dots" : `${STORY_TOTAL} chapters`}
      </p>
    </div>
  );
}

export default StoryBook;
