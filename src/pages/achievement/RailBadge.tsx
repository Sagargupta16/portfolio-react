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
import useMotionPreference from "@hooks/useMotionPreference";

interface RailBadgeProps {
   badge: LearningBadge;
   size: number;
   /** The rail's second copy is decorative: hidden from AT and skipped by Tab. */
   decorative?: boolean;
}

/* Extra width under the image so the mono name gets two full lines. */
const NAME_PAD = 20;

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

   return (
      <motion.a
         href={badge.badgeUrl}
         target="_blank"
         rel="noopener noreferrer"
         aria-label={`${badge.name} credential (opens in a new tab)`}
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
         <motion.span
            variants={nameVariants}
            transition={NAME_TRANSITION}
            style={{
               fontSize: 11,
               fontWeight: 600,
               fontFamily: MONO_FONT,
               color: TEXT_MUTED,
               textAlign: "center",
               lineHeight: 1.2,
               display: "-webkit-box",
               WebkitLineClamp: 2,
               WebkitBoxOrient: "vertical",
               overflow: "hidden",
            }}
         >
            {badge.name}
         </motion.span>
      </motion.a>
   );
};

export default RailBadge;
