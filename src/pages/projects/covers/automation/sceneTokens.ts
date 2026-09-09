import { MONO_FONT } from "@/constants/theme";

/* Shared timing, palette and caption tokens for the AutomationScene family. */

export const CYCLE = 6;

/** Convert cycle timestamps in seconds to Motion `times` fractions. */
export const secs = (...stamps: number[]): number[] =>
   stamps.map((s) => s / CYCLE);

export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";

export const WHITE_03 = "rgba(255,255,255,0.03)";
export const WHITE_06 = "rgba(255,255,255,0.06)";
export const WHITE_10 = "rgba(255,255,255,0.10)";
export const WHITE_18 = "rgba(255,255,255,0.18)";
export const WHITE_25 = "rgba(255,255,255,0.25)";
export const WHITE_35 = "rgba(255,255,255,0.35)";
export const WHITE_50 = "rgba(255,255,255,0.5)";

export const CENTER_Y = "translateY(-50%)";
export const CENTER_XY = "translate(-50%, -50%)";

/** Three stage captions per variant, left to right along the pipeline. */
export type StageLabels = readonly [string, string, string];

export interface PipelineProps {
   tint: string;
   stages: StageLabels;
}

const label = (tint: string): React.CSSProperties => ({
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: "0.1em",
   textTransform: "uppercase",
   whiteSpace: "nowrap",
   color: `${tint}90`,
});

/** Caption hung centered under an absolutely positioned panel wrapper. */
export const caption = (tint: string): React.CSSProperties => ({
   ...label(tint),
   position: "absolute",
   top: "100%",
   left: "50%",
   marginTop: 7,
   transform: "translateX(-50%)",
});
