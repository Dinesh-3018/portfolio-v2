import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

/**
 * Auth.js (next-auth v5) wiring for the guestbook's optional sign-in.
 *
 * Everything here degrades to "anonymous mode": while the AUTH_* env vars
 * are absent, `authConfigured()` returns an empty list, no provider is
 * registered, the auth routes answer with a friendly 404, and the guestbook
 * keeps its original name-field flow. Nothing on the site requires OAuth
 * to be set up.
 *
 * Sessions are stateless JWTs (no adapter, no database) — the only thing
 * the guestbook needs from a session is the visitor's display name, avatar
 * URL, and which provider vouched for them.
 */

/** Provider ids the guestbook knows how to offer. */
export type GuestbookProvider = "github" | "google";

declare module "next-auth" {
  interface Session {
    /** OAuth provider the visitor signed in with ("github" / "google"). */
    provider?: string;
    /** Stable "<provider>:<account id>" key — used to cap notes per account
     *  (survives display-name changes; never shown to other visitors). */
    uid?: string;
  }
}

function envPresent(...names: string[]): boolean {
  return names.every((name) => Boolean(process.env[name]?.trim()));
}

let warnedMissingSecret = false;

/**
 * Which providers have their env vars present. An empty array means
 * anonymous mode: the guestbook falls back to its client-name flow and the
 * auth endpoints stay dormant.
 *
 * AUTH_SECRET is part of the contract — provider credentials without a
 * secret cannot mint verifiable sessions, so that misconfiguration also
 * resolves to anonymous mode (with a one-time server-side warning) instead
 * of runtime errors.
 */
export function authConfigured(): GuestbookProvider[] {
  const providers: GuestbookProvider[] = [];
  if (envPresent("AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET")) providers.push("github");
  if (envPresent("AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET")) providers.push("google");

  if (providers.length > 0 && !envPresent("AUTH_SECRET")) {
    if (!warnedMissingSecret) {
      warnedMissingSecret = true;
      console.warn(
        "[auth] OAuth provider credentials found but AUTH_SECRET is missing — " +
          "guestbook sign-in stays disabled (anonymous mode). " +
          "Generate one with `npx auth secret` and add it to .env.local."
      );
    }
    return [];
  }
  return providers;
}

/**
 * Hard enforcement switch. When GUESTBOOK_REQUIRE_AUTH is truthy the
 * guestbook NEVER accepts anonymous posts: a valid GitHub/Google session
 * is required to pin a note, and if no provider is configured the board is
 * locked (read-only) rather than silently falling back to anonymous. This
 * fails CLOSED — a broken OAuth config disables posting instead of opening
 * it to everyone. Leave it unset for the graceful anonymous fallback.
 */
export function requireAuth(): boolean {
  const raw = process.env.GUESTBOOK_REQUIRE_AUTH?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

/** Only register providers whose env vars exist; the bare provider
 *  functions read AUTH_GITHUB_ID / AUTH_GOOGLE_ID etc. on their own. */
const enabled = authConfigured();
const providers: NextAuthConfig["providers"] = [];
if (enabled.includes("github")) providers.push(GitHub);
if (enabled.includes("google")) providers.push(Google);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt({ token, account }) {
      // Stash which provider vouched for this visitor and a stable account
      // key ("<provider>:<providerAccountId>") at sign-in time, so guestbook
      // entries can record the provider and be capped per account.
      if (account?.provider) {
        token.provider = account.provider;
        if (account.providerAccountId) {
          token.uid = `${account.provider}:${account.providerAccountId}`;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.provider === "string") session.provider = token.provider;
      if (typeof token.uid === "string") session.uid = token.uid;
      return session;
    },
  },
});
