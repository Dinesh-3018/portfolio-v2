import ArchivedStamp from "@/components/ui/ArchivedStamp";
import TapedImage from "@/components/ui/TapedImage";
import TicketTag from "@/components/ui/TicketTag";
import UnderlineLink from "@/components/ui/UnderlineLink";
import { ACCENT } from "@/data/site";
import type { Project } from "@/data/types";

export interface FeaturedProjectCardProps {
  project: Project;
  index: number;
}

/** Folder-tab horizontal stagger per stack position. */
const TAB_OFFSETS = ["0%", "22%", "44%", "66%"];

/** Trapezoid folder-tab silhouette, shared by the ink outline + fill layers. */
const TAB_CLIP = "polygon(44px 0, calc(100% - 44px) 0, 100% 100%, 0 100%)";

/** Three fading window dots for the folder-tab chrome. */
function WindowDots() {
  return (
    <span aria-hidden="true" className="flex flex-shrink-0 items-center gap-1.5">
      <span className="block h-2 w-2 rounded-full border-[1.5px] border-current" />
      <span className="block h-2 w-2 rounded-full border-[1.5px] border-current opacity-70" />
      <span className="block h-2 w-2 rounded-full border-[1.5px] border-current opacity-40" />
    </span>
  );
}

/**
 * One card of the sticky FEATURED WORKS stack: a trapezoid folder tab
 * (window dots + "PROJECT 0N", staggered right per index) fused to an
 * accent-colored card body — press-shadowed, ink-bordered — holding the
 * kicker dot row, Fraunces title, blurb, ticket tags, VIEW PROJECT link,
 * and the taped, postmarked cover shot.
 */
export function FeaturedProjectCard({ project, index }: FeaturedProjectCardProps) {
  const accent = ACCENT[project.accent];
  // Brown is the one accent too dark to carry ink text — treat it like a dark card.
  const dark = project.darkCard === true || project.accent === "brown";
  const cardBg = dark ? "#161616" : accent;
  const textColor = dark ? "#f5f2ea" : "var(--ink)";
  const softTextColor = dark
    ? "rgba(245, 242, 234, 0.8)"
    : "color-mix(in srgb, var(--ink) 78%, transparent)";
  // Kicker dot pops in a contrasting accent: the card's own accent on dark
  // cards, otherwise pink (blue when the card itself is pink).
  const dotColor = dark
    ? project.accent === "brown"
      ? "var(--accent-cream)"
      : accent
    : project.accent === "pink"
      ? "var(--accent-blue)"
      : "var(--accent-pink)";
  const projectNumber = String(project.order).padStart(2, "0");
  const tabLeft = `min(${TAB_OFFSETS[index % TAB_OFFSETS.length]}, calc(100% - 280px))`;

  return (
    <article
      className="relative rounded-[2px] border border-[var(--ink)]"
      style={{ background: cardBg, color: textColor, boxShadow: "var(--shadow-press-lg)" }}
    >
      {/* Folder tab: two stacked clip-path layers give the trapezoid a
          crisp ~1px ink outline (borders can't follow a clip-path). The ink
          layer paints the full silhouette; the fill layer is inset 1px on
          the top and slanted sides but runs flush past the bottom edge,
          overlapping the card's own top border by 1px so tab + card fuse
          into one piece of folder stock with no seam. Label color inherits
          the card's text color: ink on pastel tabs, #f5f2ea on dark. */}
      <div className="absolute" style={{ top: "-51px", left: tabLeft }}>
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "var(--ink)", clipPath: TAB_CLIP }}
        />
        <span
          aria-hidden="true"
          className="absolute"
          style={{
            top: "1px",
            right: "1px",
            bottom: 0,
            left: "1px",
            background: cardBg,
            clipPath: TAB_CLIP,
          }}
        />
        <div className="relative flex h-[52px] min-w-[280px] items-center justify-center gap-3 px-12">
          <WindowDots />
          <span className="font-mono text-xs uppercase tracking-[0.14em]">
            PROJECT {projectNumber}
          </span>
        </div>
      </div>

      {/* overflow-hidden guarantees the rotated TapedFrame (mat + washi
          overhang) can never escape the card body — it clips inside the ink
          border, so the tab and press shadow (siblings on the article) are
          untouched. */}
      <div className="grid gap-10 overflow-hidden rounded-[1px] p-6 sm:p-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-14">
        <div className="flex min-w-0 flex-col items-start justify-center">
          {project.archived ? <ArchivedStamp className="mb-4 opacity-90" /> : null}
          <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.16em]">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ background: dotColor }}
            />
            {project.meta.focus}
          </div>
          <h3 className="font-display mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            {project.title}
          </h3>
          <p
            className="mt-4 max-w-md text-base leading-relaxed sm:text-lg"
            style={{ color: softTextColor }}
          >
            {project.cardBlurb}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {project.tags.map((tag) => (
              // TicketTag's wash is ~86% --card, so the chips stay a light,
              // ink-legible stub on both pastel and dark card bodies.
              <TicketTag key={tag} accent={accent}>
                {tag}
              </TicketTag>
            ))}
          </div>
          <div className="mt-8">
            <UnderlineLink
              href={`/work/${project.slug}`}
              className={dark ? "text-[#f5f2ea]" : "text-[var(--ink)]"}
            >
              VIEW PROJECT<span aria-hidden="true">↗</span>
            </UnderlineLink>
          </div>
        </div>

        {/* The washi strips overhang the mat by ~26px per side and the
            rotation adds a few more px, which outruns the card's p-6 (24px)
            on mobile — the inner px/pt reserves that overhang below sm,
            where the card padding (40px+) already covers it. */}
        <div className="min-w-0 px-2 pt-2 sm:px-0 sm:pt-0">
          <TapedImage
            image={project.cover}
            rotate={index % 2 ? 0.75 : -0.75}
            postmark
            className="aspect-[4/3] w-full md:aspect-auto md:h-[440px]"
            imgClassName="object-top"
          />
        </div>
      </div>
    </article>
  );
}

export default FeaturedProjectCard;
