"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let started = false;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

/** Copy props under a prefixed name, e.g. {ref} → {first_ref}. */
function prefixed(props: Record<string, string>, prefix: string) {
  return Object.fromEntries(Object.entries(props).map(([k, v]) => [prefix + k, v]));
}

/** One-time client init. Direct to PostHog (no Vercel proxy → no Vercel
 *  quota used). Session recording + autocapture are OFF by default — only
 *  the explicit events and pageviews we fire are sent, keeping it light. */
function ensureInit() {
  if (started || !KEY || typeof window === "undefined") return;
  started = true;

  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // tracked manually for App Router navigations
    // Library default is "if_capture_pageview" — since capture_pageview is
    // false, this explicit true is what keeps bounce rate working. Leave it.
    capture_pageleave: true,
    autocapture: false, // intentional events only, not every DOM click
    disable_session_recording: true, // opt-in later; keeps data light
    person_profiles: "identified_only", // anonymous visitors don't create profiles

    // These four are pinned locally because leaving them undefined hands the
    // decision to the PostHog dashboard's remote config, which was silently
    // loading surveys.js, web-vitals.js and dead-clicks-autocapture.js and
    // firing events we never opted into. An explicit client value always wins.
    capture_dead_clicks: false,
    // MANDATORY alongside capture_dead_clicks: heatmaps construct their OWN
    // dead-clicks instance with an always-true predicate, so disabling dead
    // clicks alone still loads the script. (capture_heatmaps, not the
    // deprecated enable_heatmaps.)
    capture_heatmaps: false,
    disable_surveys: true,
    // Highest-volume of the three — one extra event per pageview. Cost: the
    // Web Vitals tab in PostHog goes empty.
    capture_performance: { web_vitals: false },
  });

  // ---- Referral / campaign attribution ----
  // Three DISTINCT things, kept separate on purpose. The previous version
  // called register() once and called it "first-touch", which was wrong:
  // register() overwrites, so a later ?ref= permanently erased the link that
  // actually acquired the visitor.
  const params = new URLSearchParams(window.location.search);
  const arrival: Record<string, string> = {};
  const ref = params.get("ref");
  if (ref) arrival.ref = ref;
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) arrival[key] = value;
  }

  if (Object.keys(arrival).length > 0) {
    // Acquisition, immutable: register_once only writes when absent.
    posthog.register_once(prefixed(arrival, "first_"));
    // Most recent touch, honestly named so it can't be mistaken for the above.
    posthog.register(prefixed(arrival, "last_"));
    // Point-in-time arrival. Super properties never expire, so a breakdown on
    // them credits organic visits to a months-old referral forever; counting
    // THIS event is the only per-campaign metric immune to that staleness.
    posthog.capture("referral_landed", arrival);
    // NB: bare utm_* are deliberately NOT registered — posthog-js already
    // records those itself (save_campaign_params), and shadowing them with
    // permanent copies gives two disagreeing sources of truth.
  }
}

/** Manual pageview on every App Router route change (init sets pageview off). */
function Pageviews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!KEY) return;
    // Idempotent (guarded by `started`). Belt-and-braces: init currently wins
    // the race only because the <Suspense> boundary below defers this mount to
    // a later commit. Without this line, removing that boundary would fire
    // capture() pre-init, and PostHog drops those SILENTLY in production.
    ensureInit();
    let url = window.location.origin + pathname;
    const query = searchParams?.toString();
    if (query) url += `?${query}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);
  return null;
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureInit();
  }, []);

  // Delegate click tracking: any element (or ancestor) with a `data-track`
  // attribute fires that event, with `data-track-*` attributes as props. Lets
  // server components opt in with plain attributes — no "use client" needed.
  useEffect(() => {
    if (!KEY) return;
    function onClick(event: MouseEvent) {
      const el = (event.target as HTMLElement | null)?.closest?.("[data-track]");
      const name = el?.getAttribute("data-track");
      if (!el || !name) return;
      const props: Record<string, string> = {};
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith("data-track-")) {
          props[attr.name.slice("data-track-".length)] = attr.value;
        }
      }
      posthog.capture(name, props);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // No key → pure passthrough, nothing loads.
  if (!KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      {/* Two jobs, both load-bearing — do NOT remove:
          1. useSearchParams needs a boundary so static pages don't de-opt to
             dynamic rendering.
          2. It also defers Pageviews' mount to a later commit, which is what
             makes ensureInit() run before the first capture(). */}
      <Suspense fallback={null}>
        <Pageviews />
      </Suspense>
      {children}
    </PHProvider>
  );
}
