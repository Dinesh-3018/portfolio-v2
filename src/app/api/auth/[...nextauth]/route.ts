import type { NextRequest } from "next/server";
import { authConfigured, handlers } from "@/auth";

/** Auth.js reads cookies and signs JWTs — plain Node territory. */
export const runtime = "nodejs";

/**
 * Auth.js catch-all endpoints (/api/auth/signin, /callback/github, …).
 *
 * While no OAuth provider is configured (anonymous mode) the endpoints
 * answer with a deliberate, quiet 404 instead of delegating to Auth.js, so
 * a half-configured deployment can never surface a config error page.
 */
function anonymousMode(): Response {
  return Response.json(
    { error: "Sign-in is not configured here — the guestbook runs in anonymous mode." },
    { status: 404 }
  );
}

export async function GET(request: NextRequest): Promise<Response> {
  if (authConfigured().length === 0) return anonymousMode();
  return handlers.GET(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  if (authConfigured().length === 0) return anonymousMode();
  return handlers.POST(request);
}
