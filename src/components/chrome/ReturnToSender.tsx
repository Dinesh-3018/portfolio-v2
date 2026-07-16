"use client";

import { useLenis } from "@/lib/LenisProvider";
import { prefersReducedMotion } from "@/lib/media";

/**
 * "RETURN TO SENDER" — the scroll-to-top control on the footer's info
 * bar, styled as a bordered mono postal chip that presses into its hard
 * shadow on hover (the DeskDock chip treatment). Scrolls via Lenis when
 * smooth scroll is active; falls back to window.scrollTo, and jumps
 * instantly under reduced motion (LenisProvider is also disabled there).
 */
export function ReturnToSender() {
	const lenis = useLenis();

	const onClick = () => {
		if (prefersReducedMotion()) {
			window.scrollTo(0, 0);
			return;
		}
		if (lenis) {
			lenis.scrollTo(0);
			return;
		}
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<button
			type="button"
			onClick={onClick}
			data-hide-cursor="true"
			className={[
				"inline-flex min-h-10 items-center gap-2 rounded-[2px] border-2 border-[var(--ink)] bg-[var(--card)] px-3.5",
				"font-mono text-[11px] font-bold tracking-[0.14em] text-[var(--ink)] shadow-[var(--shadow-press-sm)]",
				"transition-[translate,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none",
				"hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[color-mix(in_srgb,var(--accent-cream)_60%,var(--card))] hover:shadow-none",
				"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)]",
			].join(" ")}
		>
			<svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3">
				<path
					d="M6 10.5V1.5M2 5.5 6 1.5l4 4"
					stroke="currentColor"
					strokeWidth="1.8"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</svg>
			RETURN TO TOP
		</button>
	);
}

export default ReturnToSender;
