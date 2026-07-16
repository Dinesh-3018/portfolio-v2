import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Redis } from "@upstash/redis";

/**
 * Guestbook persistence, isolated behind this module so the storage backend
 * can be swapped without touching the API route or the UI.
 *
 * TWO BACKENDS, chosen at runtime:
 *  - PRODUCTION (serverless): an Upstash Redis / Vercel KV store, used whenever
 *    KV_REST_API_URL + KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* pair) are
 *    set. Entries live in a Redis list; the per-IP cooldown lives in short-TTL
 *    keys — both shared across every serverless instance.
 *  - LOCAL DEV: a JSON file at `<project>/.data/guestbook.json` (git-ignored)
 *    plus an in-process cooldown map. No KV config needed to run locally.
 *
 * Every read is CRASH-SAFE: on any backend error (missing file, read-only FS,
 * KV hiccup) it returns an empty list instead of throwing, so the /guestbook
 * page can never 500. Writes fail soft on the file backend (read-only FS) and
 * surface real errors on the KV backend (a failed POST, not a broken page).
 */

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** Avatar URL from the OAuth provider — only on signed-in entries. */
  avatar?: string;
  /** OAuth provider id ("github" / "google") — only on signed-in entries. */
  provider?: string;
  /** Stored-only, never sent to clients: a hash of the signer's account key,
   *  used to count how many notes an account has pinned. */
  accountKey?: string;
}

/** The public shape sent to the client — `accountKey` is stripped out. */
export type PublicGuestbookEntry = Omit<GuestbookEntry, "accountKey">;

/** Hard cap on stored entries: only the newest MAX_STORED are kept. */
const MAX_STORED = 500;
/** Minimum gap between accepted posts from one client, in seconds. */
const COOLDOWN_SECONDS = 30;

const ENTRIES_KEY = "guestbook:entries";
const COOLDOWN_PREFIX = "guestbook:cooldown:";

/* ---------------------------------------------------------------- */
/* Backend selection                                                */
/* ---------------------------------------------------------------- */

function makeRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

const redis = makeRedis();

/** True when a hosted KV store backs the guestbook (i.e. production-ready). */
export const usingKvStore = redis !== null;

/* ---------------------------------------------------------------- */
/* Shared helpers                                                   */
/* ---------------------------------------------------------------- */

function isEntry(value: unknown): value is GuestbookEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.message === "string" &&
    typeof entry.createdAt === "string" &&
    (entry.avatar === undefined || typeof entry.avatar === "string") &&
    (entry.provider === undefined || typeof entry.provider === "string") &&
    (entry.accountKey === undefined || typeof entry.accountKey === "string")
  );
}

/** Upstash returns objects for JSON values, but coerce strings too, defensively. */
function coerce(value: unknown): GuestbookEntry | null {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return isEntry(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return isEntry(value) ? value : null;
}

/** Drop the internal accountKey before anything leaves the server. */
function toPublic(entry: GuestbookEntry): PublicGuestbookEntry {
  const { accountKey: _omit, ...rest } = entry;
  void _omit;
  return rest;
}

/* ---------------------------------------------------------------- */
/* Local file backend (dev only)                                    */
/* ---------------------------------------------------------------- */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "guestbook.json");
const memCooldown = new Map<string, number>();

function fileReadAll(): GuestbookEntry[] {
  try {
    const parsed: unknown = JSON.parse(readFileSync(DATA_FILE, "utf8"));
    if (Array.isArray(parsed)) return parsed.filter(isEntry);
  } catch {
    // Missing / corrupt / read-only FS: start empty rather than crash.
  }
  return [];
}

function fileWriteAll(entries: GuestbookEntry[]): void {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), "utf8");
  } catch {
    // Read-only FS (e.g. serverless without KV configured): degrade to
    // no-persist instead of throwing. Real persistence needs the KV backend.
  }
}

/* ---------------------------------------------------------------- */
/* Public API (backend-agnostic, async, crash-safe reads)           */
/* ---------------------------------------------------------------- */

async function readAll(): Promise<GuestbookEntry[]> {
  if (redis) {
    try {
      const raw = await redis.lrange(ENTRIES_KEY, 0, MAX_STORED - 1);
      return raw.map(coerce).filter((e): e is GuestbookEntry => e !== null);
    } catch {
      return [];
    }
  }
  return fileReadAll();
}

/** Newest-first slice for display (accountKey stripped). Never throws. */
export async function listEntries(limit = 60): Promise<PublicGuestbookEntry[]> {
  const all = await readAll();
  return all.slice(0, Math.max(0, limit)).map(toPublic);
}

/** How many notes this account has already pinned (for the per-account cap). */
export async function countByAccount(accountKey: string): Promise<number> {
  if (!accountKey) return 0;
  const all = await readAll();
  return all.reduce((n, e) => (e.accountKey === accountKey ? n + 1 : n), 0);
}

/**
 * Prepend a new entry (caller has validated/sanitized the fields) and trim to
 * the newest MAX_STORED. Returns the public shape (no accountKey). On the KV
 * backend a genuine write failure throws (the POST 500s); the file backend
 * fails soft.
 */
export async function addEntry(input: {
  name: string;
  message: string;
  avatar?: string;
  provider?: string;
  accountKey?: string;
}): Promise<PublicGuestbookEntry> {
  const entry: GuestbookEntry = {
    id: randomUUID(),
    name: input.name,
    message: input.message,
    createdAt: new Date().toISOString(),
    avatar: input.avatar,
    provider: input.provider,
    accountKey: input.accountKey,
  };

  if (redis) {
    await redis.lpush(ENTRIES_KEY, entry);
    await redis.ltrim(ENTRIES_KEY, 0, MAX_STORED - 1);
  } else {
    fileWriteAll([entry, ...fileReadAll()].slice(0, MAX_STORED));
  }
  return toPublic(entry);
}

/* ---------------------------------------------------------------- */
/* Rate-limit cooldown (shared on KV, in-process locally)           */
/* ---------------------------------------------------------------- */

/** Seconds left before this client may post again (0 = clear now). */
export async function cooldownRemaining(client: string): Promise<number> {
  if (!client || client === "unknown") return 0;
  if (redis) {
    try {
      const ttl = await redis.ttl(`${COOLDOWN_PREFIX}${client}`);
      return ttl > 0 ? ttl : 0;
    } catch {
      return 0;
    }
  }
  const last = memCooldown.get(client);
  if (last === undefined) return 0;
  const remaining = Math.ceil((COOLDOWN_SECONDS * 1000 - (Date.now() - last)) / 1000);
  return remaining > 0 ? remaining : 0;
}

/** Start the cooldown window for this client after an accepted post. */
export async function markPosted(client: string): Promise<void> {
  if (!client || client === "unknown") return;
  if (redis) {
    try {
      await redis.set(`${COOLDOWN_PREFIX}${client}`, "1", { ex: COOLDOWN_SECONDS });
    } catch {
      // Cooldown is best-effort; a KV hiccup here must not fail the post.
    }
    return;
  }
  memCooldown.set(client, Date.now());
  if (memCooldown.size > 1000) {
    const now = Date.now();
    for (const [ip, at] of memCooldown) {
      if (now - at >= COOLDOWN_SECONDS * 1000) memCooldown.delete(ip);
    }
  }
}
