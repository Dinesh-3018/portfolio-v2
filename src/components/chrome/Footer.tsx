import { profile } from "@/data/profile";
import Reveal from "@/components/ui/Reveal";
import ContactStamp from "./ContactStamp";
import FooterPlayground from "./FooterPlayground";
import PaperPlane from "./PaperPlane";
import PinnedGuestbookNote from "./PinnedGuestbookNote";
import ReturnToSender from "./ReturnToSender";
import SocialStamps from "./SocialStamps";
import StickyNote from "./StickyNote";
import Ticker from "./Ticker";

/**
 * Scattered sticker/doodle layer so the packing slip reads as an
 * inhabited desk: mint washi strip, cream "ship it" sticker, yellow dot
 * sticker with an ink asterisk, pink star, mint dot. All decorative —
 * aria-hidden, no pointer events, ink-only glyphs on pastel fills.
 *
 * Below sm a dedicated trio (washi, asterisk dot, star) takes over —
 * positioned to frame the CONTACT stamp while staying clear of the
 * compact sticky note, the pinned hint, and the watermark — so the
 * narrowest screens keep an inhabited desk instead of bare paper.
 */
function DeskStickers() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 z-0 select-none"
		>
			{/* Mobile-only trio (below sm). The sm+ set below is untouched. */}
			<span className="absolute right-[7%] top-2 h-6 w-20 rotate-6 bg-[var(--accent-mint)]/75 sm:hidden" />
			<span className="animate-float absolute left-[5%] top-[42%] grid h-11 w-11 -rotate-6 place-items-center rounded-full bg-[var(--accent-yellow)] shadow-[var(--shadow-paper)] sm:hidden">
				<span className="text-lg leading-none text-[var(--ink)]">✳</span>
			</span>
			<svg
				viewBox="0 0 32 32"
				className="animate-float absolute right-[6%] top-[45%] h-7 w-7 [animation-delay:1.6s] sm:hidden"
				fill="var(--accent-pink)"
			>
				<path d="M16 0c1.6 9 6.9 14.3 16 16-9.1 1.7-14.4 7-16 16-1.6-9-6.9-14.3-16-16 9.1-1.7 14.4-7 16-16z" />
			</svg>
			{/* Mint washi tape strip */}
			<span className="absolute left-[6%] top-[16%] hidden h-7 w-28 -rotate-12 bg-[var(--accent-mint)]/75 sm:block" />
			{/* Cream sticker with a hand note */}
			<span className="absolute right-[8%] top-[14%] hidden rotate-6 rounded-[4px] bg-[var(--accent-cream)] px-3 py-1.5 shadow-[var(--shadow-paper)] md:block">
				<span className="font-hand text-lg text-[var(--ink)]">ship it ↗</span>
			</span>
			{/* Yellow round sticker with ink asterisk */}
			<span className="animate-float absolute bottom-[34%] left-[12%] hidden h-12 w-12 -rotate-6 place-items-center rounded-full bg-[var(--accent-yellow)] shadow-[var(--shadow-paper)] sm:grid">
				<span className="text-xl leading-none text-[var(--ink)]">✳</span>
			</span>
			{/* Pink four-point star */}
			<svg
				viewBox="0 0 32 32"
				className="animate-float absolute bottom-[40%] right-[13%] hidden h-8 w-8 [animation-delay:1.6s] sm:block"
				fill="var(--accent-pink)"
			>
				<path d="M16 0c1.6 9 6.9 14.3 16 16-9.1 1.7-14.4 7-16 16-1.6-9-6.9-14.3-16-16 9.1-1.7 14.4-7 16-16z" />
			</svg>
			{/* Small mint dot */}
			<span className="absolute right-[24%] top-[26%] hidden h-4 w-4 rounded-full bg-[var(--accent-mint)] lg:block" />
			{/* Tiny cream dot */}
			<span className="absolute bottom-[24%] left-[24%] hidden h-3 w-3 rounded-full bg-[var(--accent-cream)] lg:block" />
		</div>
	);
}

/**
 * Pinned paper hint pointing out the click-to-stamp playground: a small
 * torn card-stock scrap held by a glossy pushpin (same treatment as the
 * work-page polaroids), with a handwritten nudge in ink on --card. It
 * lives in the flow of the centered column (below the CONTACT hint), so
 * it can never collide with the sticky note, stamp, watermark, or plane
 * loop at any width — on larger screens it drifts to the column's right
 * edge like a casually pinned scrap. Decorative duplicate of a
 * hidden-in-plain-sight interaction — aria-hidden; wiggles on hover
 * (reduced motion kills the wiggle via globals.css). Clicking it still
 * presses a stamp: it is paper too, and it is literally asking for it.
 */
