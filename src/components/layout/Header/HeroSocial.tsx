import { useMemo, type CSSProperties } from "react";
import {
   motion,
   type TargetAndTransition,
   type Transition,
} from "motion/react";
import { getSocialProfiles } from "@data/personal";
import {
   DURATION,
   EASING,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
} from "@/constants/theme";
import ICON_MAP from "@utils/iconMap";
import useMotionPreference from "@hooks/useMotionPreference";
import { heroRow } from "./heroMotion";

const TILE_STYLE: CSSProperties = {
   width: 44,
   height: 44,
   borderRadius: 10,
   border: "1px solid rgba(255, 255, 255, 0.08)",
   backgroundColor: "rgba(255, 255, 255, 0.04)",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   color: TEXT_SECONDARY,
};

/* Motion owns every hover property here (the old inline CSS transition chased
   its per-frame writes). Hover and keyboard focus share one target. */
const TILE_HOVER: TargetAndTransition = {
   y: -3,
   scale: 1.06,
   color: TEXT_PRIMARY,
   borderColor: "rgba(255, 255, 255, 0.2)",
   backgroundColor: "rgba(255, 255, 255, 0.08)",
};
const TILE_TAP: TargetAndTransition = {
   scale: 0.9,
   transition: { duration: 0.12, ease: EASING.brisk },
};
const TILE_TRANSITION: Transition = {
   duration: DURATION.quick,
   ease: EASING.brisk,
};

const HeroSocial = () => {
   const socialProfiles = useMemo(() => getSocialProfiles(), []);
   const { reducedMotion } = useMotionPreference();
   // Reduced keeps the tiles at their resting design; the press stays.
   const hover = reducedMotion ? undefined : TILE_HOVER;

   return (
      <motion.div
         className="flex flex-wrap items-center justify-center gap-3 mt-2"
         variants={heroRow}
      >
         {socialProfiles.map((profile) => {
            const IconComponent = ICON_MAP[profile.icon];
            if (!IconComponent) return null;
            return (
               <motion.a
                  key={profile.id}
                  href={profile.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={TILE_STYLE}
                  whileHover={hover}
                  whileFocus={hover}
                  whileTap={TILE_TAP}
                  transition={TILE_TRANSITION}
                  aria-label={`Visit ${profile.name} profile (opens in a new tab)`}
               >
                  <IconComponent size={18} />
               </motion.a>
            );
         })}
      </motion.div>
   );
};

export default HeroSocial;
