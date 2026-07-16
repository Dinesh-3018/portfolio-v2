"use client";

import { useEffect, useRef, useState } from "react";

export interface CopyButtonProps {
  value: string;
  label?: string;
}

/** Copies `value` to the clipboard and flips to COPIED for 1.5s. */
export function CopyButton({ value, label = "COPY" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (permissions / insecure context) — ignore.
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      className="rounded-[2px] border-2 border-[var(--ink)] bg-[var(--card)] px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.12em] text-[var(--ink)] transition-colors hover:border-[var(--accent-pink)] hover:bg-[var(--accent-pink)] hover:text-white"
    >
      {copied ? "COPIED" : label}
    </button>
  );
}

export default CopyButton;
