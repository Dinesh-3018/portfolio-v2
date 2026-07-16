/**
 * Static 12px card-stock strip with punched perforation holes at the very
 * top of the page flow (the tear-off edge of the paper). Purely decorative
 * and no longer sticky — the floating Desk Dock is the only fixed chrome.
 */
export function PerforationStrip() {
  return (
    <div aria-hidden="true" className="select-none border-b border-[var(--line)]">
      <div
        className="h-3 w-full bg-[var(--card)]"
        style={{
          mask: "radial-gradient(circle 3.5px at 8px 50%, transparent 3.5px, black 4px) 0 0 / 16px 100% repeat-x",
        }}
      />
    </div>
  );
}

export default PerforationStrip;
