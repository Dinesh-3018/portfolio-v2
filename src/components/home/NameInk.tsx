"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { prefersReducedMotion } from "@/lib/media";

export interface NameInkProps {
  name: string;
  className?: string;
}

/* ---------------------------------------------------------------- */
/* Tuning                                                           */
/* ---------------------------------------------------------------- */

/** Canvas bleed beyond the text box (px) so scattered dots aren't clipped. */
const PAD = 48;
/** Pointer repulsion radius / strength and the "heat" (pink tint) radius. */
const REPEL_RADIUS = 90;
const REPEL_FORCE = 3.2;
const HEAT_RADIUS = 26;
/** Spring-back stiffness, per-step velocity damping, heat cooling (~1s). */
const SPRING_K = 0.07;
const DAMPING = 0.86;
const HEAT_DECAY = 0.94;
/** Sampling grid: start gap (CSS px) adapted toward the particle budget. */
const BASE_GAP = 3;
const TARGET_COUNT = 2600;
const COUNT_MIN = 1800;
const COUNT_MAX = 3200;
/** Fixed physics timestep (ms) so feel is stable on 60/120Hz displays. */
const STEP_MS = 1000 / 60;
const TAU = Math.PI * 2;
/** Float32Array stride: hx, hy, x, y, vx, vy, heat. */
const STRIDE = 7;

/* ---------------------------------------------------------------- */
/* Reduced-motion gate (useSyncExternalStore, see DeskCursor)       */
/* ---------------------------------------------------------------- */

const subscribeReducedMotion = (onStoreChange: () => void) => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
};

