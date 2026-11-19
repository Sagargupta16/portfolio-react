/* The Pictionary scene's two layouts, ported from the footer lab's draft
   "Pictionary night" (pictionary-night/night.js) and re-fitted to the
   footer's stage: one box, 360 px tall at 768 px and wider and 300 px below,
   that also holds the row of answer chips. The draft had a 384 px (270 px on
   phones) scene with the chips under it, so every size here is the draft's
   scaled to the room that is left; the proportions between the board, the
   bench, the players and him are the draft's.

   Marks are px from the stage's centre, worked out from half the play
   width, so the picture holds at any width inside a breakpoint: the board
   on the left, him past its right edge, the bench under the board. */

import type { CastMemberId } from "../cast";

export interface Geo {
   /** Where he stands. */
   host: number;
   boardL: number;
   boardR: number;
   benchL: number;
   benchR: number;
   /** The first and the last seat. */
   seatL: number;
   seatR: number;
   /** px between the seated heads and the board's bottom edge. */
   clear: number;
   /** px between the stage's top edge and the board. */
   top: number;
}

export interface Layout {
   /** His frame height in px. */
   unit: number;
   /** px from the scene box's bottom edge (the top of the chips) up to the
       floor line. */
   floor: number;
   /** px under the answer chips. */
   pad: number;
   /** A speech chip's bottom, px over the head it belongs to. */
   sayUp: number;
   /** ms the marker takes over one doodle. */
   draw: number;
   /** A player's hop length on the way in, in body heights. */
   stride: number;
   /** px the ink keeps clear of the board's top (the label and the pause
       button) and bottom edge. */
   ink: readonly [top: number, bottom: number];
   /** The marker line's width on screen, in px. */
   inkPx: number;
   /** Who sits where, left to right. The seated members are ones whose legs
       hang alike (sit frame bottom about 0.91), so one bench height puts
       every pair of feet near the floor; nobody else on the bench wears
       blue, so the blue reads as the reader's. */
   seats: readonly CastMemberId[];
   /** Per doodle: the seat that guesses wrong, then the seat that gets it.
       Varied so most players get a moment; the visitor never guesses on
       their own (that is the reader's turn). On a phone the two guessers of
       one doodle are never neighbours, so their chips have room side by
       side. */
   plan: readonly (readonly [wrong: number, right: number])[];
   /** The two seats that doze when the scene is left alone. */
   doze: readonly [number, number];
   /** What the row of answer chips lines up with: the board (with the
       "your guess" label beside the chips), or the whole play area. */
   chips: "board" | "play";
   /** The play area's width inside a stage `width` px wide. */
   play: (width: number) => number;
   /** A player's size as a share of his, from half the play width. */
   sit: (half: number) => number;
   geo: (half: number) => Geo;
}

/** The answer chips' height: a touch target on every pointer, as in the
    draft. */
export const CHIP_H = 44;

/* On a stage much wider than the play area an entrance does not start at
   the screen's edge (the run-in would take seconds on a wide monitor and the
   draft's timing would be gone): the cast layer fades out over FADE px,
   starting RUN_IN px outside the play area, and entrants start in the dark
   just past it. */
export const RUN_IN = 50;
export const FADE = 60;

const clamp = (v: number, lo: number, hi: number): number =>
   Math.min(hi, Math.max(lo, v));

/* 768 px and wider: five friends and the visitor. The draft's desktop
   layout (720 px play column, him 230 px tall) at 0.87. */
export const WIDE: Layout = {
   unit: 200,
   floor: 14,
   pad: 8,
   sayUp: 8,
   draw: 2700,
   // longer than the engine's own 1.1: the players are smaller than the
   // draft's, and this keeps the run-in at the draft's four hops
   stride: 1.4,
   ink: [22, 18],
   inkPx: 3.3,
   seats: ["blazer", "bob", "mustard", "visitor", "grey", "backpack"],
   plan: [
      [1, 4],
      [5, 0],
      [0, 2],
      [2, 1],
   ],
   doze: [0, 5],
   chips: "board",
   play: (width) => Math.min(640, width - 48),
   sit: () => 0.57,
   geo: (half) => {
      const host = Math.round(half - 118);
      const right = host - 57;
      return {
         host,
         boardL: Math.round(-half + 26),
         boardR: right,
         benchL: Math.round(-half + 4),
         benchR: right + 8,
         seatL: Math.round(-half + 44),
         seatR: right - 35,
         clear: 10,
         top: 6,
      };
   },
};

/* Below 768 px: three friends and the visitor. The draft's phone layout
   with him at the same 176 px; the players are a little smaller (0.51 of
   him, 0.54 in the draft) so the board keeps its height. */
export const NARROW: Layout = {
   unit: 176,
   floor: 10,
   pad: 6,
   sayUp: 18, // clear of the board's bottom edge and of a jumper's head
   draw: 2700,
   stride: 1.1,
   ink: [26, 18],
   inkPx: 3,
   seats: ["bob", "mustard", "visitor", "grey"],
   plan: [
      [0, 3],
      [3, 1],
      [3, 0],
      [1, 3],
   ],
   doze: [0, 3],
   chips: "play",
   play: (width) => Math.min(520, width - 32),
   // smaller on a 320 px phone
   sit: (half) => clamp((0.51 * half) / 171.5, 0.44, 0.51),
   geo: (half) => {
      const host = Math.round(half - 66);
      const right = host - 50;
      return {
         host,
         boardL: Math.round(-half + 2),
         boardR: right,
         benchL: Math.round(-half),
         benchR: right + 6,
         seatL: Math.round(-half + 32),
         seatR: right - 22,
         clear: 8,
         top: 6,
      };
   },
};
