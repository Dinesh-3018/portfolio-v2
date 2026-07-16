"use client";

import Link from "next/link";
import { profile } from "@/data/profile";
import { NAV_ITEMS, isActiveRoute } from "./NavLinks";

export interface MobileMenuProps {
  open: boolean;
  pathname: string;
  id: string;
}

/**
 * Detached paper panel dropping just below the floating dock (below md),
 * in the same card/border/press-shadow language: big numbered mono rows
 * (01/02/03), a dashed stitch divider, then the social links row.
 * Open/close rides a max-height + opacity transition; the open state and
 * route-change closing live in DeskDock.
 */
export function MobileMenu({ open, pathname, id }: MobileMenuProps) {
  return (
    <div
      id={id}
      // inert + invisible keep the collapsed panel's links out of the tab
      // order and away from screen readers; visibility rides the
      // transition so the close animation still plays.
      inert={!open}
      className={[
        "absolute inset-x-0 top-[calc(100%+0.625rem)] overflow-hidden rounded-[4px] border border-[var(--ink)] bg-[var(--card)] shadow-[4px_4px_0_rgba(22,22,22,0.9)] md:hidden",
        "transition-[max-height,opacity,visibility] duration-300 ease-out motion-reduce:transition-none",
        open ? "visible max-h-[480px] opacity-100" : "invisible max-h-0 opacity-0",
      ].join(" ")}
    >
      <nav aria-label="Mobile" className="py-1.5">
        {NAV_ITEMS.map((item, index) => {
          const active = isActiveRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex items-baseline gap-4 px-5 py-3.5 font-mono text-base font-bold uppercase tracking-[0.12em] transition-colors",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-pink)]",
                active
                  ? "bg-[color-mix(in_srgb,var(--accent-yellow)_32%,var(--card))] text-[var(--ink)]"
                  : "text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--accent-cream)_55%,var(--card))]",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className="text-[10px] font-semibold tracking-[0.08em] text-[var(--ink-soft)]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.label}
              {active ? (
                <span aria-hidden="true" className="text-[var(--postal-red)]">
                  *
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div
        aria-hidden="true"
        className="mx-5 border-t-[1.5px] border-dashed border-[color-mix(in_srgb,var(--ink)_35%,transparent)]"
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-2.5">
        {profile.socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            // min-h-10 gives each social link a ~40px touch target on the
            // primary mobile nav surface without changing the text visual.
            className="inline-flex min-h-10 items-center rounded-[2px] font-mono text-xs font-semibold tracking-[0.08em] text-[var(--ink)] transition-colors hover:text-[var(--accent-pink-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)]"
          >
            {social.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default MobileMenu;