/** Parse "rgb(r, g, b)" / "#rrggbb" computed values with a fallback. */
function parseColor(value: string, fallback: [number, number, number]): [number, number, number] {
  const rgb = value.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  const hex = value.trim().match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const v = parseInt(hex[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  return fallback;
}

/**
 * Hero name as a canvas particle system: the rendered Bitcount glyphs are
 * sampled offscreen (getImageData on a grid) into ~1200–2200 round dots
 * that reassemble the exact text. Desktop hover REPELS dots within ~90px
 * with squared falloff (letters disintegrate around the cursor and spring
 * back behind it); dots the cursor brushes take "heat" — a pink tint that
 * cools back to ink over ~1s. Pointerdown BURSTS the whole name radially
 * from the pointer (the tap interaction on touch devices), reassembling in
 * about 1.2s. One fixed-timestep rAF loop parks whenever everything is
 * settled and the pointer is outside.
 *
 * SSR renders the plain text only; the canvas mounts after hydration and
 * activates once document.fonts confirms the pixel face, at which point
 * the text flips to visibility:hidden (it stays in the DOM as the layout
 * ghost that sizes the card). If the font or a 2D context never arrives —
 * or under reduced motion — the plain text simply stays. A sr-only h1
 * keeps the real name for assistive tech.
 */
export function NameInk({ name, className }: NameInkProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLParagraphElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // false on the server / during hydration (plain text, no mismatch), then
  // live: flipping reduced-motion on unmounts the canvas and restores text.
  const enabled = useSyncExternalStore(
    subscribeReducedMotion,
    () => !prefersReducedMotion(),
    () => false
  );

  useEffect(() => {
    if (!enabled) return;
    const wrap = wrapRef.current;
    const ghost = ghostRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !ghost || !canvas) return;
    const text = name.trim().toUpperCase();
    if (!text || typeof document === "undefined" || !document.fonts) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // no 2D context: keep the plain text

    let disposed = false;
    let raf = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let ro: ResizeObserver | null = null;
    const teardowns: (() => void)[] = [];

    /* ---- particle store ---- */
    let data = new Float32Array(0);
    let count = 0;
    let dotR = BASE_GAP * 0.58;
    let boxW = 0;
    let boxH = 0;
    let ink: [number, number, number] = [22, 22, 22]; // --ink
    let pink: [number, number, number] = [216, 54, 93]; // --accent-pink
    let inkStyle = "rgb(22,22,22)";
    const hot: number[] = []; // reused per frame
    const pointer = { x: 0, y: 0, active: false };

    /** Rasterize the ghost's text offscreen and grid-sample dot homes. */
    const sample = () => {
      const w = ghost.offsetWidth;
      const h = ghost.offsetHeight;
      if (w < 4 || h < 4) return null;
      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
      const off = document.createElement("canvas");
      off.width = Math.ceil(w * dpr);
      off.height = Math.ceil(h * dpr);
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return null;

      const cs = getComputedStyle(ghost);
      const fontSize = parseFloat(cs.fontSize) || 96;
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      octx.textBaseline = "alphabetic";
      octx.textAlign = "left";
      octx.fillStyle = "#000";
      const ls = parseFloat(cs.letterSpacing) || 0;
      const spacingCtx = octx as CanvasRenderingContext2D & { letterSpacing?: string };
      const hasLs = typeof spacingCtx.letterSpacing === "string";
      if (hasLs) spacingCtx.letterSpacing = `${ls}px`;

      // Single line — the whole name on one row, centered like the ghost.
      const lines = [text];
      const lineCount = Math.max(1, lines.length);
      const lineH = h / lineCount;
      const m0 = octx.measureText(text);
      const ascent = m0.fontBoundingBoxAscent ?? fontSize * 0.8;
      const descent = m0.fontBoundingBoxDescent ?? fontSize * 0.2;

      let drawnW = 0;
      lines.forEach((line, li) => {
        const baseline = li * lineH + (lineH - (ascent + descent)) / 2 + ascent;
        if (hasLs) {
          octx.textAlign = "center";
          octx.fillText(line, w / 2, baseline);
          drawnW = Math.max(drawnW, octx.measureText(line).width);
        } else {
          // Manual per-char advance + centering when letterSpacing is off.
          let lineW = -ls;
          for (const ch of line) lineW += octx.measureText(ch).width + ls;
          drawnW = Math.max(drawnW, lineW);
          octx.textAlign = "left";
          let x = (w - lineW) / 2;
          for (const ch of line) {
            octx.fillText(ch, x, baseline);
            x += octx.measureText(ch).width + ls;
          }
        }
      });
      // Sanity: if the pixel face didn't actually apply, the raster won't
      // match the ghost — keep the plain text instead of wrong dots.
      if (!drawnW || Math.abs(drawnW - w) > w * 0.3) return null;

      let img: Uint8ClampedArray;
      try {
        img = octx.getImageData(0, 0, off.width, off.height).data;
      } catch {
        return null;
      }

      const collect = (gap: number) => {
        const pts: number[] = [];
        for (let gy = gap / 2; gy < h; gy += gap) {
          const row = Math.min(off.height - 1, Math.round(gy * dpr)) * off.width;
          for (let gx = gap / 2; gx < w; gx += gap) {
            const px = Math.min(off.width - 1, Math.round(gx * dpr));
            if (img[(row + px) * 4 + 3] > 128) pts.push(gx, gy);
          }
        }
        return pts;
      };

      // Adapt the grid toward the particle budget (desktop lands in
      // 1200–2200; small mobile sizes bottom out at the gap floor → fewer).
      let gap = BASE_GAP;
      let pts = collect(gap);
      const n0 = pts.length / 2;
      if (n0 > 0 && (n0 < COUNT_MIN || n0 > COUNT_MAX)) {
        const adjusted = Math.min(8, Math.max(2.25, gap * Math.sqrt(n0 / TARGET_COUNT)));
        if (Math.abs(adjusted - gap) > 0.3) {
          gap = adjusted;
          pts = collect(gap);
        }
      }
      if (pts.length < 16) return null;

      ink = parseColor(cs.color, ink);
      pink = parseColor(cs.getPropertyValue("--accent-pink"), pink);
      inkStyle = `rgb(${ink[0]},${ink[1]},${ink[2]})`;
      return { pts, gap, w, h, dpr };
    };

    /** Install a sample: rebuild particles and (re)size the visible canvas. */
    const applySample = (s: NonNullable<ReturnType<typeof sample>>, scatter: boolean) => {
      boxW = s.w;
      boxH = s.h;
      dotR = s.gap * 0.58;
      count = s.pts.length / 2;
      data = new Float32Array(count * STRIDE);
      for (let i = 0; i < count; i++) {
        const o = i * STRIDE;
        const hx = s.pts[i * 2];
        const hy = s.pts[i * 2 + 1];
        data[o] = hx;
        data[o + 1] = hy;
        // First paint materializes from tiny (~6px) random offsets.
        data[o + 2] = scatter ? hx + (Math.random() - 0.5) * 12 : hx;
        data[o + 3] = scatter ? hy + (Math.random() - 0.5) * 12 : hy;
      }
      const cssW = s.w + PAD * 2;
      const cssH = s.h + PAD * 2;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.ceil(cssW * s.dpr);
      canvas.height = Math.ceil(cssH * s.dpr);
      // Draw in ghost-box coordinates; PAD is baked into the transform.
      ctx.setTransform(s.dpr, 0, 0, s.dpr, PAD * s.dpr, PAD * s.dpr);
    };

    const draw = () => {
      ctx.clearRect(-PAD, -PAD, boxW + PAD * 2, boxH + PAD * 2);
      // Cold (ink) dots batched into one path; hot ones tinted individually.
      hot.length = 0;
      ctx.fillStyle = inkStyle;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const o = i * STRIDE;
        if (data[o + 6] > 0) {
          hot.push(i);
          continue;
        }
        const x = data[o + 2];
        const y = data[o + 3];
        ctx.moveTo(x + dotR, y);
        ctx.arc(x, y, dotR, 0, TAU);
      }
      ctx.fill();
      for (const i of hot) {
        const o = i * STRIDE;
        const t = data[o + 6];
        ctx.fillStyle = `rgb(${Math.round(ink[0] + (pink[0] - ink[0]) * t)},${Math.round(
          ink[1] + (pink[1] - ink[1]) * t
        )},${Math.round(ink[2] + (pink[2] - ink[2]) * t)})`;
        ctx.beginPath();
        ctx.arc(data[o + 2], data[o + 3], dotR, 0, TAU);
        ctx.fill();
      }
    };

    const R2 = REPEL_RADIUS * REPEL_RADIUS;
    /** One physics step; returns true when everything is settled and cool. */
    const stepPhysics = () => {
      let calm = true;
      const act = pointer.active;
      const px = pointer.x;
      const py = pointer.y;
      for (let i = 0; i < count; i++) {
        const o = i * STRIDE;
        let x = data[o + 2];
        let y = data[o + 3];
        let vx = data[o + 4];
        let vy = data[o + 5];
        let heat = data[o + 6];
        if (act) {
          const dx = x - px;
          const dy = y - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.0001) {
            const d = Math.sqrt(d2);
            const s = 1 - d / REPEL_RADIUS;
            const f = (s * s * REPEL_FORCE) / d;
            vx += dx * f;
            vy += dy * f;
            if (d < HEAT_RADIUS) heat = 1;
          }
        }
        const hx = data[o];
        const hy = data[o + 1];
        vx = (vx + (hx - x) * SPRING_K) * DAMPING;
        vy = (vy + (hy - y) * SPRING_K) * DAMPING;
        x += vx;
        y += vy;
        heat *= HEAT_DECAY;
        if (heat < 0.02) heat = 0;
        data[o + 2] = x;
        data[o + 3] = y;
        data[o + 4] = vx;
        data[o + 5] = vy;
        data[o + 6] = heat;
        if (calm) {
          const ex = x - hx;
          const ey = y - hy;
          if (ex * ex + ey * ey > 0.09 || vx * vx + vy * vy > 0.0036 || heat > 0) calm = false;
        }
      }
      return calm;
    };

    /* ---- the single rAF loop (fixed timestep, parks when settled) ---- */
    let last = 0;
    let acc = 0;
    const loop = (now: number) => {
      raf = 0;
      if (disposed) return;
      acc += Math.min(now - last, 100);
      last = now;
      let ran = false;
      let calm = false;
      for (let n = 0; acc >= STEP_MS && n < 4; n++) {
        calm = stepPhysics();
        acc -= STEP_MS;
        ran = true;
      }
      if (acc >= STEP_MS) acc = 0; // drop backlog after a long tab-away
      if (ran) draw();
      if (ran && calm && !pointer.active) {
        // Park: snap to home, paint the final assembled frame, stop.
        for (let i = 0; i < count; i++) {
          const o = i * STRIDE;
          data[o + 2] = data[o];
          data[o + 3] = data[o + 1];
          data[o + 4] = 0;
          data[o + 5] = 0;
          data[o + 6] = 0;
        }
        draw();
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const ensureLoop = () => {
      if (raf || disposed) return;
      last = performance.now();
      acc = STEP_MS; // guarantee a physics step on the first frame
      raf = requestAnimationFrame(loop);
    };

    /* ---- interaction (listeners live on the text-box wrapper) ---- */

    /** Pointer position in ghost-box coords. offsetX/Y are local-space, so
     *  they stay exact under the card's rotation; the rect fallback only
     *  covers exotic targets and is within ~1px at the card's -1deg tilt. */
    const localPoint = (e: PointerEvent): [number, number] => {
      const t = e.target;
      if (t === wrap || t === ghost) return [e.offsetX, e.offsetY];
      const r = wrap.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // no hover on touch
      const [x, y] = localPoint(e);
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
      ensureLoop();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const [x, y] = localPoint(e);
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
      ensureLoop();
    };
    const onPointerOut = () => {
      pointer.active = false; // loop keeps running until dots heal, then parks
    };
    const onPointerDown = (e: PointerEvent) => {
      // Tap/click burst — works for touch too. Passive listener, no
      // preventDefault: scrolling is never hijacked.
      const [cx, cy] = localPoint(e);
      for (let i = 0; i < count; i++) {
        const o = i * STRIDE;
        const dx = data[o + 2] - cx;
        const dy = data[o + 3] - cy;
        const d = Math.hypot(dx, dy);
        const a = d > 0.5 ? Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5 : Math.random() * TAU;
        const imp = 5 + Math.random() * 9;
        data[o + 4] += Math.cos(a) * imp;
        data[o + 5] += Math.sin(a) * imp;
      }
      ensureLoop();
    };

    const listen = (type: string, fn: (e: PointerEvent) => void) => {
      wrap.addEventListener(type, fn as EventListener, { passive: true });
      teardowns.push(() => wrap.removeEventListener(type, fn as EventListener));
    };

    const restoreText = () => {
      ghost.style.visibility = "";
      count = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    /** Debounced re-sample (resize / font-size clamp changes). */
    const resample = () => {
      if (disposed) return;
      const s = sample();
      if (!s) {
        restoreText();
        return;
      }
      applySample(s, false);
      ghost.style.visibility = "hidden";
      draw();
      if (pointer.active) ensureLoop();
    };

    /** First activation: sample, paint the assembled frame, THEN hide the
     *  ghost (same task — no flicker), and settle the materialize scatter. */
    const activate = () => {
      if (disposed) return;
      const s = sample();
      if (!s) return; // keep the plain text
      applySample(s, true);
      draw();
      ghost.style.visibility = "hidden";

      listen("pointerenter", onPointerEnter);
      listen("pointermove", onPointerMove);
      listen("pointerleave", onPointerOut);
      listen("pointercancel", onPointerOut);
      listen("pointerdown", onPointerDown);

      let firstObservation = true;
      ro = new ResizeObserver(() => {
        if (firstObservation) {
          firstObservation = false; // observe() fires once immediately
          return;
        }
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resample, 150);
      });
      ro.observe(ghost);

      ensureLoop();
    };

    // Gate on the actual pixel face: sample only once document.fonts has
    // it. If it never loads (or the spec can't parse), the text stays.
    const cs = getComputedStyle(ghost);
    const fontSpec = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    (async () => {
      try {
        await document.fonts.load(fontSpec, text);
      } catch {
        return;
      }
      if (disposed) return;
      let ok = false;
      try {
        ok = document.fonts.check(fontSpec, text);
      } catch {
        ok = false;
      }
      if (ok) activate();
    })();

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(resizeTimer);
      ro?.disconnect();
      teardowns.forEach((fn) => fn());
      ghost.style.visibility = "";
    };
  }, [enabled, name]);

  return (
    <div
      ref={wrapRef}
      data-hide-cursor="true"
      className={["relative", className].filter(Boolean).join(" ")}
    >
      <h1 className="sr-only pointer-events-none">{name}</h1>
      {/* Layout ghost: the real text sizes the card (SSR + no-canvas states
          show it; it flips to visibility:hidden once the canvas paints). */}
      <p
        ref={ghostRef}
        aria-hidden="true"
        data-hide-cursor="true"
        className="font-pixel block whitespace-nowrap text-center uppercase text-[clamp(3rem,11.5vw,7.75rem)] leading-[0.8] tracking-[-0.05em] text-[var(--ink)]"
      >
        {name.trim()}
      </p>
      {enabled && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          data-hide-cursor="true"
          className="pointer-events-none absolute"
          style={{ left: -PAD, top: -PAD }}
        />
      )}
    </div>
  );
}

export default NameInk;
