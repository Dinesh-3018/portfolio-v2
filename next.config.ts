import type { NextConfig } from "next";

/**
 * Baseline security response headers applied to every route. The CSP ships
 * in Report-Only first so it can never break the live site — after verifying
 * there are no violations in the browser console, rename it to
 * `Content-Security-Policy` to enforce. 'unsafe-inline' covers Next's inline
 * bootstrap script and the few inline <style> blocks (Tailwind + StoryBook).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      // PostHog loads its client + config from *.posthog.com (analytics is
      // env-gated; these are harmless when the key is unset).
      "script-src 'self' 'unsafe-inline' https://*.posthog.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.posthog.com",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // The old off-duty drawer: its guestbook now lives at /guestbook
      // (bucket list + turntable moved onto /about).
      {
        source: "/desk",
        destination: "/guestbook",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
