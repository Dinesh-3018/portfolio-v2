"use client";

import { useEffect, useState } from "react";

/**
 * Live IST wall clock atop the hero: small letterspaced mono in ink-soft,
 * "HH:MM:SS IST" (24h, Asia/Kolkata). The server renders a static
 * placeholder; the real time populates after mount (no hydration
 * mismatch) and ticks every second with interval cleanup.
 */
export function HeroClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className="font-mono text-xs font-semibold uppercase tracking-[0.35em] text-[var(--ink-soft)] sm:text-sm">
      {time ?? "--:--:--"} IST
    </p>
  );
}

export default HeroClock;
