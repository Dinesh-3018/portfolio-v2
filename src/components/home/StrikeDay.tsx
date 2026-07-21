"use client";

import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

/** Cached per local date so the store snapshot stays referentially stable. */
let cached: { key: string; days: number } | null = null;

function daysSince(sinceIso: string): number {
  const key = new Date().toDateString() + sinceIso;
  if (!cached || cached.key !== key) {
    const start = new Date(`${sinceIso}T00:00:00`);
    const diff = Math.floor((Date.now() - start.getTime()) / 86_400_000);
    // Day 1 is the start date itself.
    cached = { key, days: Math.max(1, diff + 1) };
  }
  return cached.days;
}

/**
 * Running day count of the hunger strike, computed in the visitor's browser
 * so the statically-generated page never goes stale. Server renders "—"
 * (no hydration mismatch); the real number lands on mount.
 */
export default function StrikeDay({ since }: { since: string }) {
  const days = useSyncExternalStore(
    subscribeNoop,
    () => daysSince(since),
    () => null
  );
  return <>{days ?? "—"}</>;
}
