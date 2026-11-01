import {
   motion,
   type TargetAndTransition,
   type Transition,
} from "motion/react";
import { staggerItem } from "@utils/animations";
import {
   TEXT_SECONDARY,
   BLUE_LIGHT,
   DURATION,
   EASING,
} from "@/constants/theme";
import SocialTiles from "../SocialTiles";

const TILE_STYLE: React.CSSProperties = {
   width: 44,
   height: 44,
   borderRadius: 10,
   border: "1px solid rgb(var(--ch-white) / 0.06)",
   // A literal, not a var() token: Motion tweens it to the hover fill.
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
   color: BLUE_LIGHT,
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

const FooterSocial = () => (
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
      <SocialTiles
         tileStyle={TILE_STYLE}
         hover={TILE_HOVER}
         tap={TILE_TAP}
         transition={TILE_TRANSITION}
         iconSize={16}
      />
   </motion.div>
);

export default FooterSocial;
