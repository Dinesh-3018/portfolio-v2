import { principles } from "@/data/principles";
import { ACCENT } from "@/data/site";
import { ACCENT_INK } from "@/components/ui/accentInk";
import Reveal from "@/components/ui/Reveal";
import HandwrittenNote from "@/components/ui/HandwrittenNote";
import StickerLabel from "./StickerLabel";

/** Hand-drawn curved arrow pointing toward the takeaway note. */
function CurvedArrow({ flipped }: { flipped?: boolean }) {
	return (
		<svg
			width="90"
			height="34"
			viewBox="0 0 90 34"
			fill="none"
			aria-hidden="true"
			className={["hidden lg:block", flipped ? "-scale-x-100" : ""]
				.filter(Boolean)
				.join(" ")}
		>
			<path
				d="M4 8c26 14 52 18 76 14"
				stroke="var(--ink)"
				strokeWidth="1.8"
				strokeLinecap="round"
			/>
			<path
				d="M70 14l12 7-14 4"
				stroke="var(--ink)"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		</svg>
	);
}

/** Index-card ruling with the header rule inked in the entry accent. */
function ruledCardStyle(accent: string): React.CSSProperties {
	const rule = `color-mix(in srgb, ${accent} 60%, transparent)`;
	return {
		backgroundImage: `linear-gradient(to bottom, transparent, transparent 27px, ${rule} 27px, ${rule} 28px, transparent 28px), repeating-linear-gradient(to bottom, transparent, transparent 27px, var(--line) 27px, var(--line) 28px)`,
	};
}

/**
 * HOW I WORK: a green sticker label over four ruled index cards pinned down
 * alternately left and right, each trailed by a handwritten takeaway in the
 * entry accent color.
 */
export function Principles() {
	return (
		<section className="px-5 pt-24 sm:px-8">
			<div className="mx-auto max-w-4xl">
				<StickerLabel tone="green" className="mb-10">
					HOW I WORK
				</StickerLabel>
				<div className="mt-10 flex flex-col gap-14">
					{principles.map((principle, i) => {
						const right = i % 2 === 1;
						const accent = ACCENT[principle.accent];
						return (
							<Reveal
								key={principle.title}
								className={[
									"flex flex-col",
									right ? "items-end" : "items-start",
								].join(" ")}
							>
								<div
									className={[
										"relative max-w-xl rounded-[2px] border border-[var(--ink)] bg-[var(--card)] px-7 py-7 shadow-[var(--shadow-press-sm)] sm:px-9",
										right ? "rotate-[0.8deg]" : "-rotate-[0.8deg]",
									].join(" ")}
									style={ruledCardStyle(accent)}
								>
									<h3 className="text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
										{principle.title}
									</h3>
									<p className="mt-4 text-[15px] leading-[28px] text-[var(--ink)]/90">
										{principle.body}
									</p>
								</div>
								<div
									className={[
										"mt-4 flex items-center gap-3",
										right ? "flex-row-reverse self-start" : "self-end",
									].join(" ")}
								>
									<CurvedArrow flipped={right} />
									<HandwrittenNote className="lg:whitespace-nowrap">
										<span style={{ color: ACCENT_INK[principle.accent] }}>
											{principle.takeaway}
										</span>
									</HandwrittenNote>
								</div>
							</Reveal>
						);
					})}
				</div>

				{/* Off-the-clock sign-off. */}
				<Reveal className="mt-16 flex justify-center">
					<HandwrittenNote
						rotate={-2}
						className="text-center text-2xl text-[var(--ink-soft)] sm:text-3xl"
					>
						...and off the clock? Just good people, good food &mdash; and
						keeping life{" "}
						<span className="text-[var(--accent-pink-ink)]">jingalala</span>{" "}
						&#10038;
					</HandwrittenNote>
				</Reveal>
			</div>
		</section>
	);
}

export default Principles;
