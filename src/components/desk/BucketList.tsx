import { bucketList } from "@/data/bucketList";

/** Hand-stamped red tick that slightly overshoots its box (marker-checked). */
function DoneCheck() {
  return (
    <span
      aria-hidden="true"
      className="relative flex h-4 w-4 items-center justify-center rounded-[2px] border-[1.5px] border-[var(--postal-red)] bg-[color-mix(in_srgb,var(--postal-red)_12%,transparent)]"
    >
      <svg
        viewBox="0 0 24 24"
        className="stamp-rough absolute h-[22px] w-[22px] -rotate-6 text-[var(--postal-red)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 13l5 5L20 5" />
      </svg>
    </span>
  );
}

/**
 * BUCKET LIST: a tilted ruled index card pulled out of the desk drawer.
 * Every line sits on the card's 28px ruling with a uniform checkbox in the
 * left gutter — shipped wishes get a hand-stamped red tick and a softened,
 * struck-through line; pending ones keep an empty ink box. The footer
 * tallies progress in mono micro. Server component, no props; data lives
 * in src/data/bucketList.ts.
 */
export function BucketList() {
  const doneCount = bucketList.filter((item) => item.done).length;

  return (
    <div className="ruled rotate-[0.7deg] rounded-[2px] border border-[var(--ink)] bg-[var(--card)] px-6 pb-6 pt-9 shadow-[var(--shadow-press)] sm:px-7">
      {/* Title line: mono eyebrow + handwritten margin aside. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 leading-[28px]">
        <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
          BUCKET LIST —
        </h3>
        <span aria-hidden="true" className="font-hand text-xl text-[var(--ink-soft)]">
          no deadline, no backlog grooming
        </span>
      </div>

      {/* One blank ruling (28px) between rows so items breathe while every
          line still lands on a rule — keeps the index-card alignment. */}
      <ul className="mt-[28px] space-y-[28px]">
        {bucketList.map((item) => (
          <li key={item.text} className="flex items-center gap-3.5 leading-[28px]">
            {/* Uniform-width gutter keeps every wish on the same left edge. */}
            <span className="flex w-5 shrink-0 items-center justify-center">
              {item.done ? (
                <DoneCheck />
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-block h-4 w-4 rounded-[2px] border-[1.5px] border-[var(--ink)]"
                />
              )}
            </span>
            <span
              className={
                item.done
                  ? "text-sm font-medium text-[var(--ink-soft)] line-through decoration-[var(--postal-red)] decoration-[1.5px] sm:text-[15px]"
                  : "text-sm font-medium text-[var(--ink)] sm:text-[15px]"
              }
            >
              {item.text}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-[28px] font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)] leading-[28px]">
        {doneCount}/{bucketList.length} STAMPED
      </p>
    </div>
  );
}

export default BucketList;
