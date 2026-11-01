import { stagger, type TransformProperties, type Variants } from "motion/react";
import type { CSSProperties } from "react";
import { DURATION, EASING } from "@/constants/theme";

/* Hero entrance choreography. The hero is the one part of the page that
   animates on load rather than in view, so its variants live here instead of
   the shared set in utils/animations.ts. Every child is a one-shot transform +
   opacity tween; under Reduced, MotionConfig reducedMotion="always" snaps the
   transforms and lets the opacity fade. Last child lands well inside 1.2s. */

const STAGGER = 0.09;
const LEAD_IN = 0.15;
const LINE_STAGGER = 0.08;
const LOGO_DURATION = 0.5;

const entrance = (duration: number) => ({
   duration,
   ease: EASING.cinematic,
});

export const heroContainer: Variants = {
   hidden: {},
   visible: {
      transition: { delayChildren: stagger(STAGGER, { startDelay: LEAD_IN }) },
   },
};

export const heroLogo: Variants = {
   hidden: { opacity: 0, scale: 0.92 },
   visible: { opacity: 1, scale: 1, transition: entrance(LOGO_DURATION) },
};

/* Status badge: a short label that slides in from the left. */
export const heroLabel: Variants = {
   hidden: { opacity: 0, x: -14 },
   visible: { opacity: 1, x: 0, transition: entrance(DURATION.default) },
};

/* LATEST row: same slide, but it mounts whenever its lazy chunk lands rather
   than on the stagger, so it settles quickly instead of trailing the socials. */
export const heroLatest: Variants = {
   hidden: { opacity: 0, x: -14 },
   visible: { opacity: 1, x: 0, transition: entrance(DURATION.quick) },
};

/* The headline is a nested container: each line is clipped by its wrapper and
   slides up into view, the second a beat after the first. The lines carry no
   opacity change, so in Reduced they simply appear in place. */
export const heroHeadline: Variants = {
   hidden: {},
   visible: { transition: { delayChildren: stagger(LINE_STAGGER) } },
};

export const heroHeadlineLine: Variants = {
   hidden: { y: "110%" },
   visible: { y: "0%", transition: entrance(DURATION.slow) },
};

/* The intro paragraph is the LCP element (measured at 375px). Chrome skips
   anything painted at opacity 0, so held at 0 it only counted once the splash
   had lifted. At 0.001 it is painted (under the opaque splash) from the first
   render, yet that alpha rounds to 0 in an 8-bit blend and moves no pixel by
   more than a rounding step during the fade, so the entrance looks the same
   as it did from 0. */
const INTRO_HIDDEN_OPACITY = 0.001;

export const heroIntro: Variants = {
   hidden: { opacity: INTRO_HIDDEN_OPACITY, y: 16 },
   visible: { opacity: 1, y: 0, transition: entrance(DURATION.default) },
};

/* CTA row and social row. */
export const heroRow: Variants = {
   hidden: { opacity: 0, y: 12 },
   visible: { opacity: 1, y: 0, transition: entrance(DURATION.default) },
};

/* Clipping wrapper for one headline line. The bottom padding keeps the display
   face's descenders (g, y, p) inside the clip at rest; the matching negative
   margin gives that space back so the h1 keeps the height it had with a br. */
export const HEADLINE_MASK_STYLE: CSSProperties = {
   display: "block",
   overflow: "hidden",
   paddingBottom: "0.08em",
   marginBottom: "-0.08em",
};

/* The dimmed second headline line keeps the headline size wherever it fits and
   shrinks to the h1's width where it would wrap, so the headline stays two
   lines from 375px up without changing its words. The h1 is the size
   container (`@container w-full`, and the hero column is `w-full` so it keeps
   its width once the h1 stops pushing it). With every letter at
   ProximityText's heaviest weight (wght 800) the line measured 16.85 to 17.47
   times its font size wide (2026-11-01, 375 to 1920px; the high end is on
   phones, where the pointer effect is off), and 5.6cqi allows 17.9. The
   1.125rem floor keeps it above the 16px intro text; below about
   340px it wraps instead of shrinking further. The letter spacing is set
   again because `.display-heading`'s -0.035em resolves to pixels at the h1's
   size and a smaller line inherits those pixels (-1.12px on an 18px line). */
export const HEADLINE_FIT_STYLE: CSSProperties = {
   fontSize: "max(1.125rem, min(1em, 5.6cqi))",
   letterSpacing: "-0.035em",
};

/* Once a whileTap settles, Motion writes `transform: none` inline, which beats
   the .btn-* :hover lift in the stylesheet for good. Returning the generated
   string as-is leaves the inline transform empty at rest, so CSS owns the
   hover lift and Motion only writes during the press. */
export const passThroughTransform = (
   _transform: TransformProperties,
   generated: string,
) => generated;
