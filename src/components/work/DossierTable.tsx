import type { Project } from "@/data/types";
import UnderlineLink from "@/components/ui/UnderlineLink";

export interface DossierTableProps {
  meta: Project["meta"];
  className?: string;
}

/**
 * Stamped case-file info block: one hard-shadowed card divided into four
 * cells (ROLE / PLATFORM / FOCUS / LIVE) by 1px ink rules. LIVE links out
 * when the project has a public URL.
 */
export function DossierTable({ meta, className }: DossierTableProps) {
  const cells: { label: string; content: React.ReactNode }[] = [
    { label: "ROLE", content: meta.role },
    { label: "PLATFORM", content: meta.platform },
    { label: "FOCUS", content: meta.focus },
    {
      label: "LIVE",
      content: meta.live ? (
        <UnderlineLink href={meta.live.href} external className="text-[var(--ink)]">
          {meta.live.label}
          <span aria-hidden="true">↗</span>
        </UnderlineLink>
      ) : (
        "Private build"
      ),
    },
  ];

  return (
    <dl
      className={[
        "grid border-2 border-[var(--ink)] bg-[var(--card)] shadow-[var(--shadow-press)] md:grid-cols-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className={[
            "px-5 py-4",
            i > 0 ? "border-t border-[var(--ink)] md:border-l md:border-t-0" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            {cell.label}
          </dt>
          <dd className="mt-1.5 text-[15px] leading-snug text-[var(--ink)]">{cell.content}</dd>
        </div>
      ))}
    </dl>
  );
}

export default DossierTable;
