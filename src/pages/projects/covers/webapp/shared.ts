import type { CSSProperties } from "react";
import type { Transition } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

/* Primitives shared by the WebAppScene content panels. */

export interface PanelProps {
   tint: string;
}

/* A nav-rail item that lights up in step with the panel's own beats. */
export interface NavPulse {
   index: number;
   opacity: number[];
   transition: Transition;
}

export const WHITE_03 = "rgba(255,255,255,0.03)";
export const WHITE_06 = "rgba(255,255,255,0.06)";
export const WHITE_08 = "rgba(255,255,255,0.08)";
export const WHITE_10 = "rgba(255,255,255,0.10)";
export const WHITE_12 = "rgba(255,255,255,0.12)";
export const WHITE_14 = "rgba(255,255,255,0.14)";
export const WHITE_18 = "rgba(255,255,255,0.18)";
export const WHITE_22 = "rgba(255,255,255,0.22)";
export const WHITE_28 = "rgba(255,255,255,0.28)";
export const WHITE_35 = "rgba(255,255,255,0.35)";
export const WHITE_60 = "rgba(255,255,255,0.60)";
export const WHITE_85 = "rgba(255,255,255,0.85)";

export const HAIRLINE = `1px solid ${WHITE_10}`;

export const LABEL: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 1,
   lineHeight: 1,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};

/* Panel root: fills the content column under the header bar. */
export const PANEL: CSSProperties = {
   position: "relative",
   flex: 1,
   minHeight: 0,
};

/* Flat bordered card, same chrome as every other cover scene. */
export const CARD: CSSProperties = {
   border: HAIRLINE,
   borderRadius: 4,
   background: WHITE_03,
};

/* Infinite keyframe loop. `times` must match every keyframe array length. */
export const loop = (
   duration: number,
   times: number[],
   ease: Transition["ease"] = "easeInOut",
): Transition => ({
   duration,
   repeat: Infinity,
   times,
   ease,
});

/* Thin rounded bar standing in for a line of text. */
export const bar = (
   width: string | number,
   background: string,
   height = 3,
): CSSProperties => ({
   display: "block",
   height,
   width,
   borderRadius: 2,
   background,
});

/* Small round avatar disc in the tint family. */
export const avatar = (tint: string, size = 8): CSSProperties => ({
   display: "block",
   width: size,
   height: size,
   borderRadius: "50%",
   background: `${tint}20`,
   border: `1px solid ${tint}70`,
   flexShrink: 0,
});
