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
    slug: "buddyflare",
    order: 3,
    title: "Buddyflare",
    tagline: "Open-source logs and alerts that run inside your own Cloudflare account — with a closed beta planned for the end of September 2026.",
    cardBlurb: "A self-hosted observability stack for realtime logs, searchable history, alerts, and agent-readable production context.",
    tags: ["CLOUDFLARE", "OBSERVABILITY", "BETA SEP 2026"],
    accent: "blue",
    archived: false,
    featured: true,
    cover: { src: "/images/projects/buddyflare.png", alt: "Buddyflare — Cloudflare-native logs and alerts" },
    gallery: [
      { src: "/images/projects/buddyflare.png", alt: "Buddyflare — Cloudflare-native logs and alerts" },
    ],
    meta: {
      role: "Creator · Solo build",
      platform: "Cloudflare Workers · Durable Objects",
      focus: "Logs · Alerts · MCP",
      live: { label: "VISIT SITE", href: "https://buddy-clouds-site.dineshg3018.workers.dev/" },
    },
    problem: [
      "Cloudflare's built-in Worker logs are useful for recent debugging, but small teams still need alerting, longer history, and one place to inspect production signals across their apps.",
      "Traditional observability platforms can introduce another vendor, another server, and a bill that grows with data volume. I wanted the useful parts of that stack to live in the same Cloudflare account as the applications it watches.",
    ],
    approach: [
      "I built Buddyflare as an open-source, serverless observability stack on Cloudflare Workers, Durable Objects, D1, R2, and Queues. Logs stream to the dashboard in realtime and archive into the owner's own infrastructure.",
      "The product stays deliberately focused: searchable logs, practical alert channels, visible usage costs, and an MCP server that lets coding agents inspect production context without putting another hosted vendor in the middle.",
    ],
    built: [
      "Realtime live tail with searchable log history stored in the user's Cloudflare account.",
      "Alert delivery to Slack, Discord, Telegram, email, webhooks, PagerDuty, and Opsgenie.",
      "OpenTelemetry, Loki JSON, Vercel drain, and native JSON ingestion paths.",
      "A built-in MCP server for scoped, agent-readable production logs.",
    ],
    changed: [
      "Turns the missing alerting and longer-term memory around Workers logs into a deployable product.",
      "Keeps ownership, infrastructure, and metered usage inside the user's Cloudflare account.",
      "Closed beta is planned for the end of September 2026.",
    ],
  },
  {
    slug: "voice-agent",
    order: 4,
    title: "Voice Agent",
    tagline: "An in-progress multilingual voice agent exploring lower-cost conversations with room for higher concurrency.",
    cardBlurb: "An Azure-based voice experiment focused on making multilingual agents less expensive to run and easier to scale.",
    tags: ["VOICE AI", "AZURE", "IN PROGRESS"],
    accent: "orange",
    archived: false,
    featured: true,
    cover: { src: "/images/projects/placeholder.svg", alt: "Voice Agent — multilingual voice AI project under construction" },
    gallery: [
      { src: "/images/projects/placeholder.svg", alt: "Voice Agent — multilingual voice AI project under construction" },
    ],
    meta: {
      role: "Solo R&D",
      platform: "Azure AI · Realtime voice",
      focus: "Multilingual · Cost · Scale",
    },
    problem: [
      "Multilingual voice agents become expensive quickly, especially when every live conversation holds realtime speech and model capacity. Concurrency limits can become a product constraint before the experience is ready to scale.",
      "I'm exploring whether the voice pipeline can be broken into more efficient pieces so each conversation costs less while the system supports more simultaneous sessions.",
    ],
    approach: [
      "The project experiments with Azure speech and language models, measuring where latency, model usage, and session limits accumulate across a multilingual conversation.",
      "The goal is a practical architecture that routes each part of the voice loop deliberately instead of paying the highest realtime cost for every stage. The implementation is still under construction, so results will be documented as they become repeatable.",
    ],
    built: [
      "An evolving Azure-based pipeline for multilingual voice conversations.",
      "Cost and concurrency experiments across the realtime voice loop.",
      "A project structure ready to document benchmarks and trade-offs as the build matures.",
    ],
    changed: [
      "Still under construction — no public demo or repository yet.",
      "The current focus is proving a lower-cost path to multilingual voice at higher concurrency.",
    ],
  },
];

export const featuredProjects: Project[] = projects
  .filter((p) => p.featured && !p.archived)
  .sort((a, b) => a.order - b.order);

export function sortProjectsNewestFirst<T extends Pick<Project, "order">>(
  collection: readonly T[]
): T[] {
  return [...collection].sort((a, b) => b.order - a.order);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
