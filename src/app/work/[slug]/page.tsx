import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LetsTalk from "@/components/ui/LetsTalk";
import CaseChapters from "@/components/work/CaseChapters";
import DossierHeader from "@/components/work/DossierHeader";
import { getProject, projects } from "@/data/projects";

interface CaseStudyParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: CaseStudyParams): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) {
    return { title: "Case Study Not Found - Dinesh Ganesan" };
  }
  return {
    title: `${project.title} - Dinesh Ganesan`,
    description: project.tagline,
  };
}

export default async function CaseStudyPage({ params }: CaseStudyParams) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="min-h-screen text-[var(--ink)]">
      <article>
        <DossierHeader project={project} />
        <CaseChapters project={project} />
      </article>
      <LetsTalk />
    </div>
  );
}
