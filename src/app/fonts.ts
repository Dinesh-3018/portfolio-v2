import { Bitcount_Prop_Single, Caveat, Fraunces, Space_Grotesk, Space_Mono } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

/** Pixel display face for the hero name (reference: Bitcount Prop Single). */
export const bitcount = Bitcount_Prop_Single({
  subsets: ["latin"],
  variable: "--font-bitcount",
  display: "swap",
});

/** Handwritten notes site-wide (`.font-hand`). */
export const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});
