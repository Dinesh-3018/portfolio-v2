import posthog from "posthog-js";

/**
 * Analytics is completely inert unless NEXT_PUBLIC_POSTHOG_KEY is set — no
 * script loads, no events fire, no network calls. This flag is inlined at
 * build time, so `track()` compiles down to a no-op when the key is absent.
 */
export const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

/** Fire a custom PostHog event. No-op when analytics is off or during SSR. */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!analyticsEnabled || typeof window === "undefined") return;
  posthog.capture(event, properties);
}

/** Attach properties to the current person (e.g. a guestbook signer). */
export function setPerson(properties: Record<string, unknown>) {
  if (!analyticsEnabled || typeof window === "undefined") return;
  posthog.setPersonProperties(properties);
}
