"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectImage } from "@/data/types";
import { useLenis } from "@/lib/LenisProvider";

export interface LightboxProps {
  images: ProjectImage[];
  initialIndex: number;
  onClose: () => void;
}

type Motion = "zoom" | "next" | "prev";

const MOTION_CLASS: Record<Motion, string> = {
  zoom: "animate-lightbox-zoom",
  next: "animate-lightbox-snap-next",
  prev: "animate-lightbox-snap-prev",
};

/**
 * Full-screen gallery overlay. Zooms in on open, snaps between images on
 * prev/next (re-keying the frame so the keyframes replay), closes on
 * Escape or backdrop click, navigates with arrow keys, and pauses Lenis
 * smooth scrolling while open.
 */
export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [motion, setMotion] = useState<Motion>("zoom");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lenis = useLenis();

  const count = images.length;

  const goTo = useCallback(
    (step: 1 | -1) => {
      setCurrent((i) => (i + step + count) % count);
      setMotion(step === 1 ? "next" : "prev");
    },
    [count]
  );

  // Pause smooth scroll and lock the page while the overlay is open.
  useEffect(() => {
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [lenis]);

  // Basic focus management: move focus into the dialog, restore on close.
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    return () => previous?.focus();
  }, []);

  // Escape closes, arrow keys navigate, Tab cycles within the dialog.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(-1);
      } else if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = Array.from(root.querySelectorAll<HTMLElement>("button"));
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === root)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, onClose]);

  const image = images[current];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      tabIndex={-1}
      className="fixed inset-0 z-[200] flex items-center justify-center px-5 outline-none sm:px-10"
    >
      {/* Backdrop: click anywhere outside the frame to close. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--ink)]/90 [@media(hover:hover)]:cursor-zoom-out"
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center border-2 border-[var(--paper)] font-mono text-lg text-[var(--paper)] transition-colors hover:bg-[var(--paper)] hover:text-[var(--ink)]"
      >
        ✕
      </button>

      <div className="relative z-10 w-full max-w-5xl">
        <div key={`${current}-${motion}`} className={MOTION_CLASS[motion]}>
          {/* Paper mat: hairline paper-toned frame around a 6px card mount. */}
          <div className="border border-[var(--paper)] bg-[var(--card)] p-1.5">
            <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 64rem, 92vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-4">
          <p className="min-w-0 truncate font-mono text-xs tracking-[0.12em] text-[var(--paper)]/80">
            {image.alt.toUpperCase()}
          </p>
          <div className="flex items-center gap-4">
            <p className="font-mono text-xs tracking-[0.12em] text-[var(--paper)]/80">
              {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
            {count > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTo(-1)}
                  aria-label="Previous image"
                  className="flex h-11 w-11 items-center justify-center border-2 border-[var(--paper)] font-mono text-lg text-[var(--paper)] transition-colors hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  aria-label="Next image"
                  className="flex h-11 w-11 items-center justify-center border-2 border-[var(--paper)] font-mono text-lg text-[var(--paper)] transition-colors hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                >
                  →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lightbox;
