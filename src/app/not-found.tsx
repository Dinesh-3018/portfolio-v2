import Postmark from "@/components/ui/Postmark";
import UnderlineLink from "@/components/ui/UnderlineLink";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-5 py-24 text-center">
      <Postmark tone="ink" size={80} label="UNDELIVERED" />
      <h1 className="font-display text-[clamp(4rem,16vw,10rem)] font-black leading-none text-[var(--ink)]">
        404
      </h1>
      <p className="max-w-md font-mono text-sm tracking-[0.12em] text-[var(--ink-soft)]">
        THIS PAGE GOT LOST IN THE MAIL.
      </p>
      <UnderlineLink href="/" className="text-[var(--ink)]">
        BACK HOME
        <span aria-hidden="true">→</span>
      </UnderlineLink>
    </section>
  );
}
