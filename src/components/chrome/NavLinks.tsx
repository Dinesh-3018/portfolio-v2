"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/work", label: "WORK" },
  { href: "/guestbook", label: "GUESTBOOK" },
];

export function isActiveRoute(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

interface StickerRect {
  x: number;
  width: number;
  /** First client measurement snaps into place instead of sliding in from x=0. */
  instant: boolean;
}

/**
 * Desktop dock nav: plain mono uppercase links (no icons) over a sliding
 * yellow "sticker" highlight. The sticker glides to the hovered/focused
 * link and rests on the active route otherwise; the active link also gets
 * a postal-red asterisk. SSR renders the sticker invisible (width 0); it
 * is measured after mount via offsetLeft/offsetWidth, remeasured on
 * resize (ResizeObserver) and re-rested on pathname change.
 */
export function NavLinks() {
  const pathname = usePathname();
  const rowRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [hovered, setHovered] = useState<string | null>(null);
  const [sticker, setSticker] = useState<StickerRect | null>(null);

  const activeHref = NAV_ITEMS.find((item) => isActiveRoute(pathname, item.href))?.href ?? null;
  const targetHref = hovered ?? activeHref;

  useEffect(() => {
    const el = targetHref ? linkRefs.current.get(targetHref) : undefined;
    if (!el) {
      setSticker(null);
      return;
    }
    const measure = () => {
      setSticker((prev) => ({
        x: el.offsetLeft,
        width: el.offsetWidth,
        instant: prev === null,
      }));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [targetHref]);

  return (
    <nav aria-label="Main" className="hidden md:block">
      <div
        ref={rowRef}
        className="relative flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute bottom-[3px] left-0 top-[3px] rounded-[3px]",
            "bg-[color-mix(in_srgb,var(--accent-yellow)_38%,transparent)]",
            sticker?.instant
              ? "transition-none"
              : "transition-[transform,width,opacity] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          ].join(" ")}
          style={{
            width: sticker?.width ?? 0,
            transform: `translateX(${sticker?.x ?? 0}px) rotate(-1deg)`,
            opacity: sticker ? 1 : 0,
          }}
        />
        {NAV_ITEMS.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => {
                if (el) linkRefs.current.set(item.href, el);
                else linkRefs.current.delete(item.href);
              }}
              aria-current={active ? "page" : undefined}
              onMouseEnter={() => setHovered(item.href)}
              onFocus={() => setHovered(item.href)}
              onBlur={() => setHovered(null)}
              className="relative z-[1] rounded-[3px] px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent-pink)]"
            >
              {item.label}
              {active ? (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block -translate-y-[2px] text-[13px] leading-none text-[var(--postal-red)]"
                >
                  *
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default NavLinks;
