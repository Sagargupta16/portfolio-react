import type { Variants } from "motion/react";
import { DURATION, EASING, SPRING } from "@/constants/theme";

// ===== Transition Presets =====
const transitions = {
   default: { duration: DURATION.default, ease: "easeOut" as const },
   spring: SPRING.default,
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
export const createFade = (direction: Direction = "up"): Variants => ({
   hidden: { opacity: 0, ...directionOffset[direction] },
   visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: transitions.default,
   },
});

// Pre-built fades for common cases (backwards-compat with existing usages).
export const fadeInUp: Variants = createFade("up");
export const fadeInLeft: Variants = createFade("left");
export const fadeInRight: Variants = createFade("right");
export const fadeIn: Variants = createFade("none");

// ===== Scale Animations =====
export const scaleIn: Variants = {
   hidden: { opacity: 0, scale: 0.8 },
   visible: { opacity: 1, scale: 1, transition: transitions.spring },
};

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

// ===== Line / Border =====
export const lineGrow: Variants = {
   hidden: { scaleX: 0, originX: 0 },
   visible: { scaleX: 1, transition: { duration: DURATION.slow, ease: "easeOut" } },
};

// ===== Section Reveal (for IntersectionObserver) =====
export const sectionReveal: Variants = {
   hidden: { opacity: 0, y: 40 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.default, ease: "easeOut" },
   },
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

// ===== Clip-Path Reveal (for certifications) =====
export const clipRevealUp: Variants = {
   hidden: { opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
   visible: {
      opacity: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      transition: { duration: DURATION.default, ease: EASING.smooth },
   },
};

// ===== Scale + Rotate (for project cards) =====
export const scaleRotateIn: Variants = {
   hidden: { opacity: 0, scale: 0.7, rotate: -4 },
   visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: SPRING.gentle,
   },
};

// ===== Flip In (for service cards) =====
export const flipInY: Variants = {
   hidden: { opacity: 0, rotateY: -60, transformPerspective: 1000 },
   visible: {
      opacity: 1,
      rotateY: 0,
      transition: { duration: 0.7, ease: EASING.smooth },
   },
};

// ===== Bento Cell (for About bento grid) =====
export const bentoCellContainer: Variants = {
   hidden: {},
   visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
   },
};

export const bentoCellItem: Variants = {
   hidden: { opacity: 0, y: 20, scale: 0.97 },
   visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: EASING.cinematic },
   },
};

// ===== Panel Enter (shared by glass panel cards) =====
export const PANEL_INITIAL = { opacity: 0, y: 30 } as const;
export const PANEL_VISIBLE = { opacity: 1, y: 0 } as const;
export const PANEL_TRANSITION = {
   duration: DURATION.default,
   ease: EASING.cinematic,
} as const;

// ===== Reduced-motion helpers =====
/** Collapses a variant to an instant opacity fade -- honor prefers-reduced-motion. */
export const REDUCED_MOTION_VARIANT: Variants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1, transition: { duration: 0 } },
};

/** Pick between full animation and reduced-motion fallback. */
export const motionSafe = (variant: Variants, reducedMotion: boolean): Variants =>
   reducedMotion ? REDUCED_MOTION_VARIANT : variant;
