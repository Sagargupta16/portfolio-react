import type { CSSProperties } from "react";
import { MONO_FONT } from "@/constants/theme";

/*
 * Shared vocabulary for the Unity 2D game covers (GameScene variants).
 *
 * Every branch draws its playfield inside one 160 x 100 viewBox, the slot's
 * own 16:10 ratio, so sprites, corridors and travel distances scale with the
 * card instead of overflowing on phones. Micro-labels stay HTML so they hold
 * their pixel size at every width.
 */

export const VIEW_BOX = "0 0 160 100";
export const MEET = "xMidYMid meet";
export const INK = "#0b1012";
export const NONE = "none";
export const NON_SCALING = "non-scaling-stroke";
export const ROUND = "round";

export const WHITE_03 = "rgba(255,255,255,0.03)";
export const WHITE_04 = "rgba(255,255,255,0.04)";
export const WHITE_05 = "rgba(255,255,255,0.05)";
export const WHITE_06 = "rgba(255,255,255,0.06)";
export const WHITE_08 = "rgba(255,255,255,0.08)";
export const WHITE_10 = "rgba(255,255,255,0.10)";
export const WHITE_12 = "rgba(255,255,255,0.12)";
export const WHITE_16 = "rgba(255,255,255,0.16)";
export const WHITE_20 = "rgba(255,255,255,0.20)";
export const WHITE_28 = "rgba(255,255,255,0.28)";
export const WHITE_35 = "rgba(255,255,255,0.35)";
export const WHITE_45 = "rgba(255,255,255,0.45)";
export const WHITE_55 = "rgba(255,255,255,0.55)";
export const WHITE_70 = "rgba(255,255,255,0.70)";
export const WHITE_85 = "rgba(255,255,255,0.85)";

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

/** The scene's one light: a faint tint wash centred on the focal point. */
export const washStyle = (tint: string, at: string): CSSProperties => ({
   position: "absolute",
   inset: 0,
   background: `radial-gradient(circle at ${at}, ${tint}1f, transparent 60%)`,
});

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

/** Loop `times`: 0, then each storyboard second as a fraction, then 1. */
export const beats =
   (cycle: number) =>
   (...seconds: number[]) => [0, ...seconds.map((s) => s / cycle), 1];
