"use client";

import { useId, useState } from "react";
import { MESSAGE_MAX, NAME_MAX } from "./guestbookLimits";
import {
  signInWithGitHub,
  signInWithGoogle,
  signOutOfGuestbook,
} from "./guestbookAuthActions";

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * Serializable auth snapshot the server component hands down:
 * - "anonymous"  — no OAuth provider configured; the classic name+message
 *   sticky note (unchanged).
 * - "signed-out" — at least one provider configured but no session; the
 *   sticky note becomes sign-in chips.
 * - "signed-in"  — session present; message-only form with the visitor's
 *   account name + avatar and a sign-out link.
 */
export type GuestbookAuthView =
  | { mode: "anonymous" }
  | { mode: "signed-out"; providers: ("github" | "google")[] }
  | { mode: "signed-in"; name: string; image: string | null }
  // Enforcement is on (GUESTBOOK_REQUIRE_AUTH) but no provider is configured
  // yet — the board is read-only rather than open to anonymous posts.
  | { mode: "locked" };

export interface GuestbookFormProps {
  auth: GuestbookAuthView;
  onSubmit: (input: { name: string; message: string; website: string }) => Promise<SubmitResult>;
}

// NOTE: no `focus:outline-none` here — in Tailwind v4 it would zero
// `outline-style` and cancel the focus-visible ring below.
const FIELD_CLASS =
  "w-full rounded-[2px] border-b-2 border-dashed border-[var(--ink)]/40 bg-transparent px-1 py-1.5 text-sm font-medium text-[var(--ink)] placeholder:text-[var(--ink)]/45 focus:border-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)]";

/** Stamp-press chip shared by PIN IT and the sign-in buttons. */
const PRESS_CHIP_CLASS =
  "press inline-flex items-center gap-2 rounded-[2px] border-2 border-[var(--ink)] bg-[var(--card)] px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink)] shadow-[var(--shadow-press)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)]";

/** The sticky-note paper every variant of this corner sits on. */
const STICKY_STYLE: React.CSSProperties = {
  background: "color-mix(in srgb, var(--accent-cream) 80%, var(--card))",
  filter: "drop-shadow(0 8px 16px rgba(22, 22, 22, 0.16))",
};

/** Folded bottom-right corner — the blank-sticky-note tell. */
function FoldedCorner() {
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-0 right-0 block h-6 w-6"
      style={{
        background: "rgba(22, 22, 22, 0.14)",
        clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
      }}
    />
  );
}

/** GitHub mark — same ink path the DeskDock chips use. */
function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.13-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.69 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

/** Single-ink "G" — an open ring with the crossbar, no brand colors. */
function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M12.5 12H20" />
    </svg>
  );
}

/**
 * Signed-out variant: the note paper stays, but instead of fields it offers
 * one press-shadow chip per configured provider. Each chip is a one-field
 * form posting to a server action that starts the OAuth dance and returns
 * the visitor to this page.
 */
