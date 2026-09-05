import type { CSSProperties } from "react";
import { MONO_FONT } from "@/constants/theme";

/*
 * Shared vocabulary for the Unity 2D game covers (GameScene variants).
 *
 * Every branch draws its playfield inside one 160 x 100 viewBox, the slot's
 * own 16:10 ratio, so sprites, corridors and travel distances scale with the
 * card instead of overflowing on phones. Micro-labels stay HTML so they hold
 * their 7px size at every width.
 */

export const VIEW_BOX = "0 0 160 100";
export const MEET = "xMidYMid meet";
export const INK = "#0b1012";
export const NONE = "none";
export const NON_SCALING = "non-scaling-stroke";

export const WHITE_04 = "rgba(255,255,255,0.04)";
export const WHITE_06 = "rgba(255,255,255,0.06)";
export const WHITE_08 = "rgba(255,255,255,0.08)";
export const WHITE_12 = "rgba(255,255,255,0.12)";
export const WHITE_16 = "rgba(255,255,255,0.16)";
export const WHITE_20 = "rgba(255,255,255,0.20)";
export const WHITE_25 = "rgba(255,255,255,0.25)";
export const WHITE_28 = "rgba(255,255,255,0.28)";
export const WHITE_35 = "rgba(255,255,255,0.35)";
export const WHITE_70 = "rgba(255,255,255,0.70)";
export const WHITE_85 = "rgba(255,255,255,0.85)";
export const SHADOW_55 = "rgba(0,0,0,0.55)";

export const svgStyle: CSSProperties = {
   position: "absolute",
   inset: 0,
   width: "100%",
   height: "100%",
};

/** 7px uppercase mono micro-label; callers add the coordinates. */
export const labelStyle: CSSProperties = {
   position: "absolute",
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 0.8,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
   color: WHITE_35,
};

export type Ease = "linear" | "easeIn" | "easeOut" | "easeInOut";

/*
 * Motion hands opacity to WAAPI, where a single ease string stretches over
 * the whole iteration and drags keyframes off their `times`. One ease per
 * segment keeps every beat on the storyboard clock.
 */
export const eases = (segments: number, ease: Ease = "easeInOut"): Ease[] =>
   Array.from({ length: segments }, () => ease);

/** Infinite keyframe loop pinned to `times` (fractions of `duration`). */
export const loop = (
   duration: number,
   times: number[],
   ease: Ease = "easeInOut",
) => ({
   duration,
   repeat: Infinity,
   times,
   ease: eases(times.length - 1, ease),
});

/** Storyboard seconds -> fraction of the cycle. */
export const clock = (cycle: number) => (seconds: number) => seconds / cycle;
