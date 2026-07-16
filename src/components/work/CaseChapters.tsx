"use client";

import { Fragment, useState } from "react";
import type { Project } from "@/data/types";
import TapedImage from "@/components/ui/TapedImage";
import CaseSection from "./CaseSection";
import Lightbox from "./Lightbox";

export interface CaseChaptersProps {
  project: Project;
}

/**
 * The case-study body: full-bleed taped screenshots (each cancelled with a
 * FIG. 0N postmark) interleaved BETWEEN the prose chapters (image → The
 * Real Problem → image → The Approach → image → What I Built → image →
 * What Changed). Any screenshots beyond the chapter count trail after the
 * last chapter. Clicking a screenshot opens the Lightbox at that image.
 */
export function CaseChapters({ project }: CaseChaptersProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { gallery } = project;

  const chapters = [
    { title: "The Real Problem", variant: "prose" as const, items: project.problem },
    { title: "The Approach", variant: "prose" as const, items: project.approach },
    { title: "What I Built", variant: "list" as const, items: project.built },
    { title: "What Changed", variant: "list" as const, items: project.changed },
  ];

  const screenshot = (index: number) => {
    const image = gallery[index];
    if (!image) return null;
    // overflow-x-clip trims the washi tape's offscreen right overhang (page
    // overflow at phone widths) while leaving the upward tape peek visible.
    return (
      <div className="overflow-x-clip px-5 sm:px-8">
        <button
          type="button"
          onClick={() => setOpenIndex(index)}
          aria-label={`View larger: ${image.alt}`}
          className="group block w-full text-left [@media(hover:hover)]:cursor-zoom-in"
        >
          <TapedImage
            image={image}
            priority={index === 0}
            postmark={`FIG. ${String(index + 1).padStart(2, "0")}`}
            className="aspect-[16/10] w-full sm:aspect-[2/1]"
            imgClassName="object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        </button>
      </div>
    );
  };

  return (
    <>
      {chapters.map((chapter, i) => (
        <Fragment key={chapter.title}>
          {screenshot(i)}
          <CaseSection
            title={chapter.title}
            number={i + 1}
            variant={chapter.variant}
            items={chapter.items}
          />
        </Fragment>
      ))}
      {gallery.slice(chapters.length).map((image, i) => (
        <Fragment key={`${image.src}-${i}`}>{screenshot(chapters.length + i)}</Fragment>
      ))}
      {openIndex !== null ? (
        <Lightbox images={gallery} initialIndex={openIndex} onClose={() => setOpenIndex(null)} />
      ) : null}
    </>
  );
}

export default CaseChapters;
