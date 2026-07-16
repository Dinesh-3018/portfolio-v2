import type { Metadata } from "next";
import "./globals.css";
import { Agentation } from "agentation";
import { bitcount, caveat, fraunces, notoTamil, spaceGrotesk, spaceMono } from "./fonts";
import LenisProvider from "@/lib/LenisProvider";
import Header from "@/components/chrome/Header";
import PerforationStrip from "@/components/chrome/PerforationStrip";
import Footer from "@/components/chrome/Footer";
import DeskCursor from "@/components/chrome/DeskCursor";

const SITE_URL = "https://dineshg.xyz";
const SITE_TITLE = "Dinesh Ganesan — Full Stack Developer";
const SITE_DESCRIPTION =
  "Portfolio of Dinesh Ganesan, a full stack developer in Bangalore building fast, scalable web apps end to end — schema to screen.";

export const metadata: Metadata = {
  // Resolves relative URLs (incl. the generated opengraph-image) against the
  // production origin so social/link previews work.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Dinesh Ganesan",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${bitcount.variable} ${caveat.variable} ${notoTamil.variable} pt-20 antialiased sm:pt-24`}
      >
        <LenisProvider>
          <DeskCursor />
          <Header />
          <PerforationStrip />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
        {process.env.NODE_ENV === "development" && (
          <Agentation endpoint="http://localhost:4747" />
        )}
      </body>
    </html>
  );
}
