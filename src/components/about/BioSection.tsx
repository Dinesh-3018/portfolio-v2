import { profile } from "@/data/profile";
import Reveal from "@/components/ui/Reveal";
import TapedImage from "@/components/ui/TapedImage";
import HandwrittenNote from "@/components/ui/HandwrittenNote";
import StickerLabel from "./StickerLabel";

/** Italicizes the tail of the headline as a Fraunces pink aside. */
function AccentedHeadline({ text }: { text: string }) {
  const words = text.split(" ");
  if (words.length <= 4) return <>{text}</>;
  const split = words.length - 3;
  return (
    <>
      {words.slice(0, split).join(" ")}{" "}
      <em className="font-display italic text-[var(--accent-pink)]">
        {words.slice(split).join(" ")}
      </em>
    </>
  );
}

/** Hand-drawn arrow curving down toward the next section. */
function StoryArrow() {
  return (
    <svg width="34" height="56" viewBox="0 0 34 56" fill="none" aria-hidden="true">
      <path
        d="M6 4 C 26 12, 30 30, 22 48"
        stroke="var(--ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M21.5 37 L22 48 L30.5 41"
        stroke="var(--ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * MAIN BIO dossier: a hard-shadowed document panel with the headline, bio
 * paragraphs, and a washi-taped portrait with a handwritten caption. A
 * handwritten "my story" aside and curved arrow point onward to the next
 * section.
 */
export function BioSection() {
  return (
    <section id="bio" className="scroll-mt-28 px-5 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="mb-4 flex items-baseline gap-4">
            <p className="font-mono text-xs font-semibold tracking-[0.18em] text-[var(--ink-soft)]">
              ABOUT
            </p>
            <StickerLabel tone="yellow">MAIN BIO</StickerLabel>
          </div>
          <div className="rounded-[2px] border border-[var(--ink)] bg-[var(--card)] shadow-[var(--shadow-press-lg)]">
            <div className="px-6 py-10 sm:px-12 sm:py-14">
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--ink)] sm:text-[2.5rem]">
                <AccentedHeadline text={profile.about.headline} />
              </h2>

              <div className="mt-8 max-w-2xl space-y-6 text-[17px] leading-relaxed text-[var(--ink)]/90">
                {profile.about.paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-14 flex justify-center pb-16 md:justify-end md:pr-10">
                <div className="relative">
                  <TapedImage
                    image={{ src: "/images/portrait.jpeg", alt: `Portrait of ${profile.name}` }}
                    rotate={2}
                    className="aspect-square w-56"
                    imgClassName="object-top"
                  />
                  <HandwrittenNote className="mt-3 text-center text-xl sm:text-2xl">
                    {profile.about.portraitNote}
                  </HandwrittenNote>
                  <span className="absolute -bottom-16 right-0 flex items-start gap-1.5">
                    <HandwrittenNote rotate={-3} className="whitespace-nowrap">
                      my story ↓
                    </HandwrittenNote>
                    <StoryArrow />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default BioSection;
