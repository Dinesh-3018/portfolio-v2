import Link from "next/link";
import type { Project } from "@/data/types";
import { ACCENT } from "@/data/site";
import ArchivedStamp from "@/components/ui/ArchivedStamp";
import HandwrittenNote from "@/components/ui/HandwrittenNote";
import Postmark from "@/components/ui/Postmark";
import StampBadge from "@/components/ui/StampBadge";
import TicketTag from "@/components/ui/TicketTag";
import DossierTable from "./DossierTable";

export interface DossierHeaderProps {
  project: Project;
}

/**
 * Case-study document cover: a ruled CASE FILE header row with the
 * project's Nº rubber stamp and a FILED postmark, then the Fraunces
 * title, tagline, ticket-tag row and the stamped dossier info table.
 */
export function DossierHeader({ project }: DossierHeaderProps) {
  const accent = ACCENT[project.accent];

  return (
    <section className="px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/work"
          data-hide-cursor="true"
          className="group relative mb-9 inline-flex w-fit items-center gap-2 pb-1 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-pink)] motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            className="text-sm transition-transform duration-300 ease-out group-hover:-translate-x-1 motion-reduce:transition-none"
          >
            ←
          </span>
          All works
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-full origin-left scale-x-0 border-b-[1.5px] border-dashed border-current transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
          />
        </Link>
        <div className="flex items-start justify-between gap-6 border-t-2 border-[var(--ink)] pt-5">
          <p className="flex flex-wrap items-center gap-4 pt-1 font-mono text-sm font-semibold tracking-[0.2em] text-[var(--ink)]">
            CASE FILE
            <StampBadge rotate={-3}>Nº {String(project.order).padStart(2, "0")}</StampBadge>
            {project.archived ? (
              <ArchivedStamp className="text-[var(--ink-soft)]" />
            ) : null}
          </p>
          <Postmark
            tone={project.archived ? "red" : "ink"}
            label={project.archived ? "ARCHIVED" : "FILED"}
            size={80}
            className="-mt-2 shrink-0"
          />
        </div>

        <h1 className="font-display mt-8 text-[clamp(2.6rem,7vw,5.6rem)] font-bold leading-[0.98] tracking-tight text-[var(--ink)]">
          {project.title}
        </h1>
        <p className="mt-6 max-w-xl text-xl leading-snug text-[var(--ink)]">{project.tagline}</p>
        {project.archived ? (
          <HandwrittenNote rotate={-1.5} className="mt-4 block text-xl text-[var(--ink-soft)]">
            an archived build from an earlier chapter — kept here for the record
          </HandwrittenNote>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {project.tags.map((tag) => (
            <TicketTag key={tag} accent={accent}>
              {tag}
            </TicketTag>
          ))}
        </div>

        <DossierTable meta={project.meta} className="mt-12" />
      </div>
    </section>
  );
}

export default DossierHeader;
