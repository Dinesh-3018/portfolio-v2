import { profile } from "@/data/profile";

/** How many times the sequence repeats inside each half of the loop — enough
 *  to cover wide viewports so the -50% translate never shows a gap. */
const REPEATS = 3;

function Sequence() {
	// The key facts (role, availability, location) woven together with a few
	// lines that have some personality — it's decorative, so it can be playful.
	const items = [
		profile.role,
		"Schema to screen, end to end",
		profile.location,
		"Still learning, always",
		"Off the clock — jingalala",
	];
	return (
		<div className="flex h-full items-center">
			{Array.from({ length: REPEATS }).flatMap((_, r) =>
				items.map((item, i) => (
					<span
						key={`${r}-${i}`}
						className="flex items-center whitespace-nowrap font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]"
					>
						<span className="px-7">{item}</span>
						<span className="text-[var(--accent-pink)]">✳</span>
					</span>
				)),
			)}
		</div>
	);
}

/**
 * Decorative marquee above the footer. The sequence is rendered twice and
 * the track translates -50%, so the 28s loop is seamless. Static under
 * reduced motion (`.animate-ticker` is disabled in globals.css).
 */
export function Ticker() {
	return (
		<div
			aria-hidden="true"
			className="h-10 select-none overflow-hidden border-y border-[var(--line)]"
		>
			<div className="animate-ticker flex h-full w-max">
				<Sequence />
				<Sequence />
			</div>
		</div>
	);
}

export default Ticker;