function SignInPanel({ providers }: { providers: ("github" | "google")[] }) {
  return (
    <div className="relative -rotate-1 rounded-[2px] p-5 pb-6 sm:p-6" style={STICKY_STYLE}>
      <FoldedCorner />
      <p className="font-hand text-2xl leading-none text-[var(--ink)]">leave a note —</p>
      <p className="mt-4 max-w-[16rem] text-xs font-semibold leading-snug text-[var(--ink)]/75">
        Notes on this board carry a real signature. Pick an account and your
        name and photo come along with it.
      </p>
      <div className="mt-5 flex flex-col items-start gap-3">
        {providers.includes("github") && (
          <form action={signInWithGitHub}>
            <button type="submit" className={PRESS_CHIP_CLASS}>
              <GitHubMark />
              Sign with GitHub
            </button>
          </form>
        )}
        {providers.includes("google") && (
          <form action={signInWithGoogle}>
            <button type="submit" className={PRESS_CHIP_CLASS}>
              <GoogleMark />
              Sign with Google
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/**
 * Signed-in variant: identity comes from the session (the API ignores any
 * client-sent name), so the note only asks for the message. The name is
 * passed to `onSubmit` purely so the optimistic card can render it.
 */
function SignedInForm({
  name,
  image,
  onSubmit,
}: {
  name: string;
  image: string | null;
  onSubmit: GuestbookFormProps["onSubmit"];
}) {
  const uid = useId();
  const messageId = `${uid}-message`;
  const countId = `${uid}-count`;
  const honeypotId = `${uid}-website`;

  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; text: string }>({
    kind: "idle",
    text: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setStatus({ kind: "error", text: "Write something first — even a hello counts." });
      return;
    }

    setSubmitting(true);
    setStatus({ kind: "idle", text: "" });
    const result = await onSubmit({ name, message: trimmedMessage, website });
    setSubmitting(false);

    if (result.ok) {
      setMessage("");
      setWebsite("");
      setStatus({ kind: "ok", text: "Pinned. Thanks for stopping by!" });
    } else {
      // Input left untouched so the visitor can simply retry.
      setStatus({ kind: "error", text: result.error });
    }
  }

  return (
    // A div (not a form) hosts the note so the sign-out form and the
    // message form can be siblings — forms must never nest.
    <div className="relative -rotate-1 rounded-[2px] p-5 pb-6 sm:p-6" style={STICKY_STYLE}>
      <FoldedCorner />
      <p className="font-hand text-2xl leading-none text-[var(--ink)]">leave a note —</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        {image ? (
          // Plain <img>: avatar hosts vary by provider and the tiny
          // thumbnail gains nothing from the optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            referrerPolicy="no-referrer"
            className="h-8 w-8 rounded-full border border-[var(--ink)] object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--ink)] bg-[var(--card)] font-mono text-xs font-bold text-[var(--ink)]"
          >
            {(name.charAt(0) || "?").toUpperCase()}
          </span>
        )}
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/70">
          signed in as <span className="text-[var(--ink)]">{name.slice(0, NAME_MAX)}</span>
        </p>
        <form action={signOutOfGuestbook} className="inline">
          <button
            type="submit"
            className="rounded-[2px] font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/60 underline decoration-dashed underline-offset-4 hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)]"
          >
            sign out
          </button>
        </form>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor={messageId}
              className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/70"
            >
              Message
            </label>
            <span id={countId} className="font-mono text-[10px] tabular-nums text-[var(--ink)]/60">
              {message.length}/{MESSAGE_MAX}
            </span>
          </div>
          <textarea
            id={messageId}
            name="message"
            required
            maxLength={MESSAGE_MAX}
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-describedby={countId}
            placeholder="say hi, leave a book tip, anything"
            className={`${FIELD_CLASS} mt-1 resize-none`}
          />
        </div>

        {/* Honeypot: hidden from people (visually and from the tab order),
            irresistible to form-filling bots. The API silently drops any
            submission that fills it. */}
        <div aria-hidden="true" className="absolute h-px w-px overflow-hidden [clip-path:inset(50%)]">
          <label htmlFor={honeypotId}>Website</label>
          <input
            id={honeypotId}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`${PRESS_CHIP_CLASS} mt-5 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span aria-hidden="true" className="text-[var(--postal-red)]">
            ◉
          </span>
          {submitting ? "Pinning…" : "Pin it"}
        </button>

        <p
          role="status"
          aria-live="polite"
          className={[
            "mt-3 min-h-5 text-xs font-semibold leading-snug",
            status.kind === "error" ? "text-[var(--accent-pink-ink)]" : "text-[var(--ink)]/75",
          ].join(" ")}
        >
          {status.text}
        </p>
      </form>
    </div>
  );
}

/**
 * Blank sticky note that signs the visitor log (anonymous mode). Labeled
 * name/message fields with a live character count, a visually-hidden
 * honeypot the API uses to drop bots, and a PIN IT stamp-press submit.
 * Status (pinned / error) is announced via an aria-live region; the fields
 * keep their text on failure so a rollback never eats a visitor's note.
 */
function AnonymousForm({ onSubmit }: { onSubmit: GuestbookFormProps["onSubmit"] }) {
  const uid = useId();
  const nameId = `${uid}-name`;
  const messageId = `${uid}-message`;
  const countId = `${uid}-count`;
  const honeypotId = `${uid}-website`;

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; text: string }>({
    kind: "idle",
    text: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) {
      setStatus({ kind: "error", text: "A name and a note are both needed before pinning." });
      return;
    }

    setSubmitting(true);
    setStatus({ kind: "idle", text: "" });
    const result = await onSubmit({ name: trimmedName, message: trimmedMessage, website });
    setSubmitting(false);

    if (result.ok) {
      setName("");
      setMessage("");
      setWebsite("");
      setStatus({ kind: "ok", text: "Pinned. Thanks for stopping by!" });
    } else {
      // Inputs are left untouched so the visitor can simply retry.
      setStatus({ kind: "error", text: result.error });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative -rotate-1 rounded-[2px] p-5 pb-6 sm:p-6"
      style={STICKY_STYLE}
    >
      <FoldedCorner />
      <p className="font-hand text-2xl leading-none text-[var(--ink)]">leave a note —</p>

      <div className="mt-4">
        <label
          htmlFor={nameId}
          className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/70"
        >
          Name
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          required
          maxLength={NAME_MAX}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="who goes there?"
          className={`${FIELD_CLASS} mt-1`}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor={messageId}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/70"
          >
            Message
          </label>
          <span id={countId} className="font-mono text-[10px] tabular-nums text-[var(--ink)]/60">
            {message.length}/{MESSAGE_MAX}
          </span>
        </div>
        <textarea
          id={messageId}
          name="message"
          required
          maxLength={MESSAGE_MAX}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-describedby={countId}
          placeholder="say hi, leave a book tip, anything"
          className={`${FIELD_CLASS} mt-1 resize-none`}
        />
      </div>

      {/* Honeypot: hidden from people (visually and from the tab order),
          irresistible to form-filling bots. The API silently drops any
          submission that fills it. */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden [clip-path:inset(50%)]">
        <label htmlFor={honeypotId}>Website</label>
        <input
          id={honeypotId}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`${PRESS_CHIP_CLASS} mt-5 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span aria-hidden="true" className="text-[var(--postal-red)]">
          ◉
        </span>
        {submitting ? "Pinning…" : "Pin it"}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={[
          "mt-3 min-h-5 text-xs font-semibold leading-snug",
          status.kind === "error" ? "text-[var(--accent-pink-ink)]" : "text-[var(--ink)]/75",
        ].join(" ")}
      >
        {status.text}
      </p>
    </form>
  );
}

/**
 * Locked variant: sign-in is enforced but no provider is configured, so the
 * board is read-only. Shown instead of any writable form.
 */
function LockedPanel() {
  return (
    <div className="relative -rotate-1 rounded-[2px] p-5 pb-6 sm:p-6" style={STICKY_STYLE}>
      <FoldedCorner />
      <p className="font-hand text-2xl leading-none text-[var(--ink)]">the log is resting —</p>
      <p className="mt-4 max-w-[16rem] text-xs font-semibold leading-snug text-[var(--ink)]/75">
        This visitor log is sign-in only, and a provider hasn&apos;t been wired
        up yet. Check back soon — you&apos;ll be able to leave a signed note.
      </p>
    </div>
  );
}

/** Dispatches on the auth snapshot: sign-in chips, message-only note, the
 *  original anonymous name+message note, or the locked read-only panel. */
export function GuestbookForm({ auth, onSubmit }: GuestbookFormProps) {
  if (auth.mode === "signed-out") return <SignInPanel providers={auth.providers} />;
  if (auth.mode === "signed-in") {
    return <SignedInForm name={auth.name} image={auth.image} onSubmit={onSubmit} />;
  }
  if (auth.mode === "locked") return <LockedPanel />;
  return <AnonymousForm onSubmit={onSubmit} />;
}

export default GuestbookForm;
