import { motion } from "motion/react";
import { EASING } from "@/constants/theme";
import { CARD_FILL, HAIRLINE } from "@components/ui/devAvatarData";
import {
   DRIFT,
   DRIFT_EASE,
   DRIFT_STAGGER,
   DRIFT_TIMES,
   ENTER_DELAY,
   ENTER_DURATION,
   ENTER_RISE,
   STAGGER_CAP,
   STAGGER_STEP,
   type HeroStackItem,
   type TileSize,
} from "./Header/heroStackData";

interface StackTileProps {
   item: HeroStackItem;
   /** Rank in the field: staggers the entrance and phases the drift. */
   index: number;
   size: TileSize;
   /** One drift cycle, seconds. */
   period: number;
   reducedMotion: boolean;
}

/**
 * One floating glyph tile: DevAvatar's flat chrome (card fill, hairline
 * border) around the skill's brand-colour mark, as the Skills section draws
 * it. The outer node fades and rises in once the hero copy has settled; the
 * inner node carries the drift loop, transform only, one ease per segment so
 * every track shares one schedule. Reduced leaves the tile at rest:
 * MotionConfig snaps the rise and only the fade plays.
 */
const StackTile = ({
   item,
   index,
   size,
   period,
   reducedMotion,
}: StackTileProps) => {
   const { Icon } = item;
   return (
      <motion.div
         initial={{ opacity: 0, y: ENTER_RISE }}
         animate={{ opacity: 1, y: 0 }}
         transition={{
            duration: ENTER_DURATION,
            ease: EASING.cinematic,
            delay: ENTER_DELAY + Math.min(index * STAGGER_STEP, STAGGER_CAP),
         }}
      >
         <motion.div
            style={{
               width: size.tile,
               height: size.tile,
               borderRadius: size.radius,
               background: CARD_FILL,
               border: `1px solid ${HAIRLINE}`,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
            }}
            animate={reducedMotion ? undefined : DRIFT}
            transition={{
               duration: period,
               times: DRIFT_TIMES,
               ease: DRIFT_EASE,
               repeat: Infinity,
               delay: index * DRIFT_STAGGER,
            }}
         >
            <Icon size={size.glyph} color={item.color} />
         </motion.div>
      </motion.div>
   );
};

export default StackTile;
