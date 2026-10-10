import type { Point } from "../infra/tokens";

/* MlopsScene clock and stage anchors (160 x 100 units). The loop spans
   roughly x 12 to 92 percent and y 12 to 81 percent of the slot; the Clinical
   Quality Gate is the focal point near the two-thirds line. */

export const CYCLE = 6;

export const TOP = 28;
export const BOTTOM = 76;

export const S3: Point = [19, TOP];
export const TRAIN_X = 44;
export const TRAIN_ROWS = [TOP - 14, TOP, TOP + 14];
export const ENSEMBLE: Point = [74, TOP];
export const GATE: Point = [104, TOP];
export const REGISTRY: Point = [134, TOP];
export const ENDPOINT: Point = [134, BOTTOM];
export const MONITOR: Point = [94, BOTTOM];
export const ALARM: Point = [52, BOTTOM];

export const trainer = (y: number): Point => [TRAIN_X, y];
