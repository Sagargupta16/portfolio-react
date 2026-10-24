import { useState } from "react";
import { motion, type Variants } from "motion/react";
import {
   AMBER,
   BLUE_LIGHT,
   DURATION,
   EASING,
   SKY,
   RED,
   TEXT_MUTED,
   TEXT_PRIMARY,
   MONO_FONT,
} from "@/constants/theme";
import { credlyThumb } from "@utils/credlyThumb";
import { fillTemplate } from "@utils/fillTemplate";
import { getSectionCopy } from "@data/sections";
import { newTabLabel } from "@data/ui";
import useMotionPreference from "@hooks/useMotionPreference";

const COPY = getSectionCopy("achievements").certifications;

interface CertBadgeProps {
   name: string;
   imageUrl: string;
   badgeUrl: string;
   level?: string;
   expiryDate?: string;
   size: number;
   floatDelay: number;
   entranceDelay: number;
}

const LEVEL_COLOR: Record<string, string> = {
   Associate: BLUE_LIGHT,
   Foundational: SKY,
};
const SESSION_TIME = Date.now();
const EXPIRY_WARNING_DAYS = 90;
const DAY_MS = 86_400_000;
const MAX_STAGGER_S = 0.3;

/* One hover label on the anchor; every child animates its own "hover" variant
   so the whole badge responds as a unit with zero React state. */
const HOVER = "hover";
/* The float is a `transform` string so WAAPI runs it on the compositor
   instead of the JS frameloop: up 8px and back, one ease per half. */
const FLOAT_REST = "translateY(0px)";
const FLOAT_KEYFRAMES = [FLOAT_REST, "translateY(-8px)", FLOAT_REST];
const FLOAT_EASE = FLOAT_KEYFRAMES.slice(1).map(() => "easeInOut" as const);
const IMAGE_SPRING = { type: "spring", stiffness: 300, damping: 20 } as const;

/* Hovering parks the float so the badge sits still under the cursor. It
   animates the same `transform` value, so it takes over from the loop. */
const floatVariants: Variants = {
   [HOVER]: {
      transform: FLOAT_REST,
      transition: { duration: DURATION.default },
   },
};
const imageVariants: Variants = { [HOVER]: { scale: 1.08 } };
const nameVariants: Variants = { [HOVER]: { color: TEXT_PRIMARY } };

interface ExpiryMeta {
   label: string;
   color: string;
}

/** Expiry chip text and colour: red once past, amber inside the warning window. */
const getExpiryMeta = (expiryDate?: string): ExpiryMeta | null => {
   if (!expiryDate) return null;
   const expiry = new Date(`${expiryDate}T00:00:00Z`);
   const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - SESSION_TIME) / DAY_MS,
   );
   // Format in UTC: the date is UTC midnight, so a local-zone format would
   // roll 1st-of-month expiries back a month for viewers west of UTC.
   const when = expiry.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
   });
   if (daysUntilExpiry < 0) {
      return { label: fillTemplate(COPY.expired, { when }), color: RED };
   }
   const label = fillTemplate(COPY.expires, { when });
   if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) return { label, color: AMBER };
   return { label, color: TEXT_MUTED };
};

const CertBadge = ({
   name,
   imageUrl,
   badgeUrl,
   level,
   expiryDate,
   size,
   floatDelay,
   entranceDelay,
}: CertBadgeProps) => {
   const { preference, reducedMotion } = useMotionPreference();
   // If the CDN's resized variant fails (transient 5xx / cold cache on newly
   // synced badges), fall back to the original full-size URL once.
   const [useOriginal, setUseOriginal] = useState(false);
   const accent = LEVEL_COLOR[level ?? ""] ?? BLUE_LIGHT;
   const expiryMeta = getExpiryMeta(expiryDate);
   // aria-label replaces the anchor's content for assistive tech, so the level
   // chip and expiry state rendered inside it must be folded in here.
   const ariaLabel = [
      fillTemplate(COPY.credential, { name }),
      level && fillTemplate(COPY.level, { level }),
      expiryMeta?.label,
   ]
      .filter(Boolean)
      .join(", ");
   const hover = reducedMotion ? undefined : HOVER;
   const floatLoop = reducedMotion
      ? undefined
      : {
           transform: FLOAT_KEYFRAMES,
           transition: {
              duration: 3,
              repeat: Infinity,
              ease: FLOAT_EASE,
              delay: floatDelay,
           },
        };

   return (
      <motion.a
         href={badgeUrl}
         target="_blank"
         rel="noopener noreferrer"
         aria-label={newTabLabel(ariaLabel)}
         initial={{ opacity: 0, y: 24 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true, margin: "0px 0px -60px 0px" }}
         transition={{
            delay: Math.min(entranceDelay, MAX_STAGGER_S),
            duration: 0.5,
            ease: EASING.cinematic,
         }}
         whileHover={hover}
         whileFocus={hover}
         style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            textDecoration: "none",
            position: "relative",
         }}
      >
         {/* Badge image with float animation */}
         <motion.div
            key={preference}
            animate={floatLoop}
            variants={floatVariants}
         >
            <motion.img
               src={useOriginal ? imageUrl : credlyThumb(imageUrl)}
               onError={() => setUseOriginal(true)}
               alt={name}
               loading="lazy"
               width={size}
               height={size}
               variants={imageVariants}
               transition={IMAGE_SPRING}
               style={{
                  width: size,
                  height: size,
                  objectFit: "contain",
               }}
            />
         </motion.div>

         {/* Cert name + level */}
         <div
            style={{
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               gap: 4,
               minHeight: expiryMeta ? 58 : 42,
            }}
         >
            <motion.span
               variants={nameVariants}
               style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: MONO_FONT,
                  color: TEXT_MUTED,
                  textAlign: "center",
                  maxWidth: size + 20,
                  lineHeight: 1.2,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
               }}
            >
               {name}
            </motion.span>
            {level && (
               <span
                  style={{
                     fontSize: 11,
                     fontWeight: 700,
                     textTransform: "uppercase",
                     letterSpacing: "0.08em",
                     color: accent,
                     padding: "2px 8px",
                     borderRadius: 4,
                     border: `1px solid ${accent}30`,
                     background: `${accent}08`,
                  }}
               >
                  {level}
               </span>
            )}
            {expiryMeta && (
               <span
                  style={{
                     fontSize: 11,
                     fontWeight: 600,
                     letterSpacing: "0.04em",
                     color: expiryMeta.color,
                  }}
               >
                  {expiryMeta.label}
               </span>
            )}
         </div>
      </motion.a>
   );
};

export default CertBadge;
