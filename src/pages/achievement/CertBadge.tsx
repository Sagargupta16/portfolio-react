import { useState } from "react";
import { motion } from "motion/react";
import {
   AMBER,
   CYAN,
   EASING,
   PURPLE,
   RED,
   TEXT_MUTED,
   TEXT_PRIMARY,
   MONO_FONT,
} from "@/constants/theme";
import { credlyThumb } from "@utils/credlyThumb";
import useMotionPreference from "@hooks/useMotionPreference";

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
   Associate: CYAN,
   Foundational: PURPLE,
};
const SESSION_TIME = Date.now();
const EXPIRY_WARNING_DAYS = 90;
const DAY_MS = 86_400_000;

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
   if (daysUntilExpiry < 0) return { label: `Expired ${when}`, color: RED };
   if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
      return { label: `Expires ${when}`, color: AMBER };
   }
   return { label: `Expires ${when}`, color: TEXT_MUTED };
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
   const { reducedMotion } = useMotionPreference();
   const [isHovered, setIsHovered] = useState(false);
   // If the CDN's resized variant fails (transient 5xx / cold cache on newly
   // synced badges), fall back to the original full-size URL once.
   const [useOriginal, setUseOriginal] = useState(false);
   const accent = LEVEL_COLOR[level ?? ""] ?? CYAN;
   const expiryMeta = getExpiryMeta(expiryDate);
   // aria-label replaces the anchor's content for assistive tech, so the level
   // chip and expiry state rendered inside it must be folded in here.
   const ariaLabel = [
      `${name} credential`,
      level && `${level} level`,
      expiryMeta?.label,
   ]
      .filter(Boolean)
      .join(", ");
   const floatRepeat = reducedMotion ? 0 : Infinity;
   const floatAnimation =
      isHovered || reducedMotion ? { y: 0 } : { y: [0, -8, 0] };
   const floatTransition = isHovered
      ? { duration: 0.4 }
      : {
           duration: 3,
           repeat: floatRepeat,
           ease: "easeInOut" as const,
           delay: floatDelay,
        };

   return (
      <motion.a
         href={badgeUrl}
         target="_blank"
         rel="noopener noreferrer"
         aria-label={`${ariaLabel} (opens in a new tab)`}
         initial={{ opacity: 0, y: 40, scale: 0.8 }}
         whileInView={{ opacity: 1, y: 0, scale: 1 }}
         viewport={{ once: true, margin: "0px 0px -60px 0px" }}
         transition={{
            delay: entranceDelay,
            duration: 0.7,
            ease: EASING.cinematic,
         }}
         onHoverStart={() => setIsHovered(true)}
         onHoverEnd={() => setIsHovered(false)}
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
            animate={floatAnimation}
            transition={floatTransition}
            style={{ position: "relative" }}
         >
            {/* Glow behind badge on hover */}
            <div
               style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${accent}20, transparent 70%)`,
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  pointerEvents: "none",
               }}
            />
            <img
               src={useOriginal ? imageUrl : credlyThumb(imageUrl)}
               onError={() => setUseOriginal(true)}
               alt={name}
               loading="lazy"
               width={size}
               height={size}
               style={{
                  width: size,
                  height: size,
                  objectFit: "contain",
                  transition: "transform 0.3s ease, filter 0.3s ease",
                  transform: isHovered ? "scale(1.12)" : "scale(1)",
                  filter: isHovered
                     ? `drop-shadow(0 4px 20px ${accent}50) brightness(1.05)`
                     : "brightness(0.88)",
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
            <span
               style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: MONO_FONT,
                  color: isHovered ? TEXT_PRIMARY : TEXT_MUTED,
                  textAlign: "center",
                  maxWidth: size + 20,
                  lineHeight: 1.2,
                  transition: "color 0.3s ease",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
               }}
            >
               {name}
            </span>
            {level && (
               <span
                  style={{
                     fontSize: 9,
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
                     fontSize: 9,
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
