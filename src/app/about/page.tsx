import Link from "next/link";
import SideNav from "@/components/about/SideNav";
import BioSection from "@/components/about/BioSection";
import StoryBook from "@/components/about/StoryBook";
import Principles from "@/components/about/Principles";
import Timeline from "@/components/about/Timeline";
import BucketList from "@/components/desk/BucketList";
import Turntable from "@/components/desk/Turntable";
import LetsTalk from "@/components/ui/LetsTalk";
import HandwrittenNote from "@/components/ui/HandwrittenNote";
import Reveal from "@/components/ui/Reveal";
import { ScribbleUnderline } from "@/components/ui/Scribble";
import { profile } from "@/data/profile";

export const metadata = { title: "About - Dinesh Ganesan" };

/** Mono section eyebrow used by the off-duty row below the logbook. */
function Eyebrow({ id, children }: { id: string; children: React.ReactNode }) {
	return (
		<h2
			id={id}
			className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]"
		>
			{children}
		</h2>
	);
}

export default function AboutPage() {
	return (
		<div className="min-h-screen text-[var(--ink)]">
			<SideNav />
			<div className="mx-auto max-w-4xl px-5 pb-14 pt-16 sm:px-8 sm:pt-20">
				<Reveal>
					<h1 className="font-display relative inline-block text-[clamp(3.2rem,10vw,7rem)] font-extrabold leading-none tracking-tight text-[var(--ink)]">
						ABOUT
						<ScribbleUnderline className="absolute -bottom-3 left-0 h-[0.16em] w-full text-[var(--accent-pink)]" />
					</h1>
				</Reveal>
			</div>
			<BioSection />

			{/* ---- MY STORY: page-turn journal ---- */}
			<section
				id="story"
				aria-labelledby="story-heading"
				className="scroll-mt-28 px-5 pt-24 sm:px-8"
			>
				<div className="mx-auto max-w-4xl">
					<Reveal>
						<p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
							MY STORY —
						</p>
						<h2
							id="story-heading"
							className="font-display relative mt-3 inline-block text-4xl font-semibold leading-none tracking-tight text-[var(--ink)] sm:text-5xl"
						>
							How I got here
							<ScribbleUnderline className="absolute -bottom-2 left-0 h-[0.14em] w-full text-[var(--accent-pink)]" />
						</h2>
						<HandwrittenNote
							rotate={-1.5}
							className="mt-4 text-xl text-[var(--ink)]/70 sm:text-2xl"
						>
							turn the pages, one at a time
						</HandwrittenNote>
					</Reveal>
					<Reveal delay={2} className="mt-8">
						<StoryBook />
					</Reveal>
				</div>
			</section>

			<Principles />
			<Timeline />

			{/* ---- Off-duty row: bucket list + turntable share a row on lg ---- */}
			<div className="mx-auto grid max-w-6xl gap-16 px-5 pb-12 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
				<section aria-labelledby="bucket-list-heading">
					<Reveal>
						<Eyebrow id="bucket-list-heading">BUCKET LIST —</Eyebrow>
						<HandwrittenNote
							rotate={-1.5}
							className="mt-3 text-xl text-[var(--ink)]/70 sm:text-2xl"
						>
							kept in pencil on purpose
						</HandwrittenNote>
					</Reveal>
					<Reveal delay={2} className="mt-6">
						<BucketList />
					</Reveal>
				</section>

				<section aria-labelledby="turntable-heading">
					<Reveal delay={1}>
						<Eyebrow id="turntable-heading">ON THE TURNTABLE —</Eyebrow>
						<HandwrittenNote
							rotate={1.5}
							className="mt-3 text-xl text-[var(--ink)]/70 sm:text-2xl"
						>
							the desk hums along
						</HandwrittenNote>
					</Reveal>
					<Reveal delay={3} className="mt-6">
						<Turntable />
					</Reveal>
				</section>
			</div>

			{/* ---- Closing thank-you quote ---- */}
			<section aria-label="A note of thanks" className="px-5 py-16 sm:px-8">
				<Reveal className="mx-auto max-w-3xl text-center">
					<span
						aria-hidden="true"
						className="font-display block text-[5rem] leading-[0.5] text-[var(--accent-pink)]/35"
					>
						&ldquo;
					</span>
					<p className="font-display mt-3 text-2xl font-medium italic leading-snug text-[var(--ink)] sm:text-[2rem] sm:leading-[1.32]">
						{profile.quote}
					</p>
					<HandwrittenNote
						rotate={-1.5}
						className="mt-7 inline-block text-2xl text-[var(--ink-soft)]"
					>
						I&apos;m grateful for every one of you.
					</HandwrittenNote>
				</Reveal>
			</section>

			<LetsTalk />

			{/* ---- Small handwritten pointer to the visitor log ---- */}
			<div className="px-5 pb-20 sm:px-8">
				<Reveal className="mx-auto flex max-w-4xl justify-center">
					<Link
						href="/guestbook"
						data-hide-cursor="true"
						className="font-hand inline-block -rotate-1 rounded-[3px] px-1 text-2xl leading-snug text-[var(--ink)]/85 underline decoration-dashed decoration-[1.5px] underline-offset-4 transition-colors duration-200 hover:text-[var(--accent-pink-ink)] hover:decoration-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-pink)] motion-reduce:transition-none sm:text-3xl"
					>
						passing through? sign the visitor log{" "}
						<span aria-hidden="true">→</span>
					</Link>
				</Reveal>
			</div>
		</div>
	);
}
