import { motion } from "motion/react";
import useMotionPreference from "@hooks/useMotionPreference";
import AvatarMonogram from "./AvatarMonogram";
import {
   AVATAR_SIZE,
   CARD_FILL,
   GLYPH_COLOR,
   GLYPH_SIZE,
   HAIRLINE,
   ORBIT_PERIOD,
   ORBIT_RADIUS,
   TILE_RADIUS,
   TILE_SIZE,
   orbitItems,
   orbitPosition,
} from "./devAvatarData";

const SPIN = {
   duration: ORBIT_PERIOD,
   repeat: Infinity,
   ease: "linear" as const,
};

/**
 * SG monogram with the real stack orbiting it. The ring turns clockwise once
 * per ORBIT_PERIOD and every tile counter-rotates so its logo stays upright;
 * that is the only motion. Disc, initials and dashed track never move, and
 * the entrance comes from About.tsx's wrapper variant, not from here.
 */
const DevAvatar = () => {
   const { reducedMotion } = useMotionPreference();
   const centre = AVATAR_SIZE / 2;

   return (
      <div
         aria-hidden="true"
         style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            position: "relative",
            margin: "0 auto",
         }}
      >
         <AvatarMonogram />

         {/* Dashed orbit track (same 0.06 hairline as the card borders) */}
         <svg
            style={{ position: "absolute", inset: 0 }}
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            viewBox={`0 0 ${AVATAR_SIZE} ${AVATAR_SIZE}`}
         >
            <circle
               cx={centre}
               cy={centre}
               r={ORBIT_RADIUS}
               fill="none"
               stroke={HAIRLINE}
               strokeWidth="1"
               strokeDasharray="4 6"
            />
         </svg>

         {/* Stack ring: one wrapper rotation plus eight counter-rotations */}
         <motion.div
            style={{ position: "absolute", inset: 0 }}
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={SPIN}
         >
            {orbitItems.map(({ name, Icon, angle }) => {
               const { x, y } = orbitPosition(angle);
               return (
                  <motion.div
                     key={name}
                     style={{
                        position: "absolute",
                        left: x - TILE_SIZE / 2,
                        top: y - TILE_SIZE / 2,
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        borderRadius: TILE_RADIUS,
                        background: CARD_FILL,
                        border: `1px solid ${HAIRLINE}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                     }}
                     animate={reducedMotion ? undefined : { rotate: -360 }}
                     transition={SPIN}
                  >
                     <Icon size={GLYPH_SIZE} color={GLYPH_COLOR} />
                  </motion.div>
               );
            })}
         </motion.div>
      </div>
   );
};

export default DevAvatar;
