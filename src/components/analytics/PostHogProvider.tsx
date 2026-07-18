"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let started = false;

/** One-time client init. Direct to PostHog (no Vercel proxy → no Vercel
 *  quota used). Session recording + autocapture are OFF by default — only
 *  the explicit events and pageviews we fire are sent, keeping it light. */
function ensureInit() {
  if (started || !KEY || typeof window === "undefined") return;
  started = true;

  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // tracked manually for App Router navigations
    capture_pageleave: true,
    autocapture: false, // intentional events only, not every DOM click
    disable_session_recording: true, // opt-in later; keeps data light
    person_profiles: "identified_only", // anonymous visitors don't create profiles
  });

  // First-touch referral / campaign capture: our custom ?ref= plus UTM params.
  // Registered as super properties (ride on every event) and logged once.
  const params = new URLSearchParams(window.location.search);
  const props: Record<string, string> = {};
  const ref = params.get("ref");
  if (ref) props.ref = ref;
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const value = params.get(key);
    if (value) props[key] = value;
  }
  if (Object.keys(props).length > 0) {
    posthog.register(props);
    posthog.capture("referral_landed", props);
  }
}

/** Manual pageview on every App Router route change (init sets pageview off). */
function Pageviews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!KEY) return;
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
      {/* useSearchParams needs a Suspense boundary so static pages don't
          de-opt to dynamic rendering. */}
      <Suspense fallback={null}>
        <Pageviews />
      </Suspense>
      {children}
    </PHProvider>
  );
}
