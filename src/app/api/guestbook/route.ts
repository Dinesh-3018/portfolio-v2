import { createHash, randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { auth, authConfigured, requireAuth } from "@/auth";
import {
  addEntry,
  cooldownRemaining,
  countByAccount,
  listEntries,
  markPosted,
  type GuestbookEntry,
} from "@/server/guestbookStore";
import { MESSAGE_MAX, NAME_MAX } from "@/components/desk/guestbookLimits";

/** The store uses Node APIs (file backend) alongside KV, so pin the Node
 *  runtime. Persistence + cooldown live in src/server/guestbookStore.ts. */
export const runtime = "nodejs";

/** Max notes a single signed-in account may pin (override with env). */
const MAX_PER_ACCOUNT = (() => {
  const n = Number(process.env.GUESTBOOK_MAX_PER_ACCOUNT);
  return Number.isInteger(n) && n > 0 ? n : 3;
})();

/** One-way hash of the session's account key, so raw provider ids never
 *  touch the store. */
function accountKeyFrom(uid: string): string {
  return createHash("sha256").update(uid).digest("hex").slice(0, 24);
}

function clientIp(request: NextRequest): string {
  // Rate-limit key from platform-set client-IP headers only. Vercel sets
  // x-real-ip; Cloudflare (which fronts the domain) sets cf-connecting-ip.
  // The left-most X-Forwarded-For hop is client-spoofable, so it is NOT
  // trusted as the key.
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

/** Strip C0/C1 control characters (newlines included — entries are single
 *  paragraphs on small cards), collapse runs of whitespace, and trim. */
function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Accept an avatar URL from the OAuth profile only if it parses as a
 *  sane-length https URL — anything else is silently dropped. */
function safeAvatarUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 600) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:") return url.href;
  } catch {
    // fall through — not a URL at all
  }
  return undefined;
}

export async function GET() {
  return Response.json({ entries: await listEntries(60) });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Send JSON with a name and a message." }, { status: 400 });
  }

  // Enforcement: a session is required whenever any OAuth provider is
  // configured OR GUESTBOOK_REQUIRE_AUTH is set (fail-closed — if enforcement
  // is on but no provider is wired up, posting is disabled rather than open).
  // When enforced, identity comes from the session, never the client (any
  // client-sent name is ignored). Otherwise the original anonymous flow runs.
  const providers = authConfigured();
  const enforced = requireAuth() || providers.length > 0;
  let signedIn: {
    name: string;
    avatar?: string;
    provider?: string;
    accountKey?: string;
  } | null = null;
  if (enforced) {
    const session = providers.length > 0 ? await auth() : null;
    if (!session?.user) {
      return Response.json(
        {
          error:
            providers.length > 0
              ? "Sign in with GitHub or Google before pinning a note."
              : "The guest book is sign-in only right now, but no provider is configured yet.",
        },
        { status: 401 }
      );
    }
    signedIn = {
      name: sanitize(session.user.name).slice(0, NAME_MAX) || "a signed-in visitor",
      avatar: safeAvatarUrl(session.user.image),
      provider: typeof session.provider === "string" ? session.provider : undefined,
      accountKey: typeof session.uid === "string" ? accountKeyFrom(session.uid) : undefined,
    };

    // Per-account cap: one account may pin only so many notes total.
    if (signedIn.accountKey && (await countByAccount(signedIn.accountKey)) >= MAX_PER_ACCOUNT) {
      return Response.json(
        {
          error: `You've already pinned ${MAX_PER_ACCOUNT} notes — thanks for filling the board!`,
        },
        { status: 403 }
      );
    }
  }

  const name = signedIn ? signedIn.name : sanitize(body.name);
  const message = sanitize(body.message);

  // Honeypot: humans never see the "website" field, so anything in it is a
  // bot. Answer with a convincing 201 and store nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    const decoy: GuestbookEntry = {
      id: randomUUID(),
      name: name.slice(0, NAME_MAX),
      message: message.slice(0, MESSAGE_MAX),
      createdAt: new Date().toISOString(),
    };
    return Response.json({ entry: decoy }, { status: 201 });
  }

  if (!name || !message) {
    return Response.json(
      {
        error: signedIn
          ? "A message is required."
          : "Both a name and a message are required.",
      },
      { status: 400 }
    );
  }
  if (name.length > NAME_MAX) {
    return Response.json({ error: `Name must be ${NAME_MAX} characters or fewer.` }, { status: 400 });
  }
  if (message.length > MESSAGE_MAX) {
    return Response.json(
      { error: `Message must be ${MESSAGE_MAX} characters or fewer.` },
      { status: 400 }
    );
  }

  const ip = clientIp(request);
  const retryAfterSeconds = await cooldownRemaining(ip);
  if (retryAfterSeconds > 0) {
    return Response.json(
      { error: "The ink is still drying — try again in a moment." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const entry = await addEntry(
    signedIn
      ? {
          name,
          message,
          avatar: signedIn.avatar,
          provider: signedIn.provider,
          accountKey: signedIn.accountKey,
        }
      : { name, message }
  );
  await markPosted(ip);

  return Response.json({ entry }, { status: 201 });
}
