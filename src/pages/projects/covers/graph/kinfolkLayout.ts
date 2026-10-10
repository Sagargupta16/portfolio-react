import type { Easing, Transition } from "motion/react";

/* Geometry, palette and beats for GraphScene (Kinfolk), in one 1600 x 1000
   viewBox that matches the 16:10 slot. Static hairlines are non-scaling;
   the consent draw is a pathLength draw, so it keeps a user-unit stroke
   (Chrome measures that dash in user units and strokes it in screen ones). */

export const CYCLE = 6;
export const VIEW_W = 1600;
export const VIEW_H = 1000;
export const GREEN = "#22c55e";
export const NON_SCALING = "non-scaling-stroke";
export const CARD_FILL = "#10181c";
export const WHITE_14 = "rgba(255,255,255,0.14)";
export const WHITE_22 = "rgba(255,255,255,0.22)";
export const WHITE_55 = "rgba(255,255,255,0.55)";

export const secs = (...stamps: number[]): number[] =>
   stamps.map((s) => s / CYCLE);

/* One ease per keyframe segment, so the WAAPI opacity of the HTML overlays
   and the JS tracks of the SVG keep one storyboard clock (skill rule 11). */
export const loop = (...stamps: number[]): Transition => {
   const times = secs(...stamps);
   const ease: Easing[] = times.slice(1).map(() => "easeInOut");
   return { duration: CYCLE, repeat: Infinity, times, ease };
};

export const hairline = (stroke: string) => ({
   fill: "none",
   stroke,
   strokeWidth: 1,
   vectorEffect: NON_SCALING,
});

/* Index card footprint and the three generation rows. */
export const CARD_W = 240;
export const CARD_H = 114;
export const HALF_W = CARD_W / 2;
export const HALF_H = CARD_H / 2;
export const CARD_RX = 18;
export const ROWS = [220, 480, 740];
/** Half height of a generation rail band. */
export const RAIL_HALF = 91;
export const ELBOW = 22;

export type Point = readonly [number, number];

export interface Family {
   partners: readonly [Point, Point];
   union: Point;
   barY: number;
   children: readonly [Point, Point];
}

/* Tree A: parents on row I, the shared human is their second child. */
export const TREE_A: Family = {
   partners: [
      [260, ROWS[0]],
      [560, ROWS[0]],
   ],
   union: [410, ROWS[0]],
   barY: 350,
   children: [
      [270, ROWS[1]],
      [550, ROWS[1]],
   ],
};
/* Tree B: the shared human and a partner on row II, their children on III. */
export const TREE_B: Family = {
   partners: [
      [1050, ROWS[1]],
      [1340, ROWS[1]],
   ],
   union: [1195, ROWS[1]],
   barY: 610,
   children: [
      [1060, ROWS[2]],
      [1330, ROWS[2]],
   ],
};
export const SHARED_A = TREE_A.children[1];
export const SHARED_B = TREE_B.partners[0];

/* The fused card lands mid slot; A's copy stops one sheet up and right, so
   it reads as the stacked sheet the app draws behind a fused person. */
export const FUSE_X = 800;
export const SHEET = 16;
export const SHIFT_A = FUSE_X - SHARED_A[0] + SHEET;
export const SHIFT_B = FUSE_X - SHARED_B[0];

/* The person_link between the two records, a low arc over row II. */
export const LINK_A: Point = [SHARED_A[0] + HALF_W, ROWS[1]];
export const LINK_B: Point = [SHARED_B[0] - HALF_W, ROWS[1]];
const ARC_Y = 410;
const CTRL_A = 757;
const CTRL_B = 843;
export const LINK = `M${LINK_A[0]} ${LINK_A[1]} C${CTRL_A} ${ARC_Y} ${CTRL_B} ${ARC_Y} ${LINK_B[0]} ${LINK_B[1]}`;
export const CONSENT = `M${LINK_B[0]} ${LINK_B[1]} C${CTRL_B} ${ARC_Y} ${CTRL_A} ${ARC_Y} ${LINK_A[0]} ${LINK_A[1]}`;

/** Points along the pending link, A to B, for the proposal in flight. */
export const ARC: Point[] = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => {
   const u = 1 - t;
   const x =
      u ** 3 * LINK_A[0] +
      3 * u * u * t * CTRL_A +
      3 * u * t * t * CTRL_B +
      t ** 3 * LINK_B[0];
   const y = (u ** 3 + t ** 3) * ROWS[1] + 3 * u * t * ARC_Y;
   return [x, y] as const;
});

/* Beats, cycle seconds. */
export const PROPOSE_FROM = 0.35;
export const PROPOSE_TO = 1.15;
export const CONSENT_AT = 1.3;
export const FUSE_FROM = 2.2;
export const FUSE_TO = 3.1;
export const UNLINK_FROM = 4.7;
export const UNLINK_TO = 5.6;

export const FUSE = loop(0, FUSE_FROM, FUSE_TO, UNLINK_FROM, UNLINK_TO, CYCLE);
