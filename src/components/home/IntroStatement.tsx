import Reveal from "@/components/ui/Reveal";
import { profile } from "@/data/profile";

/** Sealed-envelope glyph resting in the pink postage chip. */
function EnvelopeGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4.5" width="16" height="11" rx="1.5" stroke="#faf9f5" strokeWidth="1.6" />
      <path
        d="M2.8 5.5L10 10.5L17.2 5.5"
        stroke="#faf9f5"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Paper plane that lifts out of the envelope on hover (see .cta-plane). */
function PaperPlaneGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="cta-plane pointer-events-none absolute left-1/2 top-1/2 -ml-2 -mt-2"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path d="M15 1L1 7.2L6.4 9.1M15 1L6.4 9.1M15 1L9.5 15L6.4 9.1" stroke="#faf9f5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * CONTACT ME desk button: an ink-slab mailto stamp with a leading pink
 * postage chip that holds a sealed envelope. On hover the button presses
 * into its own hard shadow (ink-pad press) while a paper plane lifts out of
 * the envelope and flies off (see .cta-send / .cta-plane in globals.css);
 * active sinks it a touch deeper.
 */
function ContactBar({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="group relative inline-flex items-center gap-3.5 rounded-[3px] border-2 border-[var(--ink)] bg-[var(--ink)] py-2.5 pl-2.5 pr-6 shadow-[var(--shadow-press)] transition-[transform,box-shadow] duration-150 ease-out hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[var(--shadow-press-sm)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--accent-pink)] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none motion-reduce:transition-none"
    >
      <span
        aria-hidden="true"
        className="relative grid h-10 w-10 -rotate-3 place-items-center rounded-[2px] bg-[var(--accent-pink)] shadow-[inset_0_0_0_1.5px_rgba(250,249,245,0.35)] transition-transform duration-200 group-hover:rotate-0 motion-reduce:transition-none"
      >
        <EnvelopeGlyph />
        <PaperPlaneGlyph />
      </span>
      <span className="font-mono text-sm font-bold uppercase tracking-[0.26em] text-white">
        CONTACT ME
      </span>
    </a>
  );
}

/**
 * Compact centered block right under the hero: the black CONTACT ME bar with
 * its looping chevron chip, plus a handwritten "check my resume" link.
 */
export function IntroStatement() {
  return (
    <section className="relative px-5 pb-14 pt-2 sm:px-8">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <ContactBar email={profile.email} />
        <a
          href={profile.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-hide-cursor="true"
          className="group inline-flex items-center gap-1.5 rounded-sm font-hand text-2xl text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-pink)]"
        >
          <span aria-hidden="true">↳</span>
          <span className="underline decoration-dashed decoration-1 underline-offset-4 group-hover:decoration-solid">
            or, check my resume
          </span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            ↗
          </span>
        </a>
      </Reveal>
    </section>
  );
}

export default IntroStatement;
