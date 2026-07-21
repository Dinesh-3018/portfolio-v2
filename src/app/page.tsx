import AboutTeaser from "@/components/home/AboutTeaser";
import FeaturedWorks from "@/components/home/FeaturedWorks";
import Hero from "@/components/home/Hero";
import IntroStatement from "@/components/home/IntroStatement";
import SupportBanner from "@/components/home/SupportBanner";
import LetsTalk from "@/components/ui/LetsTalk";

/**
 * Home page — the maker's-desk tour: the hero (live IST clock, pixel-type
 * name on a washi-taped label, availability stamp, sticker pills), the
 * intro statement with the CONTACT ME bar, the about teaser on ruled index
 * cards, the alternating FEATURED WORKS rows, and the LET'S TALK stamp
 * sheet. Server component; interaction lives in small client children.
 */
export default function Home() {
  return (
    <div>
      <SupportBanner />
      <Hero />
      <IntroStatement />
      <AboutTeaser />
      <FeaturedWorks />
      <LetsTalk />
    </div>
  );
}
