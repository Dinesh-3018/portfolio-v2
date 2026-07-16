"use client";

import { useEffect, useRef } from "react";
import { isTouchDevice, prefersReducedMotion } from "@/lib/media";

export interface PostcardTiltProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum tilt toward the pointer, in degrees. */
  maxTilt?: number;
}

/**
 * Pointer-tracking 3D tilt for the contact postcard. The children render
 * statically on the server (and stay static until mount); after mount, and
 * only on hover-capable pointers without reduced motion, the card leans
 * toward the cursor (rotateX/rotateY capped at `maxTilt`, ~1000px
 * perspective). A single rAF loop lerps toward the target, which doubles
 * as the smooth ~400ms return to flat on pointer leave; the loop parks
 * itself once settled so nothing runs while idle.
 */
export function PostcardTilt({ children, className, maxTilt = 4 }: PostcardTiltProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const card = cardRef.current;
    if (!frame || !card) return;
    // Capability gates: no tilt on touch devices or under reduced motion.
    if (isTouchDevice() || prefersReducedMotion()) return;

    let raf = 0;
    let running = false;
    // Rect cached on entry so the tilted card's transformed bounding box
    // never feeds back into its own pointer math.
    let rect: DOMRect | null = null;
    let targetX = 0; // rotateX target (deg)
    let targetY = 0; // rotateY target (deg)
    let rx = 0;
    let ry = 0;

    card.style.willChange = "transform";

    const loop = () => {
      // ~0.18/frame closes the gap in roughly 400ms at 60fps.
      rx += (targetX - rx) * 0.18;
      ry += (targetY - ry) * 0.18;
      if (targetX === 0 && targetY === 0 && Math.abs(rx) < 0.02 && Math.abs(ry) < 0.02) {
        rx = 0;
        ry = 0;
        card.style.transform = "";
        running = false;
        return;
      }
      card.style.transform = `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
      raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      rect = frame.getBoundingClientRect();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // hybrid screens: fingers don't tilt
      if (!rect) rect = frame.getBoundingClientRect();
      const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1);
      const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetY = nx * maxTilt; // pointer right -> right edge dips away
      targetX = -ny * maxTilt; // pointer down -> bottom edge dips away
      wake();
    };

    const onLeave = () => {
      rect = null;
      targetX = 0;
      targetY = 0;
      wake();
    };

    frame.addEventListener("pointerenter", onEnter);
    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      frame.removeEventListener("pointerenter", onEnter);
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
      card.style.willChange = "";
      card.style.transform = "";
    };
  }, [maxTilt]);

  return (
    <div ref={frameRef} className={className} style={{ perspective: "1000px" }}>
      <div ref={cardRef} style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}

export default PostcardTilt;
