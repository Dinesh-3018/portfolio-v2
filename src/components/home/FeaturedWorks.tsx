import Reveal from "@/components/ui/Reveal";
import SectionIntro from "@/components/ui/SectionIntro";
import UnderlineLink from "@/components/ui/UnderlineLink";
import { profile } from "@/data/profile";
import { featuredProjects } from "@/data/projects";
import FeaturedProjectCard from "./FeaturedProjectCard";

/**
 * FEATURED WORKS: section intro (Fraunces heading over a ruled index-card
 * blurb), then the featured projects as a sticky stack of folder-tab
 * cards — each card pins below the header and the next one slides over
 * it, tabs staggering rightward like a card index — closed by a link to
 * the full work archive.
 */
export function FeaturedWorks() {
  return (
    <section className="px-5 pb-28 pt-6 sm:px-8">
      <Reveal>
        <SectionIntro
          note="where it all started!"
          heading="FEATURED WORKS"
          blurb={profile.featuredBlurb}
        />
      </Reveal>

      {/* The sticky wrappers must NOT sit inside Reveal (or any transformed
          ancestor): a transform turns that ancestor into the containing
          block and kills position: sticky. The pt-[52px] reserves the
          folder-tab band. The stack only pins from md — below that a
          stacked card (~650-740px) is taller than the space under any
          sane pin point on a phone, so the cover would sit forever below
          the fold; static cards with a normal margin let each one scroll
          fully into view while keeping the tab collage. From md the
          viewport-relative bottom margin is the stacking rhythm — each
          card dwells pinned before the next rides over it. md:top-28
          (112px) clears the dock while fitting the two-column card on a
          768px-tall landscape tablet; xl:top-44 restores the roomier
          176px desktop offset. */}
      <div className="mx-auto mt-20 max-w-6xl">
        {featuredProjects.map((project, index) => (
          <div
            key={project.slug}
            className="mb-16 pt-[52px] last:mb-0 md:sticky md:top-28 md:mb-[45vh] xl:top-44"
            style={{ zIndex: index + 1 }}
          >
            <FeaturedProjectCard project={project} index={index} />
          </div>
        ))}
        {/* In-flow spacer, NOT container padding: sticky children are
            clamped to the parent's content box, so only real flow content
            extends their range. This lets the finished stack dwell pinned,
            then unpin cleanly before the ALL WORK link scrolls up. Only
            needed where the stack actually pins (md+). */}
        <div aria-hidden="true" className="hidden h-[22vh] md:block" />
      </div>

      <Reveal className="mt-20 flex justify-center sm:mt-24">
        <UnderlineLink href="/work" className="text-[var(--ink)]">
          ALL WORK<span aria-hidden="true">→</span>
        </UnderlineLink>
      </Reveal>
    </section>
  );
}

export default FeaturedWorks;
