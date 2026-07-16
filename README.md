# Dinesh Ganesan — Portfolio

A portfolio site styled as a design canvas: rulers with tick marks, selection
handles, comment bubbles, folder-tab cards, and handwritten annotations on a
paper background. Built with Next.js (App Router), TypeScript, Tailwind CSS v4,
and Lenis smooth scroll.

> **Note:** Everything on the site — the name, companies, projects, and every
> metric — is placeholder content meant to be replaced by the owner. See
> "Editing content" below; no component code needs to change to swap it out.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Editing content

All copy lives in typed data modules under `src/data/` — pages and components
only render what these files export:

| File | What it holds |
| --- | --- |
| `src/data/profile.ts` | Name, role, availability, email, socials, intro statement, about page bio, section blurbs, footer comment |
| `src/data/projects.ts` | All 9 case studies: taglines, tags, meta (role / platform / focus / live link), problem, approach, "What I Built", "What Changed" |
| `src/data/timeline.ts` | Career history entries (company, role, period, accent color) |
| `src/data/skills.ts` | Skill groups (LANGUAGES / BACKEND / DATA / CLIENT / INFRA) |
| `src/data/principles.ts` | "How I work" principles with handwritten takeaways |
| `src/data/types.ts` | The shared TypeScript types — the shape every module above must satisfy |
| `src/data/site.ts` | Design constants (accent color map, card tilts) — rarely needs editing |

Rules of thumb when editing:

- Keep each project's `slug` and `order` intact — routes (`/work/[slug]`) and
  image paths derive from them.
- `accent` values must be one of the `Accent` union members in `types.ts`.
- Run `npx tsc --noEmit` after editing; the types will catch missing fields.

## Swapping images

Images live in `public/images/`:

- `public/images/projects/*` — one cover screenshot per project
  (`buddy-blog.png`, `uzhavan.png`), plus `placeholder.svg` for the
  in-progress slot. Each project's `cover`/`gallery` paths live in
  `src/data/projects.ts` — drop in a new PNG/WebP/SVG and update the path.
  Covers read best around a 16:10–2:1 frame.
- `public/images/portrait.jpeg` — the about-page portrait.

## Deploying

The project is Vercel-ready: import the repo on [Vercel](https://vercel.com),
accept the Next.js defaults, and deploy. `npm run build` produces the
production build if you're hosting elsewhere (any Node host or
`next start` behind a proxy works).

## /desk extras

The `/desk` page ("OFF DUTY") has two features that go beyond static data:
the visitor log and the Last.fm turntable.

### Visitor log storage

Guestbook entries persist to a JSON file at `.data/guestbook.json` (created
on demand, git-ignored). That is perfect for local dev and for a single
long-lived Node server — but **on serverless hosts (Vercel, Lambda, etc.) the
filesystem is ephemeral and per-instance**, so entries will silently vanish
between deploys and across instances. All storage is isolated behind one tiny
module, `src/server/guestbookStore.ts`; to go hosted, swap that file's
read/write internals for a real store (Postgres, Redis, Vercel KV, Supabase…)
without touching the API route or the UI.

### Last.fm ("ON THE TURNTABLE")

The turntable card asks `src/app/api/lastfm/route.ts` what you're listening
to; that route needs two env vars (template in `.env.local.example`). Last.fm
is free and works with a **free Spotify account** — Spotify scrobbles your
plays to Last.fm, and the API reads them back. One-time setup, ~3 minutes:

1. **Have a Last.fm account** ([last.fm/join](https://www.last.fm/join)) and
   note your **username**.
2. **Connect Spotify to Last.fm** so plays scrobble: Last.fm → **Settings →
   Applications → Spotify → Connect**.
3. **Create a free API key** at
   [last.fm/api/account/create](https://www.last.fm/api/account/create)
   (any application name; you can leave the callback URL blank). Copy the
   **API key**.
4. **Fill in `.env.local`**: copy `.env.local.example` to `.env.local`, set
   `LASTFM_API_KEY` and `LASTFM_USERNAME`, then restart the dev server.

While either var is missing, the card just shows its handwritten "nothing
spinning yet" state. The route memoises the response for 60s and reads only
`user.getRecentTracks` (public, read-only) — nothing sensitive reaches the
browser.

## Guestbook sign-in

The guestbook can run in two modes, decided entirely by env vars:

- **Anonymous mode (default).** With none of the `AUTH_*` vars set,
  visitors type a display name by hand — exactly the original flow. The
  whole site builds and runs with zero OAuth setup.
- **Signed mode.** Configure GitHub and/or Google below and the sticky
  note swaps its name field for sign-in chips. Signed-in visitors post
  under their real account name, their avatar is pinned next to the note,
  and the API takes identity from the session (any client-sent name is
  ignored). The honeypot, per-IP cooldown, and message validation apply in
  both modes.

Sessions are stateless JWTs via [Auth.js](https://authjs.dev) (next-auth
v5) — no database, no adapter. Either provider works alone; only the ones
whose env vars are present get registered and offered.

### 1. AUTH_SECRET

Required as soon as any provider is configured (it signs the session JWT):

```bash
npx auth secret          # writes AUTH_SECRET to .env.local for you
# or
openssl rand -base64 32  # paste the output into .env.local yourself
```

If provider credentials are present but `AUTH_SECRET` is missing, the
guestbook deliberately stays in anonymous mode and logs a one-time server
warning instead of erroring.

### 2. GitHub OAuth app

1. Open [github.com/settings/developers](https://github.com/settings/developers)
   → **OAuth Apps** → **New OAuth App**.
2. Fill in:
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Register, then **Generate a new client secret**.
4. Put the Client ID and the secret into `.env.local` as
   `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`.

### 3. Google OAuth client

1. In [console.cloud.google.com](https://console.cloud.google.com), pick
   (or create) a project, then go to **APIs & Services → Credentials**.
2. If prompted, configure the **OAuth consent screen** first (External,
   app name + your email; no extra scopes needed — the defaults cover
   name, email, and picture).
3. **Create credentials → OAuth client ID**, type **Web application**:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
4. Put the Client ID and Client secret into `.env.local` as
   `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

For production, add the same callback paths on your real origin (e.g.
`https://your.domain/api/auth/callback/github` and `/google`) to each
provider's settings. Restart the dev server after editing `.env.local`;
mode switching needs no code changes.
