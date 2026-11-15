import { useState } from "react";
import { motion, type Variants } from "motion/react";
import type { LearningBadge } from "@/types";
import {
   DURATION,
   EASING,
   MONO_FONT,
   TEXT_MUTED,
   TEXT_PRIMARY,
} from "@/constants/theme";
import { credlyThumb } from "@utils/credlyThumb";
import { fillTemplate } from "@utils/fillTemplate";
import { getSectionCopy } from "@data/sections";
import { newTabLabel } from "@data/ui";
import useMotionPreference from "@hooks/useMotionPreference";
import "./achievements.css";

const CREDENTIAL = getSectionCopy("achievements").certifications.credential;

interface RailBadgeProps {
   badge: LearningBadge;
   size: number;
   /** The rail's second copy is decorative: hidden from AT and skipped by Tab. */
   decorative?: boolean;
}

/* Extra width under the image so the mono name gets two full lines. */
const NAME_PAD = 44;

/* Optical size: artwork is scaled to read this tall (share of the square image
   box). Measured alpha heights of the 220px Credly thumbnails (2026-11-14):
   Anthropic and AWS Worldwide Field Enablement badges fill 1.0, the AWS
   Partner badges 0.84, the AWS Knowledge, Educate and Well-Architected
   badges 0.81. Any other issuer keeps scale 1. */
const ART_HEIGHT_TARGET = 0.9;
const artHeight = ({ issuer, name }: LearningBadge): number => {
   if (issuer === "Anthropic" || issuer === "AWS Worldwide Field Enablement") {
      return 1;
   }
   if (issuer !== "Amazon Web Services Training and Certification") {
      return ART_HEIGHT_TARGET;
   }
   return name.startsWith("AWS Partner:") ? 0.84 : 0.81;
};

/* One hover label on the anchor; image and name animate their own "hover"
   variant so the badge responds as a unit with zero React state. */
const HOVER = "hover";
const IMAGE_SPRING = { type: "spring", stiffness: 300, damping: 20 } as const;
const NAME_TRANSITION = { duration: DURATION.quick, ease: EASING.brisk };
const imageVariants: Variants = { [HOVER]: { scale: 1.08 } };
const nameVariants: Variants = { [HOVER]: { color: TEXT_PRIMARY } };

/**
 * A learning badge for the marquee rail: the same link, alt text and Credly
 * thumbnail as CertBadge, without the float loop or its own in-view entrance
 * (thirty bobbing badges on a moving track read as noise).
 */
const RailBadge = ({ badge, size, decorative = false }: RailBadgeProps) => {
   const { reducedMotion } = useMotionPreference();
   // If the CDN's resized variant fails (transient 5xx / cold cache on newly
   // synced badges), fall back to the original full-size URL once.
   const [useOriginal, setUseOriginal] = useState(false);
   const hover = reducedMotion ? undefined : HOVER;
   const artScale = ART_HEIGHT_TARGET / artHeight(badge);

   return (
      <motion.a
         href={badge.badgeUrl}
         target="_blank"
         rel="noopener noreferrer"
         aria-label={newTabLabel(
            fillTemplate(CREDENTIAL, { name: badge.name }),
         )}
         tabIndex={decorative ? -1 : undefined}
         whileHover={hover}
         whileFocus={hover}
         style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            width: size + NAME_PAD,
            flexShrink: 0,
            textDecoration: "none",
         }}
      >
         <div
            className="badge-art"
            style={{
               width: size,
               height: size,
               transform: `scale(${artScale})`,
            }}
         >
            <motion.img
               src={useOriginal ? badge.imageUrl : credlyThumb(badge.imageUrl)}
               onError={() => setUseOriginal(true)}
               alt={badge.name}
               loading="lazy"
               width={size}
               height={size}
               variants={imageVariants}
               transition={IMAGE_SPRING}
               style={{ width: size, height: size, objectFit: "contain" }}
            />
         </div>
         <div className="badge-name" style={{ width: size + NAME_PAD }}>
            <motion.span
               className="badge-name__text"
               variants={nameVariants}
               transition={NAME_TRANSITION}
               style={{ fontFamily: MONO_FONT, color: TEXT_MUTED }}
            >
               {badge.name}
            </motion.span>
            <span className="badge-name__tip" aria-hidden="true">
               {badge.name}
            </span>
         </div>
      </motion.a>
   );
};

export default RailBadge;
