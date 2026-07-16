export interface SquiggleProps {
  className?: string;
  width?: number;
}

/** Double-wave hand-drawn underline. Inherits color via currentColor. */
export function Squiggle({ className, width = 120 }: SquiggleProps) {
  const height = Math.round((width * 14) / 120);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M2 8c20-6 40 6 58 0s40-6 58 0" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 12c18-5 36 4 52 0s36-5 52 0" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default Squiggle;
