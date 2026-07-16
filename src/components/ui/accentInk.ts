import type { Accent } from "@/data/types";
import { ACCENT } from "@/data/site";

/**
 * Text-safe companion to `ACCENT`: use this map whenever an accent inks
 * FOREGROUND detail (stamp text/rings, handwritten notes) on `--paper` or
 * `--card`. The pastel swatches (blue, green, mint, cream, yellow) and the
 * vivid pink/orange are unreadable as small ink (1.4–4.3:1 against `--card`),
 * so they remap to dark relatives that clear 4.5:1 on both `--card` #faf9f5
 * and `--paper` #f5f2ea; brown passes through unchanged.
 *
 * Backgrounds, washes (`color-mix ... 14%`), and decorative fills should
 * keep using `ACCENT` directly.
 *
 * Ratios (WCAG, on card / paper):
 *   pink   #b02649 — 6.19 / 5.83
 *   blue   #1c6f96 — 5.30 / 4.99
 *   yellow #7a5a1f — 6.02 / 5.67
 *   green  #2f7c52 — 4.83 / 4.55
 *   mint   #2f7c52 — 4.83 / 4.55
 *   cream  #6b4f2a — 7.18 / 6.76
 *   brown  #45261c — 12.88 / 12.13
 *   orange #b34a00 — 5.12 / 4.82
 */
export const ACCENT_INK: Record<Accent, string> = {
  blue: "#1c6f96", // deep sky ink — pastel #5fbee6 is 2.0:1
  pink: "#b02649", // darkened raspberry — base #d8365d is 4.3:1
  yellow: "#7a5a1f", // bronze — base #e3a92f is 1.8:1
  green: "#2f7c52", // forest — base #5fb57f is 2.1:1
  mint: "#2f7c52", // forest stands in for mint — mint itself is 1.4:1
  cream: "#6b4f2a", // walnut stands in for cream — cream itself is 1.2:1
  brown: ACCENT.brown, // #45261c — near-ink, passes as-is
  orange: "#b34a00", // burnt orange — base #fe6e00 is 2.6:1
};

export default ACCENT_INK;
