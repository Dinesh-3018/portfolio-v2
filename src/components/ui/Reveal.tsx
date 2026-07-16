"use client";

import { useSyncExternalStore } from "react";
import { useReveal } from "@/lib/useReveal";

const subscribeNoop = () => () => {};

export interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const DELAY_CLASS: Record<number, string> = {
  1: "animate-fade-in-up-delay-1",
  2: "animate-fade-in-up-delay-2",
  3: "animate-fade-in-up-delay-3",
  4: "animate-fade-in-up-delay-4",
  5: "animate-fade-in-up-delay-5",
  6: "animate-fade-in-up-delay-6",
};

/**
 * Scroll reveal wrapper. SSR-safe: the server render is fully visible;
 * `opacity-0` is only applied on the client before intersection, then the
 * fade-in-up animation plays once (optionally staggered via `delay` 1-6).
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  // false on the server render, true once hydrated on the client.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  const animationClass = inView ? (DELAY_CLASS[delay] ?? "animate-fade-in-up") : "";
  const hiddenClass = mounted && !inView ? "opacity-0" : "";

  return (
    <div ref={ref} className={[className, hiddenClass, animationClass].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export default Reveal;
