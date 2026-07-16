import Image from "next/image";
import type { ProjectImage } from "@/data/types";
import TapedFrame from "./TapedFrame";
import Postmark from "./Postmark";

export interface TapedImageProps {
  image: ProjectImage;
  rotate?: number;
  postmark?: boolean | string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

/**
 * Photo taped to the desk. Size it by passing aspect/height utilities via
 * `className` (falls back to aspect-[4/3] when no sizing class is given).
 * `postmark` overlays a cancellation mark bottom-right (string = label).
 */
export function TapedImage({
  image,
  rotate,
  postmark,
  className,
  imgClassName,
  priority,
}: TapedImageProps) {
  const hasSize = !!className && /(?:^|\s|:)(?:aspect-|h-|min-h-|max-h-)/.test(className);
  const outerClassName = [hasSize ? "" : "aspect-[4/3]", className].filter(Boolean).join(" ");
  return (
    <TapedFrame rotate={rotate} className={outerClassName}>
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          className={["object-cover", imgClassName].filter(Boolean).join(" ")}
        />
      </div>
      {postmark ? (
        <span className="pointer-events-none absolute bottom-2 right-2 z-10 mix-blend-multiply">
          <Postmark
            tone="ink"
            size={64}
            label={typeof postmark === "string" ? postmark : undefined}
          />
        </span>
      ) : null}
    </TapedFrame>
  );
}

export default TapedImage;
