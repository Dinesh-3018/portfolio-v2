"use client";

import { useEffect } from "react";

/**
 * rAF-throttled mousemove follower. Tracks the pointer inside `containerRef`
 * and applies a translate3d transform to `targetRef` (coordinates are
 * relative to the container's top-left corner).
 */
export function useFollower(
  containerRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      raf = 0;
      const target = targetRef.current;
      if (target) {
        target.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    container.addEventListener("mousemove", onMove);
    return () => {
      container.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [containerRef, targetRef]);
}

export default useFollower;
