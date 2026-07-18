"use client";

import { useEffect, useState } from "react";
import type { GuestbookEntry } from "@/server/guestbookStore";
import { setPerson, track } from "@/lib/analytics";
import GuestbookForm, { type GuestbookAuthView, type SubmitResult } from "./GuestbookForm";

export interface GuestbookBoardProps {
  /** First paint comes from the server component reading the store directly. */
  initialEntries: GuestbookEntry[];
  /** Serializable auth snapshot resolved by the server component. */
  auth: GuestbookAuthView;
}

/** Accent washes cycled across the note cards (pastels take a stronger
 *  tint than vivid pink so every card stays a readable backdrop for ink). */
const CARD_WASHES = [
  { pin: "var(--accent-mint)", wash: "color-mix(in srgb, var(--accent-mint) 32%, var(--card))" },
  { pin: "var(--accent-cream)", wash: "color-mix(in srgb, var(--accent-cream) 45%, var(--card))" },
  { pin: "var(--accent-yellow)", wash: "color-mix(in srgb, var(--accent-yellow) 24%, var(--card))" },
  { pin: "var(--accent-blue)", wash: "color-mix(in srgb, var(--accent-blue) 26%, var(--card))" },
  { pin: "var(--accent-pink)", wash: "color-mix(in srgb, var(--accent-pink) 12%, var(--card))" },
] as const;

/** Deterministic tilt cycle — derived from index, identical on server and
 *  client, so hydration never disagrees about a card's rotation. */
const TILTS = [-2.1, 1.6, -1.1, 2.3, -1.7, 1.2] as const;

/** Fixed locale + UTC keeps the rendered date identical between the server
 *  pass and hydration regardless of machine settings. */
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? "—" : DATE_FORMAT.format(time);
}

function VisitorNote({ entry, index }: { entry: GuestbookEntry; index: number }) {
  const palette = CARD_WASHES[index % CARD_WASHES.length];
  const tilt = TILTS[index % TILTS.length];
  const pending = entry.id.startsWith("pending-");
  return (
    <li
      className="gb-note relative rounded-[2px] px-4 pb-3.5 pt-5"
      style={{
        background: palette.wash,
        ["--gb-tilt" as string]: `${tilt}deg`,
        opacity: pending ? 0.65 : undefined,
      }}
    >
      {/* Glossy pushpin — same treatment as the footer's pinned scrap. */}
      <span
        aria-hidden="true"
        className="absolute -top-1.5 left-1/2 z-10 block h-3.5 w-3.5 -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 30%, rgba(255, 255, 255, 0.9), ${palette.pin} 45%, color-mix(in srgb, ${palette.pin} 65%, var(--ink)) 100%)`,
          boxShadow: "0 1px 1px rgba(22, 22, 22, 0.45)",
        }}
      />
      {/* User-generated content rendered strictly as React text nodes. */}
      <p className="font-hand text-[22px] leading-[1.15] text-[var(--ink)]">{entry.message}</p>
      <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/75">
        {entry.avatar ? (
          // Decorative account avatar on signed entries; plain <img> since
          // provider avatar hosts vary and the thumbnail is tiny.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.avatar}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-5 w-5 rounded-full border border-[var(--ink)] object-cover"
          />
        ) : null}
        <span>— {entry.name}</span>
        <span className="font-normal text-[var(--ink)]/55">
          {pending ? "pinning…" : formatDate(entry.createdAt)}
        </span>
      </p>
    </li>
  );
}

/**
 * Visitor log: a pinboard of tilted note cards plus the sticky-note corner
 * (form, sign-in chips, or signed-in note depending on the auth snapshot).
 * Entries arrive from the server component for first paint; new signatures
 * are appended optimistically (a translucent "pinning…" card) and either
 * swapped for the stored entry on 201 or rolled back with an inline error.
 */
export function GuestbookBoard({ initialEntries, auth }: GuestbookBoardProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);

  // Link the analytics person to the signed-in guestbook identity (no-op
  // unless analytics is configured).
  useEffect(() => {
    if (auth.mode === "signed-in") {
      setPerson({ guestbook_name: auth.name });
    }
  }, [auth]);

  async function submit(input: {
    name: string;
    message: string;
    website: string;
  }): Promise<SubmitResult> {
    const signedIn = auth.mode === "signed-in";
    const tempId = `pending-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic: GuestbookEntry = {
      id: tempId,
      name: input.name,
      message: input.message,
      createdAt: new Date().toISOString(),
      avatar: signedIn && auth.image ? auth.image : undefined,
    };
    setEntries((prev) => [optimistic, ...prev]);

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Signed-in posts carry no name — the API takes identity from the
        // session and ignores client-sent names anyway.
        body: JSON.stringify(
          signedIn ? { message: input.message, website: input.website } : input
        ),
      });
      if (res.ok) {
        const data = (await res.json()) as { entry: GuestbookEntry };
        setEntries((prev) => prev.map((e) => (e.id === tempId ? data.entry : e)));
        track("guestbook_note_pinned", { signed_in: signedIn });
        return { ok: true };
      }
      // Rollback: pull the optimistic card back off the board.
      setEntries((prev) => prev.filter((e) => e.id !== tempId));
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      return {
        ok: false,
        error:
          data?.error ??
          (res.status === 429
            ? "The ink is still drying — try again in a moment."
            : "That didn't stick. Please try again."),
      };
    } catch {
      setEntries((prev) => prev.filter((e) => e.id !== tempId));
      return { ok: false, error: "Couldn't reach the desk — check your connection and retry." };
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:items-start">
      {/* Notes hang from their pushpin: origin at the pin (top-center), a
          soft resting shadow, and on hover they lift and swing to the other
          side of the pin with a springy overshoot — a pendulum settle. */}
      <style>{`
        .gb-note {
          transform-origin: top center;
          rotate: var(--gb-tilt);
          translate: 0 0;
          scale: 1;
          box-shadow: 0 1px 2px rgba(22,22,22,0.12), 0 7px 14px rgba(22,22,22,0.1);
          transition: rotate 0.5s cubic-bezier(0.34,1.56,0.64,1),
                      translate 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      scale 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.3s ease-out;
          will-change: transform;
        }
        @media (hover: hover) {
          .gb-note:hover {
            rotate: calc(var(--gb-tilt) * -0.5);
            translate: 0 -8px;
            scale: 1.04;
            box-shadow: 0 3px 6px rgba(22,22,22,0.14), 0 18px 34px rgba(22,22,22,0.2);
            z-index: 5;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .gb-note { transition: box-shadow 0.2s ease-out; }
          .gb-note:hover { rotate: var(--gb-tilt); translate: 0 0; scale: 1; }
        }
      `}</style>
      <GuestbookForm auth={auth} onSubmit={submit} />
      {entries.length === 0 ? (
        <p className="font-hand text-2xl text-[var(--ink)]/70">
          Nothing pinned yet — the first note is yours.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-5 gap-y-7 pt-2 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry, index) => (
            <VisitorNote key={entry.id} entry={entry} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default GuestbookBoard;
