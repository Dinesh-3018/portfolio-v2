"use client";

import { useEffect, useState } from "react";
import StampBadge from "@/components/ui/StampBadge";
import HandwrittenNote from "@/components/ui/HandwrittenNote";
import UnderlineLink from "@/components/ui/UnderlineLink";
import { ACCENT_INK } from "@/components/ui/accentInk";

interface ApiTrack {
  title: string;
  artists: string;
  album: string;
  art: string | null;
  url: string | null;
}

type TurntableState =
  | { kind: "loading" }
  | { kind: "unplugged" } // not configured, upstream error, or no listening history
  | { kind: "ready"; nowPlaying: boolean; track: ApiTrack };

/** Spin + reduced-motion rules for the disc; scoped by the .tt-disc class. */
const DISC_CSS = `
@keyframes tt-spin {
  to { transform: rotate(360deg); }
}
.tt-disc {
  animation: tt-spin 3.6s linear infinite;
  animation-play-state: paused;
}
.tt-disc[data-spinning="true"] {
  animation-play-state: running;
}
@media (prefers-reduced-motion: reduce) {
  .tt-disc,
  .tt-disc[data-spinning="true"] {
    animation: none;
  }
}
`;

/** The record itself: ink platter, groove rings, pink centre label. */
function VinylDisc({ spinning }: { spinning: boolean }) {
  return (
    <div
      className="tt-disc relative h-full w-full rounded-full shadow-[2px_2px_0_rgba(22,22,22,0.25)]"
      data-spinning={spinning ? "true" : "false"}
      style={{
        background:
          "repeating-radial-gradient(circle at 50% 50%, transparent 0 3px, rgba(250, 249, 245, 0.13) 3px 4px), var(--ink)",
      }}
    >
      <span className="absolute inset-[31%] rounded-full border border-[rgba(22,22,22,0.35)] bg-[var(--accent-pink)]">
        {/* Off-centre fleck so the spin actually reads. */}
        <span className="absolute left-1/2 top-[16%] h-1 w-1 -translate-x-1/2 rounded-full bg-[rgba(250,249,245,0.75)]" />
        {/* Spindle hole. */}
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--card)]" />
      </span>
    </div>
  );
}

/** Placeholder platter for the unplugged/error sleeve: just a dashed outline. */
function EmptyDisc() {
  return (
    <div className="h-full w-full rounded-full border-2 border-dashed border-[color-mix(in_srgb,var(--ink)_45%,transparent)]">
      <span className="absolute inset-[38%] rounded-full border-[1.5px] border-dashed border-[color-mix(in_srgb,var(--ink)_35%,transparent)]" />
    </div>
  );
}

/**
 * ON THE TURNTABLE: a vinyl sleeve on the desk. Square album art leans on a
 * CSS record that spins only while Last.fm reports something now playing
 * (paused for last-played, still under reduced motion). Fetches /api/lastfm
 * on mount and re-checks every 60s while the tab is visible; when the API
 * isn't configured (or errors) the same sleeve shows a dashed platter and a
 * handwritten nudge, so no state changes the layout. No props.
 */
