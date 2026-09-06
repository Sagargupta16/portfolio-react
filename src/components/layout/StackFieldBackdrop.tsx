import { useEffect, type CSSProperties } from "react";
import {
   motion,
   useMotionValue,
   useScroll,
   useTransform,
   type MotionValue,
} from "motion/react";
import useMediaQuery from "@hooks/useMediaQuery";
import useMotionPreference from "@hooks/useMotionPreference";
import usePointerParallax from "@hooks/usePointerParallax";
import { MEDIA_QUERIES } from "@/constants/theme";
import StackTile from "./StackTile";
import {
   END_FADE,
   FLANK_BAND,
   FLANK_SLOTS,
   TILE_OPACITY,
   TILE_SIZES,
   placeItems,
   type FlankSlot,
   type Placement,
} from "./Header/heroStackData";

const SIZE = TILE_SIZES.wide;
const placements = placeItems(FLANK_SLOTS);
/** Viewport height a tile's top can never use: both margins plus the tile. */
const BAND_INSET = FLANK_BAND.top + FLANK_BAND.bottom + SIZE.tile;

const LAYER_STYLE: CSSProperties = {
   position: "fixed",
   inset: 0,
   zIndex: 0,
   overflow: "hidden",
   pointerEvents: "none",
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => {
   const t = clamp01(value);
   return t * t * (3 - 2 * t);
};
const wrap = (value: number, length: number) =>
   ((value % length) + length) % length;

/**
 * Tile top inside the band for this scroll offset. Scrolling down carries
 * the tile up at its own speed; past the band's top it re-enters from the
 * bottom, so the field recycles instead of emptying.
 */
const bandPosition = (
   slot: FlankSlot,
   scroll: number,
   viewportHeight: number,
) => {
   const length = Math.max(viewportHeight - BAND_INSET, 1);
   return wrap(slot.rest * length - scroll * slot.speed, length);
};

/** 1 through the band's interior, 0 at either end, so the wrap is never seen. */
const edgeFade = (position: number, viewportHeight: number) => {
   const length = viewportHeight - BAND_INSET;
   return smoothstep(Math.min(position, length - position) / FLANK_BAND.fade);
};

/** Fades the field out over the last stretch of the page (see END_FADE). */
const endFadeAt = (progress: number) =>
   1 - smoothstep((progress - END_FADE.start) / END_FADE.span);

const edgeStyle = (slot: FlankSlot): CSSProperties =>
   slot.side === "left" ? { left: slot.edge } : { right: slot.edge };

const slotStyle = (slot: FlankSlot): CSSProperties => ({
   ...edgeStyle(slot),
   position: "absolute",
   width: SIZE.tile,
   height: SIZE.tile,
});

/** Rest position as CSS, for tiles that never take a scroll value. */
const restTop = (slot: FlankSlot) =>
   `calc(${FLANK_BAND.top}px + ${slot.rest} * (100% - ${BAND_INSET}px))`;

const readViewportHeight = () => globalThis.innerHeight;

/* One passive resize listener writes a MotionValue; no render on resize. */
const useViewportHeight = () => {
   const height = useMotionValue(readViewportHeight());
   useEffect(() => {
      const update = () => height.set(readViewportHeight());
      globalThis.addEventListener("resize", update, { passive: true });
      return () => globalThis.removeEventListener("resize", update);
   }, [height]);
   return height;
};

interface FieldValues {
   scrollY: MotionValue<number>;
   viewportHeight: MotionValue<number>;
   endFade: MotionValue<number>;
   pointerX: MotionValue<number>;
   pointerY: MotionValue<number>;
}

type FloatingTileProps = Placement<FlankSlot> & {
   index: number;
   values: FieldValues;
};

/* Outer node: scroll position (wrapped), pointer offset and edge fade, all
   derived MotionValues, so nothing here re-renders on scroll or pointer. */
const FloatingTile = ({ item, slot, index, values }: FloatingTileProps) => {
   const { scrollY, viewportHeight, endFade, pointerX, pointerY } = values;
   const position = useTransform(
      [scrollY, viewportHeight],
      ([scroll = 0, height = 0]: number[]) =>
         bandPosition(slot, scroll, height),
   );
   const y = useTransform(
      [position, pointerY],
      ([top = 0, pointer = 0]: number[]) =>
         FLANK_BAND.top + top + pointer * slot.depth,
   );
   const x = useTransform(pointerX, (pointer) => pointer * slot.depth);
   const opacity = useTransform(
      [position, viewportHeight, endFade],
      ([top = 0, height = 0, fade = 1]: number[]) =>
         TILE_OPACITY * edgeFade(top, height) * fade,
   );
   return (
      <motion.div style={{ ...slotStyle(slot), top: 0, x, y, opacity }}>
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

/* Full mode only: the scroll, viewport and pointer values exist just here. */
const FloatingTiles = ({ canHover }: { canHover: boolean }) => {
   const { scrollY, scrollYProgress } = useScroll();
   const viewportHeight = useViewportHeight();
   const endFade = useTransform(scrollYProgress, endFadeAt);
   const { x: pointerX, y: pointerY } = usePointerParallax({
      enabled: canHover,
   });
   const values = { scrollY, viewportHeight, endFade, pointerX, pointerY };
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

/* Reduced: every tile visible at its rest slot, no values and no listeners. */
const RestingTiles = () =>
   placements.map(({ item, slot }, index) => (
      <div
         key={item.name}
         style={{
            ...slotStyle(slot),
            top: restTop(slot),
            opacity: TILE_OPACITY,
         }}
      >
         <StackTile
            item={item}
            index={index}
            size={SIZE}
            period={slot.period}
            reducedMotion
         />
      </div>
   ));

/**
 * Site-wide floating stack field for wide viewports (>= 1280px): the ranked
 * hero_stack glyphs as flat tiles in the two viewport flanks, outside the
 * content column, on a fixed layer between the ambient glows and the page.
 * Three movements stack per tile: its own drift loop, a scroll-linked
 * parallax at its own speed (wrapped, so tiles recycle through the band
 * instead of leaving it for good) and pointer parallax where the pointer can
 * hover. Decorative only: aria-hidden, no pointer events. The in-app motion
 * preference is the only gate: Reduced keeps every tile visible at its rest
 * slot with no drift, no scroll or pointer values and no listeners. Below
 * 1280px HeroStackField owns the tiles inside the hero instead.
 */
const StackFieldBackdrop = () => {
   const { reducedMotion } = useMotionPreference();
   const wide = useMediaQuery(MEDIA_QUERIES.wide);
   const canHover = useMediaQuery(MEDIA_QUERIES.hover);

   if (!wide || placements.length === 0) return null;

   return (
      <div aria-hidden="true" style={LAYER_STYLE}>
         {reducedMotion ? (
            <RestingTiles />
         ) : (
            <FloatingTiles canHover={canHover} />
         )}
      </div>
   );
};

export default StackFieldBackdrop;
