import type { Variants } from "motion/react";
import { DURATION, EASING } from "@/constants/theme";

// ===== Shared Reveal Tokens =====
/** Travel for section-level reveals (PageSection, headers, banners). */
const OFFSET = 24;
/** Travel for list items inside a stagger container. */
const ITEM_OFFSET = 16;
/** One viewport margin for every whileInView reveal: fires 60px before the element clears the fold. */
export const VIEWPORT_MARGIN = "0px 0px -60px 0px";

// ===== Transition Presets =====
const transitions = {
   default: { duration: 0.5, ease: EASING.cinematic },
   item: { duration: 0.35, ease: EASING.cinematic },
};

// ===== Directional Fade (parameterized) =====
type Direction = "up" | "down" | "left" | "right" | "none";

const directionOffset: Record<Direction, { x?: number; y?: number }> = {
   up: { y: OFFSET },
   down: { y: -OFFSET },
   left: { x: -OFFSET },
   right: { x: OFFSET },
   none: {},
};

/** Parameterized fade variant. Use `createFade("up")` instead of stamping new variants. */
const createFade = (direction: Direction = "up"): Variants => ({
   hidden: { opacity: 0, ...directionOffset[direction] },
   visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: transitions.default,
   },
});

// Pre-built fades for common cases.
export const fadeInUp: Variants = createFade("up");
export const fadeInLeft: Variants = createFade("left");
export const fadeInRight: Variants = createFade("right");

// ===== Container / Stagger =====
export const staggerContainer: Variants = {
   hidden: {},
   visible: {
      transition: {
         staggerChildren: 0.06,
         delayChildren: 0.1,
      },
   },
};

export const staggerItem: Variants = {
   hidden: { opacity: 0, y: ITEM_OFFSET },
   visible: { opacity: 1, y: 0, transition: transitions.item },
};

// ===== Section Reveal =====
// Opacity + a short rise only: scaling a whole section promoted a viewport-sized
// layer and re-rasterised every card at the end of the tween.
export const sectionRevealEnhanced: Variants = {
   hidden: { opacity: 0, y: OFFSET },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASING.cinematic },
   },
};

// ===== Tamed Legacy Reveals =====
// Names kept for their consumers; the perspective, skew and 120px parking are gone.
export const rotateInUp: Variants = createFade("up");
// ===== Wave Cascade (for skill tags) =====
export const waveCascadeContainer: Variants = {
   hidden: {},
   visible: {
      transition: { staggerChildren: 0.04, delayChildren: 0.1 },
   },
};

export const waveCascadeItem: Variants = {
   hidden: { opacity: 0, y: ITEM_OFFSET, scale: 0.94 },
   visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: DURATION.default, ease: EASING.brisk },
   },
};
