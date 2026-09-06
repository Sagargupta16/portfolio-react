import type { CSSProperties, RefObject } from "react";
import {
   motion,
   useScroll,
   useTransform,
   type MotionValue,
} from "motion/react";
import useMediaQuery from "@hooks/useMediaQuery";
import useMotionPreference from "@hooks/useMotionPreference";
import usePointerParallax from "@hooks/usePointerParallax";
import { MEDIA_QUERIES } from "@/constants/theme";
import StackTile from "../StackTile";
import {
   HERO_STACK_SLOTS,
   TILE_OPACITY,
   TILE_SIZES,
   TOP_LANE_FADE,
   isTopLane,
   laneSign,
   placeItems,
   type HeroStackSlot,
   type Placement,
} from "./heroStackData";

const SIZE = TILE_SIZES.compact;
const placements = placeItems(HERO_STACK_SLOTS);

/* Slot position and resting alpha. Static, so the entrance and drift inside
   never fight it for opacity or transform. */
const slotStyle = (slot: HeroStackSlot): CSSProperties => ({
   position: "absolute",
   left: `${slot.x}%`,
   top: `${slot.y}%`,
   width: SIZE.tile,
   height: SIZE.tile,
   marginLeft: -SIZE.tile / 2,
   marginTop: -SIZE.tile / 2,
   opacity: TILE_OPACITY,
});

interface FieldValues {
   scrollY: MotionValue<number>;
   pointerX: MotionValue<number>;
   pointerY: MotionValue<number>;
}

type FloatingTileProps = Placement<HeroStackSlot> & {
   index: number;
   values: FieldValues;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/* Top-lane tiles fade with the first scroll; the bottom lane keeps its alpha. */
const laneOpacity = (slot: HeroStackSlot, scroll: number) =>
   isTopLane(slot)
      ? TILE_OPACITY * (1 - clamp01(scroll / TOP_LANE_FADE))
      : TILE_OPACITY;

/* Scroll slides the tile towards its own edge, never towards the copy; the
   shared pointer springs add a per-depth offset where the pointer can hover. */
const FloatingTile = ({ item, slot, index, values }: FloatingTileProps) => {
   const { scrollY, pointerX, pointerY } = values;
   const outward = laneSign(slot) * slot.speed;
   const x = useTransform(
      [scrollY, pointerX],
      ([scroll = 0, pointer = 0]: number[]) =>
         scroll * outward + pointer * slot.depth,
   );
   const y = useTransform(pointerY, (pointer) => pointer * slot.depth);
   const opacity = useTransform(scrollY, (scroll) => laneOpacity(slot, scroll));
   return (
      <motion.div style={{ ...slotStyle(slot), x, y, opacity }}>
         <StackTile
            item={item}
            index={index}
            size={SIZE}
            period={slot.period}
            reducedMotion={false}
         />
      </motion.div>
   );
};

interface FloatingTilesProps {
   hostRef: RefObject<HTMLElement | null>;
   canHover: boolean;
}

/* Full mode only: the scroll value, springs and pointer listener exist here. */
const FloatingTiles = ({ hostRef, canHover }: FloatingTilesProps) => {
   const { scrollY } = useScroll();
   const { x: pointerX, y: pointerY } = usePointerParallax({
      host: hostRef,
      enabled: canHover,
   });
   const values = { scrollY, pointerX, pointerY };
   return placements.map(({ item, slot }, index) => (
      <FloatingTile
         key={item.name}
         item={item}
         slot={slot}
         index={index}
         values={values}
      />
   ));
};

/* Reduced: every tile visible at its slot, no values and no listeners. */
const RestingTiles = () =>
   placements.map(({ item, slot }, index) => (
      <div key={item.name} style={slotStyle(slot)}>
         <StackTile
            item={item}
            index={index}
            size={SIZE}
            period={slot.period}
            reducedMotion
         />
      </div>
   ));

interface HeroStackFieldProps {
   /** The hero section: the pointer listener lives there, the layer under it. */
   hostRef: RefObject<HTMLElement | null>;
}

/**
 * Floating stack field inside the hero for phones and tablets: the six
 * top-ranked hero_stack glyphs as flat tiles in the hero's empty corners,
 * drifting on their own loops and sliding outward as the page scrolls.
 * Decorative only (aria-hidden, no pointer events, z-0 under the copy). The
 * in-app motion preference is the only gate: Reduced keeps the tiles visible
 * and still. From 1280px up StackFieldBackdrop owns the field instead.
 */
const HeroStackField = ({ hostRef }: HeroStackFieldProps) => {
   const { reducedMotion } = useMotionPreference();
   const wide = useMediaQuery(MEDIA_QUERIES.wide);
   const canHover = useMediaQuery(MEDIA_QUERIES.hover);

   if (wide || placements.length === 0) return null;

   return (
      <div
         aria-hidden="true"
         className="absolute inset-0 z-0 pointer-events-none"
      >
         {reducedMotion ? (
            <RestingTiles />
         ) : (
            <FloatingTiles hostRef={hostRef} canHover={canHover} />
         )}
      </div>
   );
};

export default HeroStackField;
