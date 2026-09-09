import { useMemo } from "react";
import {
   motion,
   type TargetAndTransition,
   type Transition,
} from "motion/react";
import { getSocialProfiles } from "@data/personal";
import { staggerItem } from "@utils/animations";
import { TEXT_SECONDARY, CYAN, DURATION, EASING } from "@/constants/theme";
import ICON_MAP from "@utils/iconMap";
import useMotionPreference from "@hooks/useMotionPreference";

const TILE_STYLE: React.CSSProperties = {
   width: 44,
   height: 44,
   borderRadius: 10,
   border: "1px solid rgba(255, 255, 255, 0.06)",
   backgroundColor: "rgba(255, 255, 255, 0.03)",
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   color: TEXT_SECONDARY,
};

/* Motion owns every hover property (the old inline CSS transition chased its
   per-frame writes). The tile pops on a spring; the colours tween. Hover and
   keyboard focus share one target. */
const TILE_HOVER: TargetAndTransition = {
   scale: 1.1,
   y: -2,
   color: CYAN,
   borderColor: "rgba(96, 165, 250, 0.3)",
   backgroundColor: "rgba(96, 165, 250, 0.08)",
};
const TILE_TAP: TargetAndTransition = { scale: 0.9 };
const COLOR_TWEEN: Transition = {
   duration: DURATION.quick,
   ease: EASING.brisk,
};
const TILE_TRANSITION: Transition = {
   type: "spring",
   stiffness: 420,
   damping: 18,
   color: COLOR_TWEEN,
   borderColor: COLOR_TWEEN,
   backgroundColor: COLOR_TWEEN,
};

const FooterSocial = () => {
   const socialProfiles = useMemo(() => getSocialProfiles(), []);
   const { reducedMotion } = useMotionPreference();
   // Reduced keeps the tiles at their resting design; the press stays.
   const hover = reducedMotion ? undefined : TILE_HOVER;

   return (
      <motion.div
         style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 12,
         }}
         variants={staggerItem}
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
                  <IconComponent size={16} />
               </motion.a>
            );
         })}
      </motion.div>
   );
};

export default FooterSocial;
