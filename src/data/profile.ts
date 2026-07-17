import type { Profile } from "./types";

// Real content for Dinesh Ganesan, sourced from his resume.
export const profile: Profile = {
	name: "DINESH G",
	initials: "DG",
	role: "FULL STACK DEVELOPER",
	location: "BLR · IST",
	availability: "OPEN TO FULL-TIME SDE ROLES",
	email: "me@dineshg.xyz",
	resumeUrl: "https://tinyurl.com/dinesh3018",
	socials: [
		{ label: "GITHUB", href: "https://github.com/Dinesh-3018" },
		{
			label: "LINKEDIN",
			href: "https://www.linkedin.com/in/dinesh-g-28b71b199/",
		},
	],
	employerPills: ["Currently at Southern Guild", "Previously at Saptang Labs"],
	introStatement: {
		lead: "I build fast, scalable web apps end to end — from Postgres schemas holding millions of records to the React interfaces sitting on top.",
	},
	aboutTeaser: {
		lead: "I'm Dinesh G, a full stack developer from CBE, now based in BLR,",
		paragraphs: [
			"Right now I'm a Software Engineer at Southern Guild, Making healthcare products scale, one feature—and one Zitadel bug—at a time.",
			"Before this, I was at Saptang Labs building tools that watched 4,500 Telegram channels and convincing our micro-frontend builds to finish 25% sooner.",
		],
		skillAreas: [
			"SaaS Products",
			"Product Engineering",
			"Scalable Backends",
			"APIs & Microservices",
			"Auth & Identity",
			"Full-Stack",
		],
	},
	about: {
		headline:
			"I grew up wanting to be the software engineer from Tamil cinema. The background music never showed up, but the bugs did.",
		paragraphs: [
			"As a kid, I wanted to be the software engineer from a Tamil movie—the one who flew back from the US with a laptop and big ideas. That dream led me to robotics, PC builds, and eventually a last-minute AI & Data Science choice in college. Turns out, it became my career.",
			"These days I'm a full stack developer at Southern Guild, based in Bangalore now though I grew up in Coimbatore. I build the way I learned to at school — as a team, owning the whole thing instead of a slice. I'll take a feature from the first schema migration to the query that runs 12× faster to the interface people actually touch.",
			"The concrete version: at Southern Guild, I wrestled Zitadel into a reusable auth SDK built straight from the docs, making the integration fully dynamic and configurable. I also scaled a NestJS backend handling 6M+ PostgreSQL records (40% faster) and cut natural-language search latency from 250ms to 20ms.",
			"Curiosity gets me into rabbit holes. Good questions get me out. I still think the best products are the ones that save someone even a single paisa.",
		],
		portraitNote: "it's me",
	},
	featuredBlurb:
		"Two early builds I'm keeping on the shelf — the ones that first taught me to ship for the web. This is v2 of my portfolio, and fresh work is on the way; these are where it started.",
	allWorksBlurb:
		"The shelf's being restocked. For now, a couple of archived builds from when I was first learning to ship — with new projects landing here soon.",
	letsTalkBlurb:
		"Always interested in ambitious products where I can own features end to end. Email is the fastest way to reach me. I'm on IST but happy to overlap with other time zones.",
	comment: {
		blurb:
			"Building products where the whole stack matters? I'd love to hear what you're working on.",
		reactions: 1,
	},
	quote:
		"Almost everyone I've met has taught me something — how to communicate, how money works, what love is. I'm still learning.",
};