function PinnedHintNote() {
	return (
		<div
			aria-hidden="true"
			className="wiggle-on-hover relative mt-2 w-52 rotate-[2.5deg] select-none self-center sm:self-end lg:-mr-20"
			style={{ filter: "drop-shadow(0 6px 12px rgba(22, 22, 22, 0.14))" }}
		>
			{/* Glossy pushpin pierced through the scrap's top edge. */}
			<span
				className="absolute -top-1.5 left-1/2 z-10 block h-3.5 w-3.5 -translate-x-1/2 rounded-full"
				style={{
					background:
						"radial-gradient(circle at 32% 30%, rgba(255, 255, 255, 0.9), var(--accent-blue) 45%, color-mix(in srgb, var(--accent-blue) 65%, var(--ink)) 100%)",
					boxShadow: "0 1px 1px rgba(22, 22, 22, 0.45)",
				}}
			/>
			{/* Torn paper scrap (clip on the inner layer so the drop shadow on
          the wrapper traces the ragged silhouette). */}
			<span
				className="block px-4 py-3"
				style={{
					background: "var(--card)",
					clipPath:
						"polygon(1% 8%, 12% 2%, 34% 5%, 57% 0%, 82% 4%, 99% 1%, 100% 55%, 97% 96%, 74% 100%, 48% 95%, 22% 100%, 3% 96%, 0% 60%)",
				}}
			>
				<span className="font-hand block text-xl leading-snug text-[var(--ink)]">
					psst — tap or click anywhere on this paper to leave a stamp
				</span>
			</span>
		</div>
	);
}

/**
 * Footer: marquee ticker, then a "packing slip" desk panel with a
 * perforated tear-off top edge — mono eyebrow, Fraunces display line,
 * the slammed-in CONTACT stamp, a pinned-note hint for the stamp
 * playground, a paper plane circling a dashed loop, scattered stickers,
 * a click-to-stamp playground, a giant outlined name watermark — plus
 * the sticky note overlapping top-left and a stitched "receipt end"
 * info bar (© chip + microprint, social postage stamps,
 * RETURN TO SENDER).
 */
