import type { CSSProperties } from "react";
import { MONO_FONT } from "@/constants/theme";

/*
 * Tokens and timeline helpers shared by the three Terraform on AWS cover
 * families: InfraScene (blue/green and the Actions pipeline), MlopsScene and
 * GovernanceScene.
 *
 * Every scene draws on a 16:10 stage of 160 x 100 units, centred in the slot.
 * SVG uses that viewBox uniformly, so pathLength draws stay exact at any
 * width; HTML panels and packets sit at the same stage coordinates in
 * percent with fixed px sizes, so the mechanism still reads at 165 px.
 */

export interface TintProps {
   tint: string;
}

export type Point = readonly [x: number, y: number];

export const STAGE_W = 160;
export const STAGE_H = 100;
export const VIEWBOX = `0 0 ${STAGE_W} ${STAGE_H}`;

export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";
export const BASE_DARK = "#0b1012";
export const BASE_GRADIENT = `linear-gradient(160deg, #0e1a24 0%, ${BASE_DARK} 60%)`;
export const HAIRLINE = "rgba(255,255,255,0.10)";
export const WHITE_05 = "rgba(255,255,255,0.05)";
export const WHITE_18 = "rgba(255,255,255,0.18)";
export const WHITE_30 = "rgba(255,255,255,0.3)";
export const LABEL_DIM = "rgba(255,255,255,0.5)";
export const LABEL_LIT = "rgba(255,255,255,0.88)";
export const NON_SCALING = "non-scaling-stroke";
export const EASE = "easeInOut" as const;
export const LINEAR = "linear" as const;

export type Ease = typeof EASE | typeof LINEAR;

export const pctX = (x: number) => `${(x / STAGE_W) * 100}%`;
export const pctY = (y: number) => `${(y / STAGE_H) * 100}%`;

/*
 * Motion hands opacity to WAAPI, where a single ease string stretches over
 * the whole iteration and drags keyframes off their `times`, while x, y,
 * scale and the SVG stroke props ease per segment on the JS frameloop. One
 * ease per segment keeps every track on the storyboard clock.
 */
export const loop = (duration: number, times: number[], ease: Ease = EASE) => ({
   duration,
   times,
   ease: times.slice(1).map(() => ease),
   repeat: Infinity,
});

/* Fade in at `at`, hold, then fade out with the rest of the scene. */
export const appear = (at: number, rise = 0.04) => ({
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, at, at + rise, 0.92, 0.97, 1],
});

/* A linear sweep over the whole cycle, for dash flows and backdrop drift. */
export const sweep = (duration: number) => loop(duration, [0, 1], LINEAR);

export const fill: CSSProperties = { position: "absolute", inset: 0 };

export const svgLayer: CSSProperties = {
   ...fill,
   width: "100%",
   height: "100%",
   overflow: "visible",
};

/* px box centred on a stage point. */
export const boxAt = ([x, y]: Point, w: number, h: number): CSSProperties => ({
   position: "absolute",
   left: pctX(x),
   top: pctY(y),
   width: w,
   height: h,
   marginLeft: -w / 2,
   marginTop: -h / 2,
});

/* Mid layer: hairline border on an opaque dark fill, so the wiring and the
   packets beneath end cleanly at the panel edge at every slot width. */
export const panel = (radius = 6): CSSProperties => ({
   borderRadius: radius,
   border: `1px solid ${HAIRLINE}`,
   background: `linear-gradient(rgba(255,255,255,0.03), rgba(255,255,255,0.03)), ${BASE_DARK}`,
});

/* Same panel with the tint as its accent. */
export const tintPanel = (tint: string, radius = 6): CSSProperties => ({
   borderRadius: radius,
   border: `1px solid ${tint}59`,
   background: `linear-gradient(${tint}14, ${tint}14), ${BASE_DARK}`,
});

export const dotStyle = (size: number, color: string): CSSProperties => ({
   width: size,
   height: size,
   borderRadius: "50%",
   background: color,
});

export const label: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 8,
   fontWeight: 700,
   lineHeight: "8px",
   letterSpacing: "0.08em",
   textTransform: "uppercase",
   whiteSpace: "nowrap",
   color: LABEL_DIM,
};

/* Label centred on a stage x, offset in px above (-) or below (+) a stage y. */
export const labelAt = (
   [x, y]: Point,
   dy: number,
   color = LABEL_DIM,
): CSSProperties => ({
   ...label,
   position: "absolute",
   left: pctX(x),
   top: `calc(${pctY(y)} + ${dy}px)`,
   transform: "translateX(-50%)",
   color,
});

/* Cubic connector with horizontal tangents at both ends. */
export const curveH = ([x0, y0]: Point, [x1, y1]: Point) => {
   const mx = (x0 + x1) / 2;
   return `M ${x0} ${y0} C ${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
};

/* Cubic connector with vertical tangents at both ends. */
export const curveV = ([x0, y0]: Point, [x1, y1]: Point) => {
   const my = (y0 + y1) / 2;
   return `M ${x0} ${y0} C ${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
};
