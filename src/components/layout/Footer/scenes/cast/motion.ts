/* The cast engine's timings and keyframe builders. Ported as is from the
   footer lab's cast.js: these numbers are the look the drafts were approved
   with, so change one only on purpose and check it on screen. */

import { EASING } from "@/constants/theme";

/** stage.stop() rejects a running show with this; stage.play() swallows it.
    A show that catches errors itself must rethrow it. */
export const STOPPED = new Error("cast: stopped");

export const noop = (): void => {};
export const clamp = (v: number, lo: number, hi: number): number =>
   Math.min(hi, Math.max(lo, v));

// One parabola split at its apex: these two quadratic halves give exactly
// y = 4h t (1 - t), so the rise slows into the apex and the fall speeds up.
export const RISE = "cubic-bezier(0.33, 0.67, 0.67, 1)";
export const FALL = "cubic-bezier(0.33, 0, 0.67, 0.33)";
export const OUT = `cubic-bezier(${EASING.cinematic.join(", ")})`;
export const IO = "cubic-bezier(0.45, 0, 0.55, 1)";

// Base timings in ms at rate 1: the brief's research numbers, tuned by eye.
// crouch = anticipation hold, touch = contact between chained hops,
// squash/settle = landing, rise = the standing frame springing up out of it.
export const T = {
   crouch: 90,
   touch: 80,
   squash: 70,
   settle: 110,
   rise: 140,
   seat: 200,
   fade: 320,
} as const;

// Where the tucked thighs are in the jump frame, as a fraction of frame
// height (read off the sheets). A hop into or out of a seat lines this row
// up with the ledge, so the body does not pop when the frame swaps.
export const JUMP_SEAT = 0.62;

/** One keyframe of a track: its time in ms, and the easing to the next. */
export interface Key {
   at: number;
   transform: string;
   opacity?: number;
   easing?: string;
}

// Keyframe builders, one per part.
export const tr = (x: number, y: number): string =>
   `translate(${x}px, ${-y}px)`;
const sc = (x: number, y: number, deg = 0): string =>
   `rotate(${deg}deg) scale(${x}, ${y})`;
/** root */
export const R = (at: number, x: number, y: number, easing?: string): Key => ({
   at,
   transform: tr(x, y),
   easing,
});
/** lift, + is up */
export const L = (at: number, y: number, easing?: string): Key => ({
   at,
   transform: `translateY(${-y}px)`,
   easing,
});
/** squash */
export const S = (
   at: number,
   x: number,
   y: number,
   deg = 0,
   easing?: string,
): Key => ({ at, transform: sc(x, y, deg), easing });
/** shadow */
export const D = (at: number, s: number, o: number, easing?: string): Key => ({
   at,
   transform: `scale(${s})`,
   opacity: o,
   easing,
});

/** [{ at: ms, ... }] -> Web Animations keyframes over ms (no easing =
    linear). Offsets never step back, so a very short move cannot throw. */
export const frames = (track: readonly Key[], ms: number): Keyframe[] => {
   let prev = 0;
   return track.map(({ at, easing, transform, opacity }) => {
      prev = Math.max(prev, clamp(at / ms, 0, 1));
      const k: Keyframe = { transform, offset: prev };
      if (opacity !== undefined) k.opacity = opacity;
      if (easing) k.easing = easing;
      return k;
   });
};

/** A fixed number in [0, 1) per string: ripple jitter and breath phase. */
export const seedOf = (s: string): number => {
   let h = 2166136261;
   for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
   return ((h >>> 0) % 997) / 997;
};
