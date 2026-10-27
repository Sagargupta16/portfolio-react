import type { CSSProperties } from "react";
import { MONO_FONT } from "@/constants/theme";
import { clock, loopProps } from "@pages/projects/covers/kit/sceneTokens";
import type { Keys, Pt } from "@pages/projects/covers/kit/sceneTokens";

/*
 * Parts shared by the 80 px service canvases. Timing comes from the cover
 * kit (`clock`, `loopProps`, `shown`), so every keyframe track gets one ease
 * per segment and WAAPI opacity stays on the same clock as the transforms.
 */

/* Bind a scene's cycle once; the result spreads `animate` + `transition`
   onto a motion element. */
export const looping = (seconds: number) => {
   const tick = clock(seconds);
   return (keys: Keys) => loopProps(tick(keys));
};

export const CANVAS: CSSProperties = {
   position: "relative",
   width: 80,
   height: 80,
};

/* Neutral chrome, one step brighter than the cover kit's W03 / W10 / W16 /
   W25: at 2x and more, beside a full card of copy, those read as dim. */
export const CHROME_FILL = "rgba(255,255,255,0.05)";
export const CHROME_LINE = "rgba(255,255,255,0.16)";
export const CHROME_HAIR = "rgba(255,255,255,0.22)";
export const CHROME_GHOST = "rgba(255,255,255,0.32)";

/* Labels render at the project covers' 8 px (kit `label`) on every screen.
   The canvas is scaled as a whole, so ServiceAnimation sets --art-label to
   8 px divided by that scale; tracking is in em so it follows the size. */
export const LABEL_SIZE = "var(--art-label, 6px)";
export const LABEL_TRACK = "0.11em";

export const MICRO_LABEL: CSSProperties = {
   position: "absolute",
   fontFamily: MONO_FONT,
   fontSize: LABEL_SIZE,
   fontWeight: 700,
   letterSpacing: LABEL_TRACK,
   lineHeight: 1,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};

/* Absolute px box; border-box so a bordered panel keeps its footprint. */
export const box = (
   left: number,
   top: number,
   width: number,
   height: number,
): CSSProperties => ({
   position: "absolute",
   boxSizing: "border-box",
   left,
   top,
   width,
   height,
});

/* Fixed-size dot centred on a canvas point. */
export const dot = (
   [x, y]: Pt,
   size: number,
   background: string,
): CSSProperties => ({
   ...box(x - size / 2, y - size / 2, size, size),
   borderRadius: "50%",
   background,
});

/* A packet styled with `dot([0, 0], ...)` rides canvas points: each stop is
   [time, point, opacity], and x / y keyframes are the points themselves. */
type TripStop = readonly [t: number, at: Pt, opacity: number];

export const trip = (stops: readonly TripStop[]): Keys => ({
   times: stops.map(([t]) => t),
   x: stops.map(([, [x]]) => x),
   y: stops.map(([, [, y]]) => y),
   opacity: stops.map(([, , o]) => o),
});

const RAMP = 0.02;

type Span = readonly [on: number, off: number];

/* Opacity windows in one track: fade in at `on`, hold, gone by `off`. */
export const flashes = (...windows: readonly Span[]): Keys => ({
   times: [
      0,
      ...windows.flatMap(([on, off]) => [on, on + RAMP, off - RAMP, off]),
      1,
   ],
   opacity: [0, ...windows.flatMap(() => [0, 1, 1, 0]), 0],
});

/* Status pip or commit: pops in at `on` with a small overshoot, settles,
   shrinks away by `off`, and rests hidden at the loop seam. */
export const pop = (on: number, off: number): Keys => ({
   times: [0, on, on + 0.03, on + 0.06, off - 0.05, off, 1],
   scale: [0.6, 0.6, 1.3, 1, 1, 0.6, 0.6],
   opacity: [0, 0, 1, 1, 1, 0, 0],
});
