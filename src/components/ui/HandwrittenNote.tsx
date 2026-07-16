export interface HandwrittenNoteProps {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
}

/** Handwritten margin aside (Caveat), e.g. "explore my work!". */
export function HandwrittenNote({ children, className, rotate }: HandwrittenNoteProps) {
  return (
    <p
      className={["font-hand text-3xl text-[var(--ink)] sm:text-4xl", className]
        .filter(Boolean)
        .join(" ")}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      {children}
    </p>
  );
}

export default HandwrittenNote;