export function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="relative mt-16">
			<Ticker />
			{/* Sticky note lives outside the masked panel so the perforation
          mask can't clip it. */}
			<div className="relative">
				<div
					className="bg-[var(--card)]"
					style={{
						// Torn-off top edge: punched semicircle holes along the top.
						mask: "radial-gradient(circle 5px at 10px 0, transparent 5px, black 5.5px) 0 0 / 20px 100% repeat-x",
					}}
				>
					{/* lg:pb-48 keeps the pinned hint clear of the watermark's top
              edge at wide widths; gap tightens the column around the
              now-compact stamp. md→lg keeps pt-52 to clear the full-size
              sticky note's ~182px intrusion (-top-10 + ~222px tall);
              below md the compact note intrudes far less, so pt-44 still
              clears the centered eyebrow while tightening the mobile
              rhythm (pb-32 likewise — the vw-scaled watermark is shorter
              there). From lg the note sits left of the column, so the
              tighter lg:pt-36 is safe. */}
					<FooterPlayground className="overflow-hidden px-6 pb-32 pt-44 md:pb-40 md:pt-52 lg:pb-48 lg:pt-36">
						<PaperPlane />
						<DeskStickers />

						<div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-5 text-center md:gap-6">
							<Reveal className="flex flex-col items-center gap-3 md:gap-4">
								<p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--ink-soft)]">
									Ready when you are —
								</p>
								<h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-black leading-[1.02] text-[var(--ink)]">
									Have a project{" "}
									<span className="italic text-[var(--accent-pink-ink)]">
										in mind?
									</span>
								</h2>
							</Reveal>
							{/* The stamping station: a designated parcel-style stamp box
                  (dashed outline, corner ticks, PRESS FIRMLY tag) with an
                  ink pad peeking out behind and a faint ghost box from an
                  earlier "practice press". The stamp slams into the box. */}
							<div className="relative mt-1">
								{/* Ghost of a previous press. */}
								<div
									aria-hidden="true"
									className="absolute -left-4 -top-3 h-full w-full -rotate-[4deg] rounded-[10px] border-[1.5px] border-dashed border-[var(--ink)]/10"
								/>
								{/* Ink pad peeking from behind the box. */}
								<div
									aria-hidden="true"
									className="absolute -bottom-3.5 -right-7 h-10 w-[72px] rotate-[6deg] rounded-[5px] border border-[var(--ink)]/40 bg-[color-mix(in_srgb,var(--postal-red)_72%,var(--ink))] p-[5px] shadow-[0_2px_6px_rgba(22,22,22,0.25)]"
								>
									<div className="h-full w-full rounded-[3px] bg-[color-mix(in_srgb,var(--postal-red)_45%,var(--ink))] shadow-[inset_0_1px_3px_rgba(0,0,0,0.45)]" />
								</div>
								{/* The designated box. */}
								<div className="relative rounded-[10px] border-[1.5px] border-dashed border-[var(--ink)]/30 px-7 py-6 sm:px-10 sm:py-7">
									<span
										aria-hidden="true"
										className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--card)] px-2 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--ink-soft)]"
									>
										Press firmly
									</span>
									{/* Corner ticks. */}
									<span
										aria-hidden="true"
										className="absolute -left-px -top-px h-3 w-3 rounded-tl-[10px] border-l-2 border-t-2 border-[var(--ink)]/50"
									/>
									<span
										aria-hidden="true"
										className="absolute -right-px -top-px h-3 w-3 rounded-tr-[10px] border-r-2 border-t-2 border-[var(--ink)]/50"
									/>
									<span
										aria-hidden="true"
										className="absolute -bottom-px -left-px h-3 w-3 rounded-bl-[10px] border-b-2 border-l-2 border-[var(--ink)]/50"
									/>
									<span
										aria-hidden="true"
										className="absolute -bottom-px -right-px h-3 w-3 rounded-br-[10px] border-b-2 border-r-2 border-[var(--ink)]/50"
									/>
									<ContactStamp email={profile.email} />
								</div>
							</div>
							<p className="font-hand text-lg text-[var(--ink)]/60">
								<span aria-hidden="true">↑ </span>go on, press it
							</p>
							<PinnedHintNote />
							<PinnedGuestbookNote />
						</div>

						{/* Giant outlined name watermark along the bottom edge. Below
                md it tracks the viewport (24vw within a clamp) so it spans
                ~5/6 of the width as a texture at 360 instead of outgrowing
                the panel; md+ keeps the original clamp untouched. */}
						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-x-0 bottom-0 z-0 select-none overflow-hidden text-center"
						>
							<p
								className="outline-text font-display whitespace-nowrap text-[clamp(4rem,24vw,11rem)] font-black uppercase leading-[0.78] tracking-[0.04em] opacity-[0.09] md:text-[clamp(6rem,20vw,15rem)]"
								style={{ marginBottom: "-0.06em" }}
							>
								{profile.name}
							</p>
						</div>
					</FooterPlayground>

					{/* Bottom info bar — the "receipt end" of the packing slip.
              Desktop (md+): one row, © cluster left, thank-you microprint
              center (lg+ only), then social stamps / RETURN TO SENDER
              right. Below md the right group's wrapper is
              display:contents, so its pieces stack as centered rows in
              receipt order: stamps, return chip, © cluster. */}
					<div className="relative border-t-[1.5px] border-dashed border-[rgba(22,22,22,0.3)] bg-[var(--card)] px-5 py-6 sm:px-8">
						<div className="flex flex-col items-center gap-6 md:flex-row md:flex-wrap md:justify-between md:gap-x-6 md:gap-y-4">
							{/* LEFT: ink logo chip + © line + desk microprint. */}
							<div className="order-4 flex items-center gap-3 md:order-none">
								<span
									aria-hidden="true"
									className="flex h-9 w-9 flex-none items-center justify-center rounded-[2px] bg-[var(--ink)] shadow-[var(--shadow-press-sm)]"
								>
									<span className="font-pixel text-lg leading-none text-white">
										{profile.initials.charAt(0)}
									</span>
								</span>
								<span className="flex flex-col gap-1">
									<span className="font-mono text-xs text-[var(--ink-soft)]">
										© {year} {profile.name}
									</span>
									<span className="font-mono text-[9px] uppercase tracking-[0.25em] pl-1 text-[var(--ink-soft)]">
										{profile.location}
									</span>
								</span>
							</div>

							{/* CENTER: receipt microprint (lg+ only). */}
							<p className="hidden font-mono text-[10px] tracking-[0.3em] text-[var(--ink-soft)] lg:block">
								✳ THANK YOU FOR SCROLLING ✳
							</p>

							{/* RIGHT: social stamps, return-to-sender. */}
							<div className="contents md:flex md:min-w-0 md:flex-wrap md:items-center md:justify-end md:gap-x-5 md:gap-y-3">
								<SocialStamps className="order-1 md:order-none" />
								<span className="order-3 md:order-none">
									<ReturnToSender />
								</span>
							</div>
						</div>
					</div>
				</div>
				<div className="absolute -top-10 left-5 z-10 sm:left-[7%]">
					<StickyNote />
				</div>
			</div>
		</footer>
	);
}

export default Footer;
