import type { Variants } from "motion/react";
import { DURATION, EASING } from "@/constants/theme";

// ===== Transition Presets =====
const transitions = {
   default: { duration: DURATION.default, ease: "easeOut" as const },
   quick: { duration: DURATION.quick, ease: "easeInOut" as const },
};

// ===== Directional Fade (parameterized) =====
type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET = 60;
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
         staggerChildren: 0.1,
         delayChildren: 0.2,
      },
   },
};

export const staggerItem: Variants = {
   hidden: { opacity: 0, y: 20 },
   visible: { opacity: 1, y: 0, transition: transitions.quick },
};

// ===== Enhanced Section Reveal (with scale) =====
export const sectionRevealEnhanced: Variants = {
   hidden: { opacity: 0, y: 50, scale: 0.98 },
   visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: EASING.smooth },
   },
};

// ===== 3D-Feel Reveals =====
export const rotateInUp: Variants = {
   hidden: { opacity: 0, y: 80, rotateX: 12, transformPerspective: 800 },
   visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.7, ease: EASING.smooth },
   },
};

// ===== Alternating Slide (for timelines) =====
export const slideInLeft: Variants = {
   hidden: { opacity: 0, x: -120, skewY: 1.5 },
   visible: {
      opacity: 1,
      x: 0,
      skewY: 0,
      transition: { duration: 0.65, ease: EASING.smooth },
   },
};

export const slideInRight: Variants = {
   hidden: { opacity: 0, x: 120, skewY: -1.5 },
   visible: {
      opacity: 1,
      x: 0,
      skewY: 0,
      transition: { duration: 0.65, ease: EASING.smooth },
   },
};

// ===== Wave Cascade (for skill tags) =====
export const waveCascadeContainer: Variants = {
   hidden: {},
   visible: {
      transition: { staggerChildren: 0.04, delayChildren: 0.1 },
   },
};

export const waveCascadeItem: Variants = {
   hidden: { opacity: 0, y: 30, scale: 0.85, filter: "blur(4px)" },
   visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: EASING.brisk },
   },
};
