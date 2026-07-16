"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState } from "react";
import { prefersReducedMotion } from "./media";

const LenisContext = createContext<Lenis | null>(null);

/** Returns the active Lenis instance, or null when smooth scroll is disabled. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const instance = new Lenis({ autoRaf: true });
    // Mirrors the just-created external Lenis instance into context state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export default LenisProvider;
