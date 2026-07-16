/**
 * Last.fm "recent tracks" for the turntable. Reads LASTFM_API_KEY and
 * LASTFM_USERNAME from env; if either is missing it reports { configured:
 * false } and the widget shows its unplugged sleeve. Works with a FREE
 * Spotify account: Spotify scrobbles plays to Last.fm, and Last.fm's API is
 * free (no Premium). Response is memoised for 60s so the client's polling
 * doesn't hammer the upstream.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TrackOut {
  title: string;
  artists: string;
  album: string;
  art: string | null;
  url: string | null;
}

interface Payload {
  configured: boolean;
  nowPlaying: boolean;
  track: TrackOut | null;
  error?: boolean;
}

const MEMO_MS = 60_000;
let memo: { at: number; body: Payload } | null = null;

/** Last.fm's generic "no art" placeholder — treat it as no art. */
const PLACEHOLDER_ART = "2a96cbd8b46e442fc41c2b86b821562f";

interface LfmImage {
  size?: string;
  "#text"?: string;
}

function pickArt(images: unknown): string | null {
  if (!Array.isArray(images)) return null;
  const list = images as LfmImage[];
  const order = ["extralarge", "large", "medium", "small"];
  const usable = (i: LfmImage | undefined) =>
    i && typeof i["#text"] === "string" && i["#text"] !== "" && !i["#text"].includes(PLACEHOLDER_ART);
  for (const size of order) {
    const found = list.find((i) => i.size === size && usable(i));
    if (found) return found["#text"] as string;
  }
  const any = [...list].reverse().find(usable);
  return any ? (any["#text"] as string) : null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Last.fm frequently has no cover (it returns a placeholder star), so fall
 * back to Apple's free iTunes Search API for real album art. No auth, and
 * the 100px url upscales to 600px by swapping the size token.
 */
async function itunesArt(title: string, artist: string): Promise<string | null> {
  if (!title) return null;
  try {
    // Drop "(From "…")" / bracketed noise that throws off the match.
    const term = `${title} ${artist}`.replace(/[([].*?[)\]]/g, "").replace(/["']/g, "").trim();
    const url = new URL("https://itunes.apple.com/search");
    url.searchParams.set("term", term);
    url.searchParams.set("entity", "song");
    url.searchParams.set("limit", "1");
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: Array<{ artworkUrl100?: string }> };
    const art = data.results?.[0]?.artworkUrl100;
    return typeof art === "string" && art ? art.replace("100x100bb", "600x600bb") : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY?.trim();
  const user = process.env.LASTFM_USERNAME?.trim();

  if (!apiKey || !user) {
    return Response.json({ configured: false, nowPlaying: false, track: null } as Payload);
  }

  const now = Date.now();
  if (memo && now - memo.at < MEMO_MS) {
    return Response.json(memo.body);
  }

  try {
    const url = new URL("https://ws.audioscrobbler.com/2.0/");
    url.searchParams.set("method", "user.getrecenttracks");
    url.searchParams.set("user", user);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url, { headers: { "User-Agent": "makers-desk-portfolio" } });
    if (!res.ok) throw new Error(`last.fm responded ${res.status}`);

    const data: unknown = await res.json();
    // Last.fm returns `track` as an array normally, but as a SINGLE OBJECT
    // when there's only one item (e.g. a now-playing track on an account with
    // no past scrobbles). Normalize both shapes.
    const raw = (data as { recenttracks?: { track?: unknown } })?.recenttracks?.track;
    const track = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown> | undefined;

    if (!track) {
      const body: Payload = { configured: true, nowPlaying: false, track: null };
      memo = { at: now, body };
      return Response.json(body);
    }

    const attr = track["@attr"] as { nowplaying?: string } | undefined;
    const artist = track.artist as { "#text"?: string } | undefined;
    const album = track.album as { "#text"?: string } | undefined;
    const title = str(track.name);
    const artists = str(artist?.["#text"]);
    // Prefer Last.fm's own art; when it's the placeholder (null), pull the
    // real cover from iTunes.
    const art = pickArt(track.image) ?? (await itunesArt(title, artists));
    const out: TrackOut = {
      title,
      artists,
      album: str(album?.["#text"]),
      art,
      url: str(track.url) || null,
    };

    const body: Payload = {
      configured: true,
      nowPlaying: attr?.nowplaying === "true",
      track: out.title ? out : null,
    };
    memo = { at: now, body };
    return Response.json(body);
  } catch {
    // Don't cache errors; unplugged sleeve, retry on the next poll.
    return Response.json({ configured: false, nowPlaying: false, track: null, error: true } as Payload);
  }
}
