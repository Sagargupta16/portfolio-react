/* The carousel's two layouts and its timing, ported as is from the footer
   lab's draft "Around me" (carousel/carousel.js): these numbers are the look
   he approved, so change one only on purpose and check it on screen. */

import type { CastMemberId, Pose } from "../cast";

export const clamp = (v: number, lo: number, hi: number): number =>
   Math.min(hi, Math.max(lo, v));

/** Which side of the ring a mark is on: 1 the front half, -1 the back
    half, 0 an end of the ring. */
export type Side = 1 | -1 | 0;

/** A mark as a layout lists it: x as a fraction of the ring's half-width,
    its side, and who stands there first. */
export type MarkSpec = readonly [f: number, side: Side, id: CastMemberId];

export interface Layout {
   /** His frame height in px, from half the stage width. */
   him: (half: number) => number;
   /** A friend's frame height at the front, as a share of his. */
   crowd: number;
   /** The ring's horizontal radius from half the stage width. */
   rx: (half: number) => number;
   /** The ring's vertical radius: deep enough that the front and back rows
       sit apart on screen. */
   ry: number;
   /** Size at the back of the ring (1 at the front). */
   back: number;
   /** px below the ring's front edge. */
   floor: number;
   /** A crossing leaves its mark `vacate` ms before the next one lands on
       it, and lands `clear` ms after the owner of its next mark took off. */
   vacate: number;
   clear: number;
   /** Front and back marks alternate across the width, so nobody stands
       straight behind anybody; the front centre and the back centre stay
       empty. */
   marks: readonly MarkSpec[];
}

/* Eight friends and the visitor. */
export const WIDE: Layout = {
   him: (half) => clamp(half * 0.4, 214, 250),
   crowd: 0.8,
   rx: (half) => Math.min(500, half * 0.78),
   ry: 66,
   back: 0.74,
   floor: 16,
   vacate: 220,
   clear: 280,
   marks: [
      [-0.3, 1, "mustard"],
      [-0.74, 1, "denim"],
      [-0.96, -1, "blazer"],
      [-0.52, -1, "bob"],
      [0.26, -1, "rose"],
      [0.63, -1, "backpack"],
      [1, 0, "grey"],
      [0.815, 1, "teal"],
      [0.445, 1, "visitor"],
   ],
};

/* Five friends and the visitor. */
export const NARROW: Layout = {
   him: (half) => clamp(half, 180, 214),
   crowd: 0.7,
   rx: (half) => half - 54,
   ry: 34,
   back: 0.76,
   floor: 12,
   vacate: 380, // the phone's marks are closer together
   clear: 300,
   marks: [
      [-0.75, 1, "mustard"],
      [-1, 0, "denim"],
      [-0.44, -1, "rose"],
      [0.44, -1, "grey"],
      [1, 0, "teal"],
      [0.75, 1, "visitor"],
   ],
};

/** The query that makes the stage 360 px tall (footer.css). The layouts
    switch on it too, not on the stage's width, which a scrollbar narrows. */
export const WIDE_QUERY = "(min-width: 768px)";

/* Frames not to use, by member (checked on the strips of 2026-11-19). The
   visitor's land frame has the hood down and another face; its crouch (the
   same frame it takes off from) stands in. */
export const AVOID: Partial<Record<CastMemberId, readonly Pose[]>> = {
   visitor: ["land"],
};

/* ---- timing (ms) ---- */
export const BEAT = 2000; // one turn of the ring to the next
export const STEP = 140; // between take-offs along a queue in a turn
export const RATE = 1.5; // turn hops: a quicker crouch, about 120 ms of it on landing
export const DUCK = [420, 620] as const; // the scoot past his shins
export const WAVE_STEP = 110; // between neighbours in the wave round
export const CROUCH = 90; // the engine's anticipation before take-off (rate 1)
// The engine's landing after touch-down (rate 1): squash + settle on the
// standing frame, or squash + settle on the low frame + the rise.
export const TAIL = { idle: 180, low: 320 } as const;
export const HOLD = 650; // the email hold, when the control does not say
// A hold that has heard neither copied nor let go this long after the ring
// filled (a copy the browser refused) counts as let go.
export const HOLD_GRACE = 1000;
export const SLOW_AFTER = 30000; // left alone this long, the beat slows ...
export const SLOW_OVER = 12000; // ... to its slowest over this long ...
export const REST_AFTER = 44000; // ... and then everyone rests
/** One pass of the show: T turn, W wave round, C cheer. */
export const CYCLE = "TTTWTTTCTTTW";
