export interface StampButtonProps {
  email: string;
  label?: string;
  size?: "sm" | "lg";
  className?: string;
}

/**
 * Giant rubber-stamp mailto CTA: postal-red double ring, Fraunces
 * uppercase, uneven ink. Hover presses it into the ink pad (sinks into its
 * hard shadow and squares up); active gives a small squash.
 */
export function StampButton({ email, label = "CONTACT", size = "lg", className }: StampButtonProps) {
  const lg = size === "lg";
  return (
    <a
      href={`mailto:${email}`}
      className={[
        "stamp-rough inline-block -rotate-2 rounded-[12px] border-2 border-[var(--postal-red)] bg-[var(--card)] text-[var(--postal-red)]",
        "shadow-[var(--shadow-press-lg)] transition-[translate,rotate,box-shadow,scale] duration-150 ease-out",
        "hover:translate-x-1 hover:translate-y-1 hover:rotate-0 hover:shadow-none active:scale-[0.98]",
        lg ? "p-2" : "p-1.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "flex items-center justify-center rounded-[8px] border border-current",
          lg ? "px-8 py-5 sm:px-12 sm:py-7" : "px-5 py-2.5",
        ].join(" ")}
      >
        <span
          className={[
            "font-display font-bold uppercase leading-none tracking-[0.06em]",
            lg ? "text-[clamp(2rem,5vw,3.5rem)]" : "text-[clamp(1.3rem,2.6vw,1.9rem)]",
          ].join(" ")}
        >
          {label}
        </span>
      </span>
    </a>
  );
}

export default StampButton;
