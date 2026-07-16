import { profile } from "@/data/profile";
import { ACCENT_INK } from "./accentInk";
import HandwrittenNote from "./HandwrittenNote";
import PostcardTilt from "./PostcardTilt";
import Postmark from "./Postmark";
import Reveal from "./Reveal";
import { ScribbleUnderline } from "./Scribble";

/* ---------------------------------------------------------------- */
/* Perforated postage stamps (shared construction)                   */
/* ---------------------------------------------------------------- */

/** Perforation holes punched into all four edges (layers intersect). */
const STAMP_MASK: React.CSSProperties = {
	maskImage:
		"radial-gradient(circle 3px at 8px 0, transparent 3px, black 3.5px), radial-gradient(circle 3px at 8px 100%, transparent 3px, black 3.5px), radial-gradient(circle 3px at 0 8px, transparent 3px, black 3.5px), radial-gradient(circle 3px at 100% 8px, transparent 3px, black 3.5px)",
	maskSize: "16px 100%, 16px 100%, 100% 16px, 100% 16px",
	maskRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
	maskComposite: "intersect",
};

const DOODLE_STROKE = {
	stroke: "currentColor",
	strokeWidth: 1.6,
	strokeLinecap: "round" as const,
	strokeLinejoin: "round" as const,
	fill: "none",
};

function PlaneDoodle({ className = "h-8 w-8" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
			<path d="M2.5 11.5 21.5 3.5 14.5 20.5 11 13.5Z" {...DOODLE_STROKE} />
			<path d="M21.5 3.5 11 13.5" {...DOODLE_STROKE} />
		</svg>
	);
}

function CoffeeDoodle({ className = "h-8 w-8" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
			<path d="M5 10h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" {...DOODLE_STROKE} />
			<path d="M16 11.5h1.5a2.5 2.5 0 0 1 0 5H16" {...DOODLE_STROKE} />
			<path
				d="M8.5 7c0-1.4 1-1.6 1-3M12.5 7c0-1.4 1-1.6 1-3"
				{...DOODLE_STROKE}
			/>
		</svg>
	);
}

function KeyboardDoodle({ className = "h-8 w-8" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
			<rect x="2.5" y="7" width="19" height="10" rx="1.5" {...DOODLE_STROKE} />
			<path
				d="M5.5 10.5h2M9.5 10.5h2M13.5 10.5h2M17.5 10.5h1M7 14h10"
				{...DOODLE_STROKE}
			/>
		</svg>
	);
}

function WrenchDoodle({ className = "h-8 w-8" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
			<path
				d="M20.7 6.2a5 5 0 0 1-6.5 6.5l-7 7a2 2 0 1 1-2.9-2.9l7-7a5 5 0 0 1 6.5-6.5L14.6 6.5l2.9 2.9z"
				{...DOODLE_STROKE}
			/>
		</svg>
	);
}

interface PostageStampProps {
	/** Pastel accent for the stamp's wash background. */
	accent: string;
	/** Text-safe dark relative that inks the doodle, denom, and label. */
	ink: string;
	denom: string;
	label: string;
	children: React.ReactNode;
	className?: string;
}

