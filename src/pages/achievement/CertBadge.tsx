import { useState } from "react";
import { motion } from "motion/react";
import { CYAN, PURPLE, TEXT_PRIMARY, MONO_FONT } from "@/constants/theme";

interface CertBadgeProps {
   name: string;
   imageUrl: string;
   badgeUrl: string;
   level?: string;
   size: number;
   floatDelay: number;
   entranceDelay: number;
}

const LEVEL_COLOR: Record<string, string> = {
   Associate: CYAN,
   Foundational: PURPLE,
};

const CertBadge = ({
   name,
   imageUrl,
   badgeUrl,
   level,
   size,
   floatDelay,
   entranceDelay,
}: CertBadgeProps) => {
   const [isHovered, setIsHovered] = useState(false);
   const accent = LEVEL_COLOR[level] ?? CYAN;

   return (
      <motion.a
         href={badgeUrl}
         target="_blank"
         rel="noopener noreferrer"
         aria-label={name}
         initial={{ opacity: 0, y: 40, scale: 0.8 }}
         whileInView={{ opacity: 1, y: 0, scale: 1 }}
         viewport={{ once: false, margin: "0px 0px -60px 0px" }}
         transition={{
            delay: entranceDelay,
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
         }}
         onHoverStart={() => setIsHovered(true)}
         onHoverEnd={() => setIsHovered(false)}
         style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            textDecoration: "none",
            position: "relative",
         }}
      >
         {/* Badge image with float animation */}
         <motion.div
            animate={isHovered ? { y: 0 } : { y: [0, -8, 0] }}
            transition={
               isHovered
                  ? { duration: 0.3 }
                  : {
                       duration: 3,
                       repeat: Infinity,
                       ease: "easeInOut",
                       delay: floatDelay,
                    }
            }
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
               src={imageUrl}
               alt={name}
               loading="lazy"
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
               minHeight: 42,
            }}
         >
            <span
               style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: MONO_FONT,
                  color: isHovered ? TEXT_PRIMARY : "rgba(255,255,255,0.4)",
                  textAlign: "center",
                  maxWidth: size + 20,
                  lineHeight: 1.3,
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
         </div>
      </motion.a>
   );
};

export default CertBadge;
