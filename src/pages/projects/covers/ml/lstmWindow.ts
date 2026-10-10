/*
 * Data, geometry and storyboard for the Stock Market Prediction cover, in
 * the 160 x 100 viewBox. Names follow SMP.ipynb: seq_length 5, six
 * MinMaxScaler features per day, Close as the label column.
 */

export const BASE_GRADIENT = "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)";
export const WHITE_03 = "rgba(255,255,255,0.03)";
export const WHITE_04 = "rgba(255,255,255,0.04)";
export const WHITE_05 = "rgba(255,255,255,0.05)";
export const WHITE_10 = "rgba(255,255,255,0.10)";
export const WHITE_12 = "rgba(255,255,255,0.12)";
export const WHITE_20 = "rgba(255,255,255,0.20)";
export const WHITE_35 = "rgba(255,255,255,0.35)";
export const WHITE_45 = "rgba(255,255,255,0.45)";
export const WHITE_55 = "rgba(255,255,255,0.55)";
export const NONE = "none";
export const NON_SCALING = "non-scaling-stroke";
export const ROUND = "round";

export const CYCLE = 6;
export const t = (seconds: number) => seconds / CYCLE;

export type Ease = "linear" | "easeInOut";
/* One ease per keyframe segment so WAAPI opacity keeps to `times`. */
export const loop = (times: number[], ease: Ease = "easeInOut") => ({
   duration: CYCLE,
   repeat: Infinity,
   times,
   ease: times.slice(1).map(() => ease),
});

/* Chart: one Close price per day, viewBox units (0 0 160 100). */
export const DAY = 6;
export const dayX = (day: number) => 40 + DAY * day;
export const CLOSE_Y = [
   40, 38.5, 39.5, 36, 37.5, 34, 32.5, 34.5, 31, 30, 32, 28.5, 27, 29, 25.5,
   26.5, 23.5, 24.5,
];
export const CHART_TOP = 17;
export const CHART_BOTTOM = 47;
export const linePath = (points: { x: number; y: number }[]) =>
   points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join("");
export const CLOSE_POINTS = CLOSE_Y.map((y, day) => ({ x: dayX(day), y }));
export const CLOSE_D = linePath(CLOSE_POINTS);
/* A trailing mean, the faint SMA plot_moving_averages draws. */
export const SMA_D = linePath(
   CLOSE_Y.slice(3).map((_, i) => ({
      x: dayX(i + 3),
      y: CLOSE_Y.slice(i, i + 4).reduce((sum, y) => sum + y, 0) / 4,
   })),
);
export const GRID_Y = [23, 31, 39];

/* The rig: window over days 9..13, the next day is the label column. */
export const SEQ_LENGTH = 5;
export const FIRST_DAY = 9;
export const SEQ_DAYS = Array.from(
   { length: SEQ_LENGTH },
   (_, i) => FIRST_DAY + i,
);
export const NEXT_X = dayX(FIRST_DAY + SEQ_LENGTH);
export const FEATURES = ["Open", "High", "Low", "Close", "Volume", "Average"];
export const CLOSE_ROW = FEATURES.indexOf("Close");
export const FEATURE_TOP = 52.5;
export const FEATURE_PITCH = 1.5;
/* MinMaxScaler output per day and feature, drawn as dot strength. */
export const SCALED = [
   [0.52, 0.58, 0.47, 0.5, 0.31, 0.53],
   [0.49, 0.55, 0.44, 0.46, 0.62, 0.5],
   [0.6, 0.66, 0.55, 0.63, 0.4, 0.61],
   [0.66, 0.71, 0.6, 0.69, 0.78, 0.66],
   [0.62, 0.68, 0.57, 0.58, 0.45, 0.63],
];
export const CELL_Y = 66;
export const CELL = 4;
export const LINEAR_R = 2;

/* Storyboard: three windows, 1.5 s each, then the plot clears. */
export const STEPS = [0, 1, 2];
export const STEP = 1.5;
export const stepAt = (k: number) => 0.3 + STEP * k;
export const CLEAR = 5;
export const CLEARED = 5.3;
export const SNAP = 5.4;
export const BACK = 5.85;