export function Turntable() {
  const [state, setState] = useState<TurntableState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/lastfm");
        const data = await res.json();
        if (cancelled) return;
        if (data?.configured && data?.track) {
          setState({
            kind: "ready",
            nowPlaying: Boolean(data.nowPlaying),
            track: data.track as ApiTrack,
          });
        } else {
          setState({ kind: "unplugged" });
        }
      } catch {
        if (!cancelled) setState({ kind: "unplugged" });
      }
    };

    load();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const track = state.kind === "ready" ? state.track : null;
  const spinning = state.kind === "ready" && state.nowPlaying;

  return (
    <div className="relative -rotate-[0.6deg] rounded-[2px] border border-[var(--ink)] bg-[var(--card)] p-6 shadow-[var(--shadow-press)] min-h-[372px] sm:min-h-[252px] sm:p-7">
      <style>{DISC_CSS}</style>

      {/* Sleeve flavour print. */}
      <p
        aria-hidden="true"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]"
      >
        DESK STEREO — 33⅓ RPM
      </p>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        {/* Art + platter composition — identical box in every state. */}
        <div className="relative h-32 w-[188px] shrink-0">
          <div className="absolute right-0 top-1/2 h-[116px] w-[116px] -translate-y-1/2" aria-hidden="true">
            {state.kind === "unplugged" ? <EmptyDisc /> : <VinylDisc spinning={spinning} />}
          </div>

          {track?.art ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Last.fm art; plain img keeps this dependency-free
            <img
              src={track.art}
              alt={`Album art: ${track.title}${track.artists ? ` by ${track.artists}` : ""}`}
              width={128}
              height={128}
              loading="lazy"
              decoding="async"
              className="absolute left-0 top-0 h-32 w-32 rounded-[2px] border border-[var(--ink)] bg-[var(--paper)] object-cover shadow-[var(--shadow-press-sm)]"
            />
          ) : (
            <div
              aria-hidden="true"
              className={[
                "absolute left-0 top-0 flex h-32 w-32 items-center justify-center rounded-[2px]",
                state.kind === "loading"
                  ? "animate-pulse border border-[var(--line)] bg-[color-mix(in_srgb,var(--ink)_8%,var(--card))] motion-reduce:animate-none"
                  : "border-2 border-dashed border-[color-mix(in_srgb,var(--ink)_45%,transparent)] bg-[var(--card)]",
              ].join(" ")}
            >
              {state.kind !== "loading" && (
                <span className="font-mono text-2xl text-[var(--ink-soft)]">♪</span>
              )}
            </div>
          )}
        </div>

        {/* Label copy — fixed min-height (tall enough for the four-line
            handwritten fallback) so states swap without a jump. */}
        <div className="flex min-h-[160px] min-w-0 flex-1 flex-col items-center justify-center gap-2.5 text-center sm:items-start sm:text-left">
          {state.kind === "loading" && (
            <div className="w-full max-w-[240px] space-y-3" aria-hidden="true">
              <div className="h-5 w-24 animate-pulse rounded-[2px] bg-[color-mix(in_srgb,var(--ink)_10%,var(--card))] motion-reduce:animate-none" />
              <div className="h-4 w-full animate-pulse rounded-[2px] bg-[color-mix(in_srgb,var(--ink)_8%,var(--card))] motion-reduce:animate-none" />
              <div className="h-4 w-2/3 animate-pulse rounded-[2px] bg-[color-mix(in_srgb,var(--ink)_8%,var(--card))] motion-reduce:animate-none" />
            </div>
          )}

          {state.kind === "unplugged" && (
            <HandwrittenNote rotate={-1.5} className="max-w-[260px]">
              nothing spinning yet — put a record on
            </HandwrittenNote>
          )}

          {state.kind === "ready" && track && (
            <>
              <StampBadge
                size="sm"
                rotate={-3}
                tone={state.nowPlaying ? ACCENT_INK.green : "var(--ink)"}
              >
                {state.nowPlaying ? "NOW PLAYING" : "LAST PLAYED"}
              </StampBadge>
              <p className="text-lg font-semibold leading-snug tracking-tight text-[var(--ink)]">
                {track.title}
              </p>
              <p className="text-sm text-[var(--ink-soft)]">{track.artists}</p>
              {track.album && (
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  {track.album}
                </p>
              )}
              {track.url && (
                <UnderlineLink href={track.url} external className="mt-1 text-xs text-[var(--ink)]">
                  OPEN ON LAST.FM
                </UnderlineLink>
              )}
            </>
          )}
        </div>
      </div>

      {/* Async status for screen readers. */}
      <p aria-live="polite" className="sr-only">
        {state.kind === "loading" && "Checking the turntable."}
        {state.kind === "unplugged" && "Last.fm is not connected; the turntable is empty."}
        {state.kind === "ready" &&
          track &&
          `${state.nowPlaying ? "Now playing" : "Last played"}: ${track.title}${
            track.artists ? ` by ${track.artists}` : ""
          }.`}
      </p>
    </div>
  );
}

export default Turntable;
