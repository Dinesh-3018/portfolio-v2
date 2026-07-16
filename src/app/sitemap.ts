import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

const SITE_URL = "https://dineshg.xyz";

/** Static pages plus one entry per project case study. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/guestbook`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  const caseStudies: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/work/${project.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...pages, ...caseStudies];
}