export const RIG_TIMES = [
   0,
   ...[1, 2].flatMap((k) => [t(stepAt(k)), t(stepAt(k) + 0.3)]),
   t(SNAP - 0.05),
   t(SNAP),
   1,
];
export const RIG_X = [0, 0, DAY, DAY, DAY * 2, DAY * 2, 0, 0];
export const RIG_FADE_TIMES = [
   0,
   t(CLEAR),
   t(CLEARED),
   t(SNAP + 0.05),
   t(BACK),
   1,
];
export const RIG_OPACITY = [1, 1, 0, 0, 1, 1];

/* h: the hidden state walks the five cells, then enters nn.Linear. */
export const CELL_FIRST = dayX(FIRST_DAY);
export const CELL_LAST = dayX(FIRST_DAY + SEQ_LENGTH - 1);
export const H_TIMES = [
   0,
   ...STEPS.flatMap((k) =>
      [0.3, 0.9, 1.05, 1.15, 1.2].map((s) => t(stepAt(k) + s)),
   ),
   1,
];
export const H_X = [
   CELL_FIRST,
   ...STEPS.flatMap(() => [CELL_FIRST, CELL_LAST, NEXT_X, NEXT_X, CELL_FIRST]),
   CELL_FIRST,
];
export const H_FADE_TIMES = [
   0,
   ...STEPS.flatMap((k) => [0.27, 0.33, 1, 1.08].map((s) => t(stepAt(k) + s))),
   1,
];
export const H_OPACITY = [0, ...STEPS.flatMap(() => [0, 1, 1, 0]), 0];
/* The column being read while h passes it. */
export const SCAN_X = H_X.map((x) => Math.min(x, CELL_LAST));
export const SCAN_FADE_TIMES = [
   0,
   ...STEPS.flatMap((k) =>
      [0.27, 0.33, 0.85, 0.95].map((s) => t(stepAt(k) + s)),
   ),
   1,
];
export const SCAN_OPACITY = [0, ...STEPS.flatMap(() => [0, 1, 1, 0]), 0];

/* Predicted Close: lands next to the actual one, error bar between. */
export const PREDICTED_Y = [27.2, 25.6, 25.2];
export const PREDICTIONS = STEPS.map((k) => ({
   id: `day${FIRST_DAY + SEQ_LENGTH + k}`,
   k,
   x: dayX(FIRST_DAY + SEQ_LENGTH + k),
   y: PREDICTED_Y[k],
   actual: CLOSE_Y[FIRST_DAY + SEQ_LENGTH + k],
}));
export const landAt = (k: number) => stepAt(k) + 1.3;
export const OUT_TIMES = [
   0,
   ...STEPS.flatMap((k) => [1.05, 1.3, 1.35, 1.4].map((s) => t(stepAt(k) + s))),
   1,
];
export const OUT_Y = [
   CELL_Y - LINEAR_R,
   ...STEPS.flatMap((k) => [
      CELL_Y - LINEAR_R,
      PREDICTED_Y[k],
      PREDICTED_Y[k],
      CELL_Y - LINEAR_R,
   ]),
   CELL_Y - LINEAR_R,
];
export const OUT_FADE_TIMES = [
   0,
   ...STEPS.flatMap((k) =>
      [1.03, 1.08, 1.28, 1.36].map((s) => t(stepAt(k) + s)),
   ),
   1,
];
export const OUT_OPACITY = [0, ...STEPS.flatMap(() => [0, 1, 1, 0]), 0];
export const PREDICTED_D = linePath(PREDICTIONS);
export const segment = (
   a: { x: number; y: number },
   b: { x: number; y: number },
) => Math.hypot(b.x - a.x, b.y - a.y);
export const FIRST_SEGMENT =
   segment(PREDICTIONS[0], PREDICTIONS[1]) /
   (segment(PREDICTIONS[0], PREDICTIONS[1]) +
      segment(PREDICTIONS[1], PREDICTIONS[2]));
export const LINE_TIMES = [
   0,
   t(landAt(1)),
   t(landAt(1) + 0.15),
   t(landAt(2)),
   t(landAt(2) + 0.15),
   t(SNAP),
   t(SNAP + 0.05),
   1,
];
export const LINE_LENGTH = [0, 0, FIRST_SEGMENT, FIRST_SEGMENT, 1, 1, 0, 0];
