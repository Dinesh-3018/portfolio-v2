import HandwrittenNote from "./HandwrittenNote";
import Squiggle from "./Squiggle";

export interface SectionIntroProps {
  note: string;
  heading: string;
  blurb?: string;
}

/**
 * Centered section opener: handwritten note + squiggle above a Fraunces
 * display heading, with an optional tilted ruled index card below.
 */
export function SectionIntro({ note, heading, blurb }: SectionIntroProps) {
  return (
    <div className="flex flex-col items-center px-5 text-center sm:px-8">
      <HandwrittenNote>{note}</HandwrittenNote>
      <Squiggle className="text-[var(--ink)]" />
      <h2 className="font-display mt-8 text-[clamp(2.8rem,7vw,4.8rem)] font-bold leading-[0.95] tracking-tight text-[var(--ink)]">
        {heading}
      </h2>
      {blurb ? (
        <p className="ruled mt-8 max-w-md -rotate-1 border border-[var(--ink)] bg-[var(--card)] px-7 pb-6 pt-9 text-left text-sm font-medium leading-[28px] text-[var(--ink)] shadow-[var(--shadow-press-sm)] sm:text-base">
          {blurb}
        </p>
      ) : null}
    </div>
  );
}

export default SectionIntro;
