import { auth, authConfigured, requireAuth } from "@/auth";
import { listEntries, type GuestbookEntry } from "@/server/guestbookStore";
import { NAME_MAX } from "./guestbookLimits";
import GuestbookBoard from "./GuestbookBoard";
import type { GuestbookAuthView } from "./GuestbookForm";

export interface GuestbookProps {
  /** First paint: pass entries in, or omit and this server component reads
   *  the store itself. */
  initialEntries?: GuestbookEntry[];
}

/**
 * Server shell of the visitor log. Resolves the auth situation once per
 * request — which OAuth providers are configured and whether the visitor
 * holds a session — and hands the client board a plain, serializable
 * snapshot. In anonymous mode (no AUTH_* env vars) `auth()` is never even
 * called and the board behaves exactly as it always has.
 */
export async function Guestbook({ initialEntries }: GuestbookProps) {
  const entries = initialEntries ?? (await listEntries(60));
  const providers = authConfigured();

  let view: GuestbookAuthView;
  if (providers.length > 0) {
    const session = await auth();
    if (session?.user) {
      const name = (session.user.name ?? "").replace(/\s+/g, " ").trim();
      view = {
        mode: "signed-in",
        name: name.slice(0, NAME_MAX) || "a signed-in visitor",
        image: session.user.image ?? null,
      };
    } else {
      view = { mode: "signed-out", providers };
    }
  } else if (requireAuth()) {
    // Enforcement on, but no provider wired up: read-only, never anonymous.
    view = { mode: "locked" };
  } else {
    view = { mode: "anonymous" };
  }

  return <GuestbookBoard initialEntries={entries} auth={view} />;
}

export default Guestbook;
