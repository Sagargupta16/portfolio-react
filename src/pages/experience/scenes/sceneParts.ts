import type { CSSProperties } from "react";
import type { MotionStyle } from "motion/react";
import {
   clock,
   label,
   line,
   loopProps,
   pctX,
   pctY,
   ride,
   route,
   shown,
} from "@pages/projects/covers/kit/sceneTokens";
import type { Box, Loop, Pt } from "@pages/projects/covers/kit/sceneTokens";

/*
 * Timing and layout shared by the four engagement scenes: one 6 s clock,
 * everything lit holds until END and is gone by GONE, then resets while
 * hidden so the loop closes without a jump.
 */

const CYCLE = 6;
export const END = 0.92;
export const GONE = 0.95;

export const beat = clock(CYCLE);

/* The base every scene paints first; a slot shows it until its scene mounts. */
export const BASE_GRADIENT = "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)";

/*
 * loopProps plus an `initial` at each track's first keyframe. In Reduced mode
 * Motion skips transform loops, so without it a bar would rest at its CSS
 * default (scale 1, fully grown) instead of the frame the loop starts on.
 */
export const play = (loop: Loop) => {
   const props = loopProps(loop);
   const initial = Object.fromEntries(
      Object.entries(props.animate).map(([key, frames]) => [key, frames[0]]),
   );
   return { ...props, initial };
};

/* Fades in at `on` and holds until the scene clears. */
export const held = (on: number): Loop => beat(shown(on, GONE));

/* Fades in at `at` with a small overshoot, holds, clears. */
export const pop = (at: number): Loop =>
   beat({
      times: [0, at, at + 0.03, at + 0.05, END, GONE, 1],
      opacity: [0, 0, 1, 1, 1, 0, 0],
      scale: [0.9, 0.9, 1.06, 1, 1, 1, 0.9],
   });

/* A bar or bar group growing on one axis from `from` to `to`; it hides with
   the scene and shrinks back while hidden. */
const SCALE_IN = [0, 0, 1, 1, 1, 0, 0];
const growKeys = (from: number, to: number) => ({
   times: [0, from, to, END, GONE, 0.98, 1],
   opacity: [1, 1, 1, 1, 0, 0, 1],
});
export const growX = (from: number, to: number): Loop =>
   beat({ ...growKeys(from, to), scaleX: SCALE_IN });
/* The kit's track list has no scaleY; loopProps passes it through as is. */
export const growY = (
   from: number,
   to: number,
): Loop & { scaleY: number[] } => ({
   ...beat(growKeys(from, to)),
   scaleY: SCALE_IN,
});

/* A packet on a straight hop between two stage points. */
export const hop = (a: Pt, b: Pt, start: number, end: number): Loop =>
   beat(
      ride(route(line(a, b)), [
         [start, 0],
         [end, 1],
      ]),
   );

/* HTML box covering a stage rectangle, so it scales with the stage. */
export const area = ([x, y, w, h]: Box): CSSProperties => ({
   position: "absolute",
   left: pctX(x),
   top: pctY(y),
   width: pctX(w),
   height: pctY(h),
});

/* Fixed-px HTML box centred on a stage point. */
export const boxAt = ([x, y]: Pt, w: number, h: number): CSSProperties => ({
   position: "absolute",
   left: pctX(x),
   top: pctY(y),
   width: w,
   height: h,
   marginLeft: -w / 2,
   marginTop: -h / 2,
});

/* Tinted policy chip (SCP), centred on its stage point by Motion's x / y so
   a scale loop can share the transform. */
export const chip = (tint: string, [x, y]: Pt): MotionStyle => ({
   ...label,
   left: pctX(x),
   top: pctY(y),
   x: "-50%",
   y: "-50%",
   padding: "2px 4px",
   borderRadius: 3,
   border: `1px solid ${tint}80`,
   background: `${tint}1a`,
   color: tint,
});
