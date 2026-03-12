import type { Variants } from "motion/react";

// ===== Transition Presets =====
const transitions = {
   default: { duration: 0.6, ease: "easeOut" as const },
   spring: { type: "spring" as const, stiffness: 100, damping: 15 },
   quick: { duration: 0.3, ease: "easeInOut" as const },
};

// ===== Fade Animations =====
export const fadeInUp: Variants = {
   hidden: { opacity: 0, y: 60 },
   visible: { opacity: 1, y: 0, transition: transitions.default },
};

export const fadeInLeft: Variants = {
   hidden: { opacity: 0, x: -60 },
   visible: { opacity: 1, x: 0, transition: transitions.default },
};

export const fadeInRight: Variants = {
   hidden: { opacity: 0, x: 60 },
   visible: { opacity: 1, x: 0, transition: transitions.default },
};

export const fadeIn: Variants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1, transition: transitions.default },
};

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
   visible: { scaleX: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

// ===== Section Reveal (for IntersectionObserver) =====
export const sectionReveal: Variants = {
   hidden: { opacity: 0, y: 40 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
   },
};

// ===== Enhanced Section Reveal (with scale) =====
export const sectionRevealEnhanced: Variants = {
   hidden: { opacity: 0, y: 50, scale: 0.98 },
   visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
   },
};

// ===== 3D-Feel Reveals =====
export const rotateInUp: Variants = {
   hidden: { opacity: 0, y: 80, rotateX: 12, transformPerspective: 800 },
   visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
   },
};

// ===== Alternating Slide (for timelines) =====
export const slideInLeft: Variants = {
   hidden: { opacity: 0, x: -120, skewY: 1.5 },
   visible: {
      opacity: 1,
      x: 0,
      skewY: 0,
      transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
   },
};

export const slideInRight: Variants = {
   hidden: { opacity: 0, x: 120, skewY: -1.5 },
   visible: {
      opacity: 1,
      x: 0,
      skewY: 0,
      transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
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
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
   },
};

// ===== Clip-Path Reveal (for certifications) =====
export const clipRevealUp: Variants = {
   hidden: { opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
   visible: {
      opacity: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
   },
};

// ===== Scale + Rotate (for project cards) =====
export const scaleRotateIn: Variants = {
   hidden: { opacity: 0, scale: 0.7, rotate: -4 },
   visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 80, damping: 16 },
   },
};

// ===== Flip In (for service cards) =====
export const flipInY: Variants = {
   hidden: { opacity: 0, rotateY: -60, transformPerspective: 1000 },
   visible: {
      opacity: 1,
      rotateY: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
   },
};
