export type Accent = "blue" | "pink" | "yellow" | "green" | "mint" | "cream" | "brown" | "orange";

export interface Social { label: string; href: string }

export interface Profile {
  name: string;
  initials: string;
  role: string;
  location: string;
  availability: string;
  email: string;
  /** Public resume/CV link, shown as a "check my resume" call-to-action. */
  resumeUrl: string;
  socials: Social[];
  employerPills: string[];
  introStatement: { lead: string };
  aboutTeaser: { lead: string; paragraphs: string[]; skillAreas: string[] };
  about: { headline: string; paragraphs: string[]; portraitNote: string };
  featuredBlurb: string;
  allWorksBlurb: string;
  letsTalkBlurb: string;
  comment: { blurb: string; reactions: number };
  /** Closing thank-you quote shown near the bottom of the About page. */
  quote: string;
}

export interface ProjectImage { src: string; alt: string }

export interface Project {
  slug: string;
  order: number;
  title: string;
  tagline: string;
  cardBlurb: string;
  tags: string[];
  accent: Accent;
  darkCard?: boolean;
  featured?: boolean;
  /** Older shelved builds — surfaced with an ARCHIVED marker in the UI. */
  archived?: boolean;
  cover: ProjectImage;
  gallery: ProjectImage[];
  meta: { role: string; platform: string; focus: string; live?: { label: string; href: string } };
  problem: string[];
  approach: string[];
  built: string[];
  changed: string[];
}

export interface TimelineEntry {
  company: string;
  url?: string;
  role: string;
  description: string;
  period: string;
  accent: Accent;
  /** Groups the entry under EXPERIENCE (default) or EDUCATION. */
  kind?: "work" | "education";
}

export interface Principle { title: string; body: string; takeaway: string; accent: Accent }
export interface SkillGroup { label: string; items: string[] }
