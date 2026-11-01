import type { CSSProperties } from "react";
import {
   motion,
   type TargetAndTransition,
   type Transition,
} from "motion/react";
import {
   DURATION,
   EASING,
   GLASS_BORDER,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
} from "@/constants/theme";
import SocialTiles from "../SocialTiles";
import { heroRow } from "./heroMotion";

const TILE_STYLE: CSSProperties = {
   width: 44,
   height: 44,
   borderRadius: 10,
   border: `1px solid ${GLASS_BORDER}`,
   // A literal, not a var() token: Motion tweens it to the hover fill.
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

const HeroSocial = () => (
   <motion.div
      className="flex flex-wrap items-center justify-center gap-3 mt-2"
      variants={heroRow}
   >
      <SocialTiles
         tileStyle={TILE_STYLE}
         hover={TILE_HOVER}
         tap={TILE_TAP}
         transition={TILE_TRANSITION}
         iconSize={18}
      />
   </motion.div>
);

export default HeroSocial;
