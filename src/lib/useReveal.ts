"use client";

import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver reveal hook.
 *
 * SSR-safe: `inView` starts false, but the server render should be styled
 * visible — only apply `opacity-0` client-side pre-intersection (see the
 * `Reveal` component). Unobserves after the first intersection.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(): {
  ref: React.RefObject<T | null>;
  inView: boolean;
} {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No observer support: reveal immediately rather than hiding content.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export default useReveal;
