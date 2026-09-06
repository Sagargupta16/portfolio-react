import type { CSSProperties, ReactNode, RefObject } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import useMediaQuery from "@hooks/useMediaQuery";
import useMotionPreference from "@hooks/useMotionPreference";
import usePointerParallax from "@hooks/usePointerParallax";
import { EASING, MEDIA_QUERIES } from "@/constants/theme";
import { CARD_FILL, GLYPH_COLOR, HAIRLINE } from "@components/ui/devAvatarData";
import {
   DRIFT,
   DRIFT_STAGGER,
   DRIFT_TIMES,
   ENTER_DELAY,
   ENTER_DURATION,
   ENTER_RISE,
   HERO_STACK_SLOTS,
   TILE_OPACITY,
   TILE_SIZES,
   heroStackItems,
   type HeroStackItem,
   type HeroStackSlot,
   type TileSize,
} from "./heroStackData";

/* One ease per keyframe segment so every track shares one schedule (the
   cover scenes' perSegment helpers do the same). */
const DRIFT_EASE = DRIFT_TIMES.slice(1).map(() => "easeInOut" as const);
const STAGGER_STEP = 0.05;
const STAGGER_CAP = 0.3;

interface Placement {
   item: HeroStackItem;
   slot: HeroStackSlot;
}

/* Outer node: slot position and resting alpha. Static, so the entrance and
   drift below never fight it for opacity or transform. */
const slotStyle = (slot: HeroStackSlot, size: TileSize): CSSProperties => ({
   position: "absolute",
   left: `${slot.x}%`,
   top: `${slot.y}%`,
   width: size.tile,
   height: size.tile,
   marginLeft: -size.tile / 2,
   marginTop: -size.tile / 2,
   opacity: TILE_OPACITY,
});

interface TileProps {
   item: HeroStackItem;
   slot: HeroStackSlot;
   index: number;
   size: TileSize;
   reducedMotion: boolean;
}

/* Middle node fades and rises in once the copy has settled; the inner node is
   the visible tile and carries the drift loop. Reduced leaves the tile at
   rest: MotionConfig snaps the rise and only the fade plays. */
const Tile = ({ item, slot, index, size, reducedMotion }: TileProps) => {
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
               duration: slot.period,
               times: DRIFT_TIMES,
               ease: DRIFT_EASE,
               repeat: Infinity,
               delay: index * DRIFT_STAGGER,
            }}
         >
            <Icon size={size.glyph} color={GLYPH_COLOR} />
         </motion.div>
      </motion.div>
   );
};

interface ParallaxSlotProps {
   px: MotionValue<number>;
   py: MotionValue<number>;
   slot: HeroStackSlot;
   size: TileSize;
   children: ReactNode;
}

/* Pointer parallax on the outer node: the springs are shared, only the depth
   differs per tile, so nearer tiles travel further. */
const ParallaxSlot = ({ px, py, slot, size, children }: ParallaxSlotProps) => {
   const x = useTransform(px, (value) => value * slot.depth);
   const y = useTransform(py, (value) => value * slot.depth);
   return (
      <motion.div style={{ ...slotStyle(slot, size), x, y }}>
         {children}
      </motion.div>
   );
};

interface LayerProps {
   placements: Placement[];
   size: TileSize;
}

/* Mounted only when the pointer can hover and motion is Full, so the springs
   and the pointermove listener do not exist otherwise. */
const ParallaxTiles = ({
   hostRef,
   placements,
   size,
}: LayerProps & { hostRef: RefObject<HTMLElement | null> }) => {
   const { x: px, y: py } = usePointerParallax(hostRef);
   return placements.map(({ item, slot }, index) => (
      <ParallaxSlot key={item.name} px={px} py={py} slot={slot} size={size}>
         <Tile
            item={item}
            slot={slot}
            index={index}
            size={size}
            reducedMotion={false}
         />
      </ParallaxSlot>
   ));
};

const StaticTiles = ({
   placements,
   size,
   reducedMotion,
}: LayerProps & { reducedMotion: boolean }) =>
   placements.map(({ item, slot }, index) => (
      <div key={item.name} style={slotStyle(slot, size)}>
         <Tile
            item={item}
            slot={slot}
            index={index}
            size={size}
            reducedMotion={reducedMotion}
         />
      </div>
   ));

interface HeroStackFieldProps {
   /** The hero section: the pointer listener lives there, the layer under it. */
   hostRef: RefObject<HTMLElement | null>;
}

/**
 * Floating stack field: the ranked hero_stack glyphs as flat DevAvatar-style
 * tiles in the hero's empty corners and, on wide viewports, its flanks.
 * Decorative only (aria-hidden, no pointer events, z-0 under the copy). The
 * in-app motion preference is the only gate: Reduced keeps the tiles visible
 * and still, with no drift, no springs and no pointer listener.
 */
const HeroStackField = ({ hostRef }: HeroStackFieldProps) => {
   const { reducedMotion } = useMotionPreference();
   const wide = useMediaQuery(MEDIA_QUERIES.wide);
   const canHover = useMediaQuery(MEDIA_QUERIES.hover);

   const size = wide ? TILE_SIZES.wide : TILE_SIZES.compact;
   const slots = wide
      ? HERO_STACK_SLOTS
      : HERO_STACK_SLOTS.filter((slot) => !slot.wide);
   const placements = slots.flatMap((slot, index): Placement[] => {
      const item = heroStackItems.at(index);
      return item ? [{ item, slot }] : [];
   });

   if (placements.length === 0) return null;

   return (
      <div
         aria-hidden="true"
         className="absolute inset-0 z-0 pointer-events-none"
      >
         {canHover && !reducedMotion ? (
            <ParallaxTiles
               hostRef={hostRef}
               placements={placements}
               size={size}
            />
         ) : (
            <StaticTiles
               placements={placements}
               size={size}
               reducedMotion={reducedMotion}
            />
         )}
      </div>
   );
};

export default HeroStackField;