/** One perforated postage stamp: pastel wash, denom corner, doodle, label. */
function PostageStamp({
	accent,
	ink,
	denom,
	label,
	children,
	className,
}: PostageStampProps) {
	return (
		<div
			className={[
				"relative flex aspect-[5/6] flex-col items-center justify-center gap-1.5 p-3",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			style={{
				color: ink,
				background: `color-mix(in srgb, ${accent} 16%, var(--card))`,
				...STAMP_MASK,
			}}
		>
			<span className="absolute right-2.5 top-2 font-mono text-[10px] font-bold tabular-nums">
				{denom}
			</span>
			{children}
			<span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em]">
				{label}
			</span>
		</div>
	);
}

/* ---------------------------------------------------------------- */
/* Decorative mini stamp row                                         */
/* ---------------------------------------------------------------- */

interface MiniStampDef {
	accent: string;
	ink: string;
	denom: string;
	label: string;
	doodle: React.ReactNode;
	/** Resting tilt; hover springs to the opposite lean. */
	base: string;
	tilt: string;
}

const MINI_STAMPS: MiniStampDef[] = [
	{
		accent: "var(--accent-pink)",
		ink: ACCENT_INK.pink,
		denom: "02",
		label: "FIRST CLASS",
		doodle: <CoffeeDoodle className="h-7 w-7" />,
		base: "-2deg",
		tilt: "2deg",
	},
	{
		accent: "var(--accent-yellow)",
		ink: ACCENT_INK.yellow,
		denom: "03",
		label: "REGISTERED",
		doodle: <KeyboardDoodle className="h-7 w-7" />,
		base: "0deg",
		tilt: "-2deg",
	},
	{
		accent: "var(--accent-green)",
		ink: ACCENT_INK.green,
		denom: "04",
		label: "EXPRESS",
		doodle: <WrenchDoodle className="h-7 w-7" />,
		base: "2deg",
		tilt: "-2deg",
	},
];

/* ---------------------------------------------------------------- */
/* Scoped choreography                                               */
/* ---------------------------------------------------------------- */

/**
 * Postcard + stamp-row choreography. The card link (.lt-card) drives
 * everything through hover/focus-visible: it lifts on its own translate
 * (composing with PostcardTilt's rotateX/rotateY on the parent), thumps
 * the cancellation postmark onto the postage stamp, dips the stamp a
 * degree and a half, and draws the pink scribble under the last
 * handwritten line. Independent translate/scale/rotate properties keep
 * the layers from fighting. Hover rules are gated to hover-capable
 * pointers; the reduced-motion block comes LAST so it wins the
 * specificity ties and collapses everything to instant state changes.
 */
const LT_CSS = `
.lt-card {
  rotate: -1deg;
  box-shadow: var(--shadow-press-lg);
  transition:
    translate 0.3s ease-out,
    box-shadow 0.3s ease-out;
}
.lt-postage {
  rotate: 2deg;
  transition: rotate 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.lt-cancel {
  opacity: 0;
  transition: opacity 0.16s ease-out;
}
.lt-scribble path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}
.lt-mini {
  rotate: var(--lt-base, 0deg);
  transition:
    translate 0.45s cubic-bezier(0.33, 1, 0.68, 1),
    scale 0.45s cubic-bezier(0.33, 1, 0.68, 1),
    rotate 0.45s cubic-bezier(0.33, 1, 0.68, 1),
    box-shadow 0.45s ease;
}
@keyframes lt-postmark-thump {
  0% { transform: scale(1.65) rotate(9deg); }
  55% { transform: scale(0.94) rotate(-2deg); }
  78% { transform: scale(1.02) rotate(0.5deg); }
  100% { transform: none; }
}
@keyframes lt-scribble-hover-draw {
  to { stroke-dashoffset: 0; }
}
@media (hover: hover) {
  .lt-card:hover {
    translate: 0 -4px;
    box-shadow: var(--shadow-press-lg), var(--shadow-lift);
  }
  .lt-card:hover .lt-postage {
    rotate: 3.5deg;
  }
  .lt-card:hover .lt-cancel {
    opacity: 1;
    transition-duration: 0.1s;
    animation: lt-postmark-thump 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .lt-card:hover .lt-scribble path {
    animation: lt-scribble-hover-draw 0.5s ease-out forwards;
  }
  .lt-card:hover .lt-scribble path + path {
    animation-delay: 0.14s;
  }
  .lt-mini:hover {
    z-index: 1;
    translate: 0 -8px;
    scale: 1.06;
    rotate: var(--lt-tilt, 2deg);
    box-shadow: var(--shadow-lift);
    transition-duration: 0.35s;
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}
.lt-card:focus-visible {
  translate: 0 -4px;
  box-shadow: var(--shadow-press-lg), var(--shadow-lift);
}
.lt-card:focus-visible .lt-postage {
  rotate: 3.5deg;
}
.lt-card:focus-visible .lt-cancel {
  opacity: 1;
  transition-duration: 0.1s;
  animation: lt-postmark-thump 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.lt-card:focus-visible .lt-scribble path {
  animation: lt-scribble-hover-draw 0.5s ease-out forwards;
}
.lt-card:focus-visible .lt-scribble path + path {
  animation-delay: 0.14s;
}
@media (prefers-reduced-motion: reduce) {
  .lt-card,
  .lt-postage,
  .lt-cancel,
  .lt-mini {
    transition: none;
  }
  .lt-card:hover,
  .lt-card:focus-visible {
    translate: none;
  }
  .lt-card:hover .lt-postage,
  .lt-card:focus-visible .lt-postage {
    rotate: 2deg;
  }
  .lt-card:hover .lt-cancel,
  .lt-card:focus-visible .lt-cancel {
    animation: none;
  }
  .lt-card:hover .lt-scribble path,
  .lt-card:focus-visible .lt-scribble path {
    animation: none;
    stroke-dashoffset: 0;
  }
  .lt-mini:hover {
    translate: none;
    scale: none;
    rotate: var(--lt-base, 0deg);
    box-shadow: none;
  }
}
`;

/* ---------------------------------------------------------------- */
/* The postcard                                                      */
/* ---------------------------------------------------------------- */

/**
 * The whole postcard is one mailto link. Left half: handwritten note +
 * mono WRITE TO ME cue (stitched underline solidifies + nudges on hover,
 * the UnderlineLink pattern). Right half: postage stamp with postmark
 * cancellation, and the address block on ruled lines.
 */
function Postcard() {
	return (
		<a
			href={`mailto:${profile.email}`}
			aria-label={`Email ${profile.name} at ${profile.email}`}
			data-hide-cursor="true"
			className="lt-card group block rounded-[2px] border border-[var(--ink)] bg-[var(--card)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-pink)]"
		>
			<div className="grid sm:aspect-[5/3] sm:grid-cols-2">
				{/* LEFT: the handwritten message + write-to-me cue. */}
				<div className="flex flex-col justify-between gap-10 p-6 sm:p-8">
					<div className="font-hand text-3xl leading-[1.25] text-[var(--ink)] sm:text-[2rem]">
						<p>got a project on your mind?</p>
						<p className="mt-1.5">skip the formalities — just write.</p>
						<p className="relative mt-1.5 inline-block">
							let&apos;s build something that lasts.
							{/* Pink scribble drawn under the last line while hovered. */}
							<svg
								viewBox="0 0 200 20"
								fill="none"
								aria-hidden="true"
								preserveAspectRatio="none"
								className="lt-scribble absolute -bottom-1.5 left-0 h-3 w-full text-[var(--accent-pink)]"
							>
								<path
									d="M4 13 C 40 8, 80 16, 120 10 S 180 12, 196 9"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									pathLength={1}
								/>
								<path
									d="M8 16 C 50 12, 95 18, 140 12 S 186 15, 194 13"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									pathLength={1}
								/>
							</svg>
						</p>
					</div>
					<span className="relative inline-flex w-fit items-center pb-1 font-mono text-xs font-bold tracking-[0.18em] text-[var(--accent-pink-ink)]">
						<span
							aria-hidden="true"
							className="absolute bottom-0 left-0 w-full origin-left border-b-[1.5px] border-dashed border-current transition-transform duration-300 ease-out group-hover:scale-x-[1.06] group-hover:border-solid motion-reduce:transition-none"
						/>
						<span className="flex items-center gap-2 transition-transform duration-300 ease-out group-hover:translate-x-1.5 motion-reduce:transition-none">
							WRITE TO ME <span aria-hidden="true">-&gt;</span>
						</span>
					</span>
				</div>

				{/* RIGHT: stamp corner + address block over ruled lines. */}
				<div className="relative flex flex-col justify-end border-t-[1.5px] border-dashed border-[color-mix(in_srgb,var(--ink)_30%,transparent)] p-6 pt-32 sm:border-l-[1.5px] sm:border-t-0 sm:p-8">
					<span
						aria-hidden="true"
						className="absolute left-6 top-5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ink-soft)] sm:left-8 sm:top-6"
					>
						Post Card
					</span>

					{/* Postage stamp + cancellation postmark (thumps in on hover). */}
					<div
						aria-hidden="true"
						className="absolute right-4 top-4 sm:right-5 sm:top-5"
					>
						<div className="lt-postage relative">
							<PostageStamp
								accent="var(--accent-blue)"
								ink={ACCENT_INK.blue}
								denom="01"
								label="AIR MAIL"
								className="w-16 sm:w-20"
							>
								<PlaneDoodle />
							</PostageStamp>
						</div>
						<span className="lt-cancel pointer-events-none absolute -left-12 top-1/2 -translate-y-1/2 mix-blend-multiply">
							<Postmark tone="ink" size={72} label="SAY HELLO" />
						</span>
					</div>

					<div className="ruled w-full pb-2 font-mono text-xs leading-[28px] tracking-[0.08em] text-[var(--ink)] sm:max-w-[260px] sm:text-sm">
						<p className="font-bold">TO: {profile.name}</p>
						<p className="break-words">{profile.email.toUpperCase()}</p>
						<p>{profile.location}</p>
					</div>
				</div>
			</div>
		</a>
	);
}

/* ---------------------------------------------------------------- */
/* Section                                                           */
/* ---------------------------------------------------------------- */

/**
 * Pre-footer CTA, "send me a postcard": centered eyebrow + LET'S TALK
 * heading + blurb on one axis, then a tilting postcard that is itself the
 * mailto link (hover cancels the stamp with a postmark and scribbles under
 * the sign-off), a handwritten aside, and a row of decorative stamps.
 */
export function LetsTalk() {
	return (
		<section id="contact" className="scroll-mt-24 px-5 pb-28 pt-8 sm:px-8">
			<style>{LT_CSS}</style>
			<div className="mx-auto max-w-4xl">
				{/* Header block: one clean center axis. */}
				<Reveal className="flex flex-col items-center text-center">
					<p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[var(--ink-soft)]">
						Say hello <span aria-hidden="true">-&gt;</span>
					</p>
					<h2 className="font-display relative mt-5 inline-flex items-center gap-8 text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-[var(--ink)]">
						<span>LET&apos;S</span>
						<span>TALK</span>

						<ScribbleUnderline className="absolute -bottom-3 left-0 h-[0.16em] w-full text-[var(--accent-pink)]" />
					</h2>
					<p className="mx-auto mt-9 max-w-xl text-base leading-relaxed text-[var(--ink)] sm:text-lg">
						{profile.letsTalkBlurb}
					</p>
				</Reveal>

				{/* Centerpiece: the postcard, tilting toward the pointer. */}
				<Reveal delay={1} className="mt-14">
					<PostcardTilt className="mx-auto w-full max-w-3xl">
						<Postcard />
					</PostcardTilt>
				</Reveal>

				{/* Handwritten aside, tucked against the postcard's edge. */}
				<Reveal
					delay={2}
					className="mx-auto mt-5 flex max-w-3xl justify-end pr-3 sm:pr-6"
				>
					<HandwrittenNote rotate={-2}>
						p.s. — no stamp required
					</HandwrittenNote>
				</Reveal>

				{/* Tidy decorative stamp row on the same center axis. */}
				<Reveal delay={3} className="mt-12">
					<div
						aria-hidden="true"
						className="flex flex-wrap items-start justify-center gap-5 sm:gap-6"
					>
						{MINI_STAMPS.map((stamp) => (
							<div
								key={stamp.label}
								className="lt-mini"
								style={
									{
										"--lt-base": stamp.base,
										"--lt-tilt": stamp.tilt,
									} as React.CSSProperties
								}
							>
								<PostageStamp
									accent={stamp.accent}
									ink={stamp.ink}
									denom={stamp.denom}
									label={stamp.label}
									className="w-[72px] sm:w-20"
								>
									{stamp.doodle}
								</PostageStamp>
							</div>
						))}
					</div>
				</Reveal>
			</div>
		</section>
	);
}

export default LetsTalk;
