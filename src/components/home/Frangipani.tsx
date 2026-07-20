"use client";

import { useRef } from "react";
import { prefersReducedMotion } from "@/lib/media";

/** Petal angles: five-fold pinwheel. Each petal also carries its index for
 *  the staggered entrance bloom. */
const PETALS = [0, 72, 144, 216, 288];

/** One plumeria petal, pointing up from the flower's center (0,0): an
 *  asymmetric obovate blade so the five copies overlap pinwheel-style. */
const PETAL_PATH =
  "M 0 -3 C -12 -6 -22 -22 -20 -38 C -18.5 -50 -8 -58 3 -55 C 14 -52 19 -40 16 -27 C 13.5 -15 8 -6 0 -3 Z";

/**
 * FRANGIPANI: a five-petal plumeria resting on the desk — the song, and the
 * story's "five corners, a white heart" made visible. Pure SVG + CSS, no 3D
 * library:
 *  - petals bloom in one-by-one when the hero reveals,
 *  - the whole flower tilts in 3D toward the cursor (perspective transform),
 *  - hover fans the petals open and lifts it off its shadow,
 *  - click (or Enter) pinwheels it 144° with a springy settle.
 * Decorative-but-focusable; reduced motion collapses everything to static.
 */
export function Frangipani({ className }: { className?: string }) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const turns = useRef(0);

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (prefersReducedMotion() || e.pointerType === "touch") return;
    const el = tiltRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));
    el.style.transform = `perspective(650px) rotateX(${(-dy * 14).toFixed(2)}deg) rotateY(${(dx * 14).toFixed(2)}deg)`;
  }

  function onPointerLeave() {
    const el = tiltRef.current;
    if (el) el.style.transform = "perspective(650px) rotateX(0deg) rotateY(0deg)";
  }

  function spin() {
    turns.current += 144;
    const el = spinRef.current;
    if (el) el.style.transform = `rotate(${turns.current}deg)`;
  }

  return (
    <>
      {/* Hoisted OUTSIDE the button: <style> isn't phrasing content, so the
          HTML parser would eject it from inside a <button> during SSR. */}
      <style>{`
        .fp-tilt { transition: transform 200ms ease-out; will-change: transform; height: 100%; }
        .fp-spin { transition: transform 900ms cubic-bezier(0.34,1.56,0.64,1), translate 350ms cubic-bezier(0.34,1.56,0.64,1); height: 100%; }
        .fp-root:hover .fp-spin { translate: 0 -6px; }
        .fp-sway { display: block; width: 100%; height: 100%; animation: fp-sway 7s ease-in-out infinite; transform-origin: 50% 50%; }
        @keyframes fp-sway { 0%, 100% { rotate: -2.4deg; } 50% { rotate: 2.4deg; } }
        .fp-petal {
          transform: rotate(var(--a));
          transform-box: view-box; transform-origin: 50% 50%;
          transition: transform 550ms cubic-bezier(0.34,1.56,0.64,1);
          transition-delay: calc(var(--i) * 45ms);
        }
        .fp-root:hover .fp-petal, .fp-root:focus-visible .fp-petal {
          transform: rotate(calc(var(--a) + 3deg)) scale(1.08);
        }
        /* Entrance: petals bloom one-by-one once the hero's Reveal fires. */
        .animate-fade-in-up .fp-petal {
          animation: fp-bloom 0.65s cubic-bezier(0.34,1.56,0.64,1) backwards;
          animation-delay: calc(0.55s + var(--i) * 90ms);
        }
        @keyframes fp-bloom {
          from { transform: rotate(calc(var(--a) - 50deg)) scale(0); opacity: 0; }
          to { transform: rotate(var(--a)) scale(1); opacity: 1; }
        }
        .fp-shadow { transition: transform 350ms ease-out, opacity 350ms ease-out; }
        .fp-root:hover .fp-shadow { transform: translateX(-50%) scale(0.88); opacity: 0.7; }
        @media (prefers-reduced-motion: reduce) {
          .fp-sway { animation: none; }
          .fp-tilt, .fp-spin, .fp-petal, .fp-shadow { transition: none; }
          .animate-fade-in-up .fp-petal { animation: none; }
          .fp-root:hover .fp-petal { transform: rotate(var(--a)); }
          .fp-root:hover .fp-spin { translate: 0 0; }
        }
      `}</style>

      <button
        type="button"
        onClick={spin}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        aria-label="A frangipani flower — give it a spin"
        data-hide-cursor="true"
        className={[
          "fp-root group relative block rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-pink)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
      {/* Resting shadow on the desk. */}
      <span
        aria-hidden="true"
        className="fp-shadow pointer-events-none absolute bottom-0 left-1/2 h-3.5 w-3/5 -translate-x-1/2"
        style={{
          background: "radial-gradient(closest-side, rgba(22,22,22,0.26), transparent 72%)",
        }}
      />

      <div ref={tiltRef} className="fp-tilt">
        <div ref={spinRef} className="fp-spin">
          {/* viewBox starts at 0,0 (not -64,-64) so the CSS transform-origin
              of 50% 50% / 64px 64px lands on the flower center under every
              browser interpretation; geometry is translated to (64,64). */}
          <svg viewBox="0 0 128 128" className="fp-sway" aria-hidden="true">
            <defs>
              <radialGradient id="fp-petal-grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="58">
                <stop offset="0%" stopColor="#ecbd52" />
                <stop offset="20%" stopColor="#f4dc9d" />
                <stop offset="46%" stopColor="#fbf6e8" />
                <stop offset="100%" stopColor="#fffefb" />
              </radialGradient>
              <radialGradient id="fp-core-grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="9">
                <stop offset="0%" stopColor="#e9b23c" />
                <stop offset="100%" stopColor="#d29018" />
              </radialGradient>
            </defs>
            {PETALS.map((angle, i) => (
              <g
                key={angle}
                className="fp-petal"
                style={{ "--a": `${angle}deg`, "--i": i } as React.CSSProperties}
              >
                <path
                  d={PETAL_PATH}
                  transform="translate(64 64)"
                  fill="url(#fp-petal-grad)"
                  stroke="rgba(22,22,22,0.20)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </g>
            ))}
            <circle
              r="5.5"
              transform="translate(64 64)"
              fill="url(#fp-core-grad)"
              stroke="rgba(22,22,22,0.25)"
              strokeWidth="0.8"
            />
          </svg>
        </div>
      </div>
      </button>
    </>
  );
}

export default Frangipani;
