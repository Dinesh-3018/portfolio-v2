import type { Project } from "./types";

// Real projects. Two archived builds carried over from an earlier chapter
// (Buddy Blog, Uzhavan) plus one placeholder slot that Dinesh will fill with
// current work. Slugs, order numbers, accents, and featured/archived flags are
// load-bearing (routes and layout depend on them); edit the prose freely.
export const projects: Project[] = [
  {
    slug: "buddy-blog",
    order: 1,
    title: "Buddy Blog",
    tagline: "A simple blogging app — and the project where I actually learned to build for the web.",
    cardBlurb: "My first real front-end build: a clean, responsive blog where writing is the whole interface.",
    tags: ["WEB", "FRONTEND", "HTML/CSS/JS"],
    accent: "pink",
    featured: true,
    archived: true,
    cover: { src: "/images/projects/buddy-blog.png", alt: "Buddy Blog — home page of a personal blogging app" },
    gallery: [
      { src: "/images/projects/buddy-blog.png", alt: "Buddy Blog — home page of a personal blogging app" },
    ],
    meta: {
      role: "Solo build — first web project",
      platform: "Web · HTML/CSS/JS",
      focus: "Frontend · Responsive",
      live: { label: "GITHUB", href: "https://github.com/Dinesh-3018/Buddyb" },
    },
    problem: [
      "I'd read plenty about web development, but reading isn't building. I wanted one small thing I could take end to end — something with a real layout, real content, and a reason to care whether it looked right on a phone. A blog was the honest choice: nothing fancy, just words that had to read well everywhere.",
      "The catch was that I didn't yet know the difference between code that works and code the next person can follow. So the real problem wasn't \"make a blog\" — it was learning to structure HTML, CSS, and JavaScript so the thing stayed sane as it grew.",
    ],
    approach: [
      "I built it from scratch with plain HTML, CSS, and JavaScript — no framework to hide behind. That was deliberate: I wanted to feel the box model, the cascade, and the DOM directly before reaching for anything that abstracts them away.",
      "I kept the layout simple and reader-first, then made it responsive so a post looked as good on a phone as on a laptop. Every time something felt hacky, I stopped and rewrote it cleaner — that habit stuck with me long after this project.",
    ],
    built: [
      "A responsive blog layout that holds up from phone to desktop.",
      "Hand-written HTML/CSS/JS with a clean, reader-first structure.",
      "A reusable post layout so adding writing didn't mean rewriting markup.",
    ],
    changed: [
      "This is where the web stopped being theory and became something I could actually make.",
      "It taught me to write markup and styles for the next person, not just for the browser — a habit I still carry.",
      "Kept on the shelf as the honest starting line: my first real thing shipped to the web.",
    ],
  },
  {
    slug: "uzhavan",
    order: 2,
    title: "Uzhavan",
    tagline: "A modern way for farmers to sell straight to customers — and my first real React build.",
    cardBlurb: "A farmer-to-customer marketplace built with Team Learners, aimed at cutting the middleman out of fresh produce.",
    tags: ["REACT", "MARKETPLACE", "TEAM"],
    accent: "green",
    featured: true,
    archived: true,
    cover: { src: "/images/projects/uzhavan.png", alt: "Uzhavan — landing page for a farmers' marketplace" },
    gallery: [
      { src: "/images/projects/uzhavan.png", alt: "Uzhavan — landing page for a farmers' marketplace" },
    ],
    meta: {
      role: "Developer · Team Learners",
      platform: "Web · React",
      focus: "Marketplace · Frontend",
      live: { label: "GITHUB", href: "https://github.com/Dinesh-3018/uzhavanLanding" },
    },
    problem: [
      "Farmers grow the food but capture the least of its price. By the time produce reaches a customer it has passed through layers of middlemen, each taking a cut, and the grower is left with whatever's left over. We wanted to see how much of that gap software could close.",
      "The idea was Uzhavan — a platform where farmers list and sell directly, with the produce routed through cold storage instead of a chain of resellers. If we could remove the middle layer, more of the money would land where the work happened.",
    ],
    approach: [
      "We built it as a team, Team Learners, and I worked on the React front end — the farmer-facing self-service side where produce gets listed and browsed. It was my first real React project, so I was learning components, state, and the marketplace flow while shipping it.",
      "We leaned on a cold-storage model to keep produce fresh between grower and buyer, and kept the farmer's path deliberately simple — even down to adding products over SMS — because the people using it wouldn't all be sitting at a laptop.",
    ],
    built: [
      "A React front end for the farmer-facing marketplace and self-service listing.",
      "A cold-storage-backed model that routes produce around the usual reseller chain.",
      "A low-friction way to add products — including over SMS — for farmers off the desktop.",
      "Supporting pages: schemes, educational material, and a produce-price view.",
    ],
    changed: [
      "It aimed to cut the commission that middlemen skim off fresh produce and return that margin to the farmer.",
      "My first real taste of React and of building something as a team, owning a slice while the whole thing came together.",
      "Kept on the shelf — the project that taught me component-thinking and why the user's context shapes the design.",
    ],
  },
  {
    slug: "in-the-works",
    order: 3,
    title: "In the works",
    tagline: "A new build is taking shape here — the full case file lands soon.",
    cardBlurb: "Reserved for something I'm building right now. Real screenshots and the write-up drop in shortly.",
    tags: ["IN PROGRESS"],
    accent: "yellow",
    archived: false,
    cover: { src: "/images/projects/placeholder.svg", alt: "In the works — a placeholder for an upcoming project" },
    gallery: [
      { src: "/images/projects/placeholder.svg", alt: "In the works — a placeholder for an upcoming project" },
    ],
    meta: {
      role: "Solo build",
      platform: "TBA",
      focus: "Coming soon",
    },
    problem: [
      "This slot is a placeholder. There's a project in progress that I'll write up properly here — the problem it solves, how I approached it, and what shipped.",
    ],
    approach: [
      "Details are on the way. Check back soon for the real screenshots and the full story behind this build.",
    ],
    built: [
      "Full write-up coming soon.",
    ],
    changed: [
      "Watch this space.",
    ],
  },
];

export const featuredProjects: Project[] = projects
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
