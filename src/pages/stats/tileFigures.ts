import type { FigureTone } from "./statsTokens";

/* The small flat figure on each Stats band tile. A builder turns one tile's
   real numbers into SVG parts inside a FIGURE_H-tall box, and StatFigure
   reveals each part once as the tile scrolls in. A count figure draws exactly
   that many items; scaled ones (bars, curve, tally) keep one linear scale.
   When a number has no honest picture at this size a builder falls back to a
   plainer one or returns undefined, and the tile shows the quiet MARK. */

/** Figure box height in SVG units; widths vary by figure, up to MAX_W. */
export const FIGURE_H = 24;
/** Seconds a `draw` part takes to stroke in. */
export const DRAW_S = 0.8;

const MID = FIGURE_H / 2;
const PAD = 2;
// 100px on a 375px phone tile, where figures render 20px tall.
const MAX_W = 120;
const DOT_R = 2.6;

export type Shape =
   | { kind: "circle"; cx: number; cy: number; r: number; tone: FigureTone }
   | {
        kind: "rect";
        x: number;
        y: number;
        w: number;
        h: number;
        rx: number;
        tone: FigureTone;
     }
   | { kind: "path"; d: string; tone: FigureTone };

/** One step of the reveal, `at` seconds in: `draw` strokes a path in, `pop`
 *  scales its shapes up from their centre, `rise` grows them up from their
 *  base, `fade` brings them in where they stand. */
export type Part = { key: string; at: number } & (
   | { motion: "draw"; d: string; tone: FigureTone }
   | { motion: "pop" | "rise" | "fade"; shapes: Shape[] }
);

export interface Figure {
   width: number;
   parts: Part[];
}

// ---------- helpers ----------

const r1 = (n: number) => Math.round(n * 10) / 10;
const pt = (x: number, y: number) => `${r1(x)} ${r1(y)}`;
const range = (n: number) =>
   Array.from({ length: Math.max(n, 0) }, (_, i) => i);
const isCount = (n: number) => Number.isInteger(n) && n > 0;
const polyline = (points: [number, number][]) =>
   points.map(([x, y], i) => `${i ? "L" : "M"}${pt(x, y)}`).join(" ");

/** Item i of n, one after another, the whole run inside `spread` seconds. */
const step = (i: number, n: number, spread = 0.8) =>
   i * Math.min(0.09, spread / Math.max(n - 1, 1));
/** Item i of n spaced evenly along a line that draws in DRAW_S seconds. */
const along = (i: number, n: number) => (n > 1 ? (i / (n - 1)) * DRAW_S : 0);

const dot = (cx: number, cy: number, r = DOT_R): Shape => ({
   kind: "circle",
   cx: r1(cx),
   cy: r1(cy),
   r,
   tone: "solid",
});
// A ring's stroke straddles its radius, so it sits half a stroke inside.
const ring = (cx: number, cy: number, r = DOT_R): Shape => ({
   ...dot(cx, cy, r - 0.6),
   tone: "ring",
});
const rect = (
   x: number,
   y: number,
   w: number,
   h: number,
   tone: FigureTone,
   rx = 0,
): Shape => ({
   kind: "rect",
   x: r1(x),
   y: r1(y),
   w: r1(w),
   h: r1(h),
   rx,
   tone,
});
const path = (d: string, tone: FigureTone): Shape => ({
   kind: "path",
   d,
   tone,
});

/** A stable React key for a shape: no two shapes in a figure share one. */
export const shapeKey = (shape: Shape) => {
   if (shape.kind === "path") return shape.d;
   if (shape.kind === "circle") return `c${shape.cx},${shape.cy}`;
   return `r${shape.x},${shape.y},${shape.w}`;
};

const group = (
   motion: "pop" | "rise" | "fade",
   at: number,
   ...shapes: Shape[]
): Part => ({ key: `${motion}${shapeKey(shapes[0])}`, motion, at, shapes });
const draw = (d: string, tone: FigureTone, at = 0): Part => ({
   key: `draw${d}`,
   motion: "draw",
   at,
   d,
   tone,
});

const fits = (width: number) => width <= MAX_W;

// ---------- figures ----------

/** The quiet mark for a number with no honest picture: a dot and a rule. */
export const MARK: Figure = {
   width: 26,
   parts: [
      group("pop", 0, dot(PAD + DOT_R, MID)),
      draw(`M${pt(PAD + 2 * DOT_R + 3, MID)} H24`, "track", 0.1),
   ],
};

const PIP_R = 2.8;
const PIP_PITCH = 8.5;

/** `count` dots popping in one by one; the ones past `solid` are rings. */
export const pips = (count: number, solid = count): Figure | undefined => {
   const width = 2 * (PAD + PIP_R) + (count - 1) * PIP_PITCH;
   if (!isCount(count) || !fits(width)) return undefined;
   return {
      width: r1(width),
      parts: range(count).map((i) => {
         const cx = PAD + PIP_R + i * PIP_PITCH;
         const shape = i < solid ? dot(cx, MID, PIP_R) : ring(cx, MID, PIP_R);
         return group("pop", step(i, count), shape);
      }),
   };
};

const NODE_PITCH = 11;
const NODE_RISE = 4.5;

/** `count` nodes on a zigzag link that draws through them. */
export const nodes = (count: number): Figure | undefined => {
   const width = 2 * (PAD + DOT_R) + (count - 1) * NODE_PITCH;
   if (!isCount(count) || count < 2 || !fits(width)) return pips(count);
   const points = range(count).map((i): [number, number] => [
      PAD + DOT_R + i * NODE_PITCH,
      MID + (i % 2 ? NODE_RISE : -NODE_RISE),
   ]);
   return {
      width: r1(width),
      parts: [
         draw(polyline(points), "dim"),
         ...points.map(([x, y], i) => group("pop", along(i, count), dot(x, y))),
      ],
   };
};

export type Glyph = "repo" | "talk" | "cert";
const GLYPH_W: Record<Glyph, number> = { repo: 10, talk: 13, cert: 10 };
const GLYPH_H = 13;
const GLYPH_GAP = 4;

const glyphShapes = (glyph: Glyph, x: number): Shape[] => {
   const y = MID - GLYPH_H / 2;
   switch (glyph) {
      // a repo, drawn as a book: outline and a solid spine
      case "repo":
         return [
            rect(x + 0.6, y + 0.6, 8.8, GLYPH_H - 1.2, "ring", 1.6),
            rect(x, y, 3.2, GLYPH_H, "solid", 1.2),
         ];
      // a talk: a slide on a stand
      case "talk":
         return [
            rect(x + 0.6, y + 0.6, 11.8, 8.4, "ring", 1.4),
            rect(x + 3.2, y + 3.9, 6.6, 1.8, "solid", 0.9),
            path(
               `M${pt(x + 6.5, y + 9)} V${r1(y + 12.4)} M${pt(x + 3.5, y + 12.4)} H${r1(x + 9.5)}`,
               "line",
            ),
         ];
      // a certification: a rosette, two ribbon tails under a disc
      case "cert":
         return [
            path(
               `M${pt(x + 2.8, y + 7)} L${pt(x + 1.4, y + 13)} L${pt(x + 3.4, y + 12)} L${pt(x + 4.8, y + 8.2)} Z ` +
                  `M${pt(x + 7.2, y + 7)} L${pt(x + 8.6, y + 13)} L${pt(x + 6.6, y + 12)} L${pt(x + 5.2, y + 8.2)} Z`,
               "half",
            ),
            dot(x + 5, y + 4.6, 4.4),
         ];
   }
};

/** One glyph per item, in runs: `glyphs(["talk", 2], ["repo", 3])`. */
export const glyphs = (...runs: [Glyph, number][]): Figure | undefined => {
   const list = runs.flatMap(([glyph, n]) => range(n).map(() => glyph));
   let x = PAD;
   const xs = list.map((glyph) => {
      const at = x;
      x += GLYPH_W[glyph] + GLYPH_GAP;
      return at;
   });
   const width = x - GLYPH_GAP + PAD;
   if (!list.length || !fits(width)) return pips(list.length);
   return {
      width: r1(width),
      parts: list.map((glyph, i) =>
         group("pop", step(i, list.length), ...glyphShapes(glyph, xs[i])),
      ),
   };
};

const HEX_R = 3.4;
const HEX_W = Math.sqrt(3) * HEX_R;
const HEX_PITCH = 8.6;
const HEX_ROW = 8.2;
const HEX_PER_ROW = 12;
const HEX_MAX_ROWS = 3;

const hexagon = (cx: number, cy: number) =>
   polyline(
      range(6).map((k): [number, number] => {
         const angle = ((60 * k - 90) * Math.PI) / 180;
         return [cx + HEX_R * Math.cos(angle), cy + HEX_R * Math.sin(angle)];
      }),
   ) + " Z";

/** One hexagon per badge in a honeycomb strip, filled column by column. */
export const hexes = (count: number): Figure | undefined => {
   const rows = Math.ceil(count / HEX_PER_ROW);
   if (!isCount(count) || rows > HEX_MAX_ROWS)
      return waffle(split(count, count));
   const cols = Math.ceil(count / rows);
   const offset = rows > 1 ? HEX_PITCH / 2 : 0;
   const top = MID - ((rows - 1) * HEX_ROW) / 2;
   return {
      width: r1(2 * PAD + (cols - 1) * HEX_PITCH + offset + HEX_W),
      parts: range(count).map((i) => {
         const col = Math.floor(i / rows);
         const row = i % rows;
         const cx = PAD + HEX_W / 2 + col * HEX_PITCH + (row % 2) * offset;
         return group(
            "pop",
            step(i, count),
            path(hexagon(cx, top + row * HEX_ROW), "solid"),
         );
      }),
   };
};

const SPOKE_LEN = 24;
const SPOKE_SPAN = 18;
const SPOKE_MAX = 4;

/** One hub and `count` spokes out to `count` nodes. */
export const spokes = (count: number): Figure | undefined => {
   if (!isCount(count) || count > SPOKE_MAX) return pips(count);
   const hub = PAD + DOT_R;
   const x = hub + SPOKE_LEN;
   const ys = range(count).map((i) =>
      count === 1 ? MID : MID - SPOKE_SPAN / 2 + (i * SPOKE_SPAN) / (count - 1),
   );
   return {
      width: r1(x + DOT_R + PAD),
      parts: [
         group("pop", 0, ring(hub, MID)),
         ...ys.map((y, i) =>
            draw(
               `M${pt(hub + DOT_R + 1, MID)} L${pt(x - DOT_R - 1, y)}`,
               "dim",
               0.15 + step(i, count, 0.3),
            ),
         ),
         ...ys.map((y, i) =>
            group("pop", DRAW_S + step(i, count, 0.3), dot(x, y)),
         ),
      ],
   };
};

const YEAR_W = 18;
const TICK_H = 10;
const NOW_TAIL = 9;

/** A timeline with a tick at every full year; `ongoing` runs it on past the
 *  last tick to a dot for now. */
export const years = (count: number, ongoing: boolean): Figure | undefined => {
   if (!isCount(count)) return undefined;
   const x0 = PAD + 1;
   const pitch = Math.min(
      YEAR_W,
      (MAX_W - 2 * PAD - 1 - DOT_R - NOW_TAIL) / count,
   );
   const end = x0 + count * pitch + (ongoing ? NOW_TAIL : 0);
   const tick = (k: number) => {
      const x = x0 + k * pitch;
      return group(
         "pop",
         ((x - x0) / (end - x0)) * DRAW_S,
         path(`M${pt(x, MID - TICK_H / 2)} V${MID + TICK_H / 2}`, "line"),
      );
   };
   return {
      width: r1(end + (ongoing ? DOT_R : 1) + PAD),
      parts: [
         draw(`M${pt(x0, MID)} H${r1(end)}`, "dim"),
         ...range(count + 1).map(tick),
         ...(ongoing ? [group("pop", DRAW_S, dot(end, MID))] : []),
      ],
   };
};

const CHEVRON_W = 18;
const CHEVRON_H = 6;
const CHEVRON_PITCH = 6.5;
const CHEVRON_MAX = 3;

/** Rank chevrons stacked upward, one per level held, lowest first. */
export const chevrons = (count: number): Figure | undefined => {
   if (!isCount(count) || count > CHEVRON_MAX) return pips(count);
   const x = PAD + 1;
   const bottom = MID + ((count - 1) * CHEVRON_PITCH + CHEVRON_H) / 2;
   return {
      width: r1(2 * x + CHEVRON_W),
      parts: range(count).map((i) => {
         const y = bottom - i * CHEVRON_PITCH;
         return draw(
            `M${pt(x, y)} L${pt(x + CHEVRON_W / 2, y - CHEVRON_H)} L${pt(x + CHEVRON_W, y)}`,
            "bold",
            i * 0.35,
         );
      }),
   };
};

const WAFFLE_ROWS = 5;
const WAFFLE_MAX_ROWS = 12;
const CELL_FILL = 0.76;

/** `count` tones, the first `solid` of them solid and the rest `rest`. */
export const split = (
   count: number,
   solid: number,
   rest: FigureTone = "faint",
): FigureTone[] => range(count).map((i) => (i < solid ? "solid" : rest));

/** One cell per item, in columns of five (more when the run would not fit),
 *  filled in column by column. */
export const waffle = (cells: FigureTone[]): Figure | undefined => {
   const count = cells.length;
   if (!count) return undefined;
   let rows = WAFFLE_ROWS;
   const widthAt = (r: number) =>
      2 * PAD + (Math.ceil(count / r) - 1 + CELL_FILL) * (FIGURE_H / r);
   while (!fits(widthAt(rows)) && rows < WAFFLE_MAX_ROWS) rows++;
   if (!fits(widthAt(rows))) return undefined;
   const pitch = FIGURE_H / rows;
   const size = pitch * CELL_FILL;
   const inset = (pitch - size) / 2;
   const cols = Math.ceil(count / rows);
   return {
      width: r1(widthAt(rows)),
      parts: range(cols).map((col) =>
         group(
            "fade",
            step(col, cols),
            ...cells
               .slice(col * rows, (col + 1) * rows)
               .map((tone, row) =>
                  rect(
                     PAD + col * pitch,
                     inset + row * pitch,
                     size,
                     size,
                     tone,
                     r1(size * 0.22),
                  ),
               ),
         ),
      ),
   };
};

const HEAT: FigureTone[] = ["faint", "half", "solid"];

/** One tone per value, by where it sits between the lowest and highest. */
export const heat = (values: number[]): FigureTone[] => {
   const lo = Math.min(...values);
   const span = Math.max(Math.max(...values) - lo, 1);
   return values.map(
      (v) => HEAT[Math.min(HEAT.length - 1, Math.floor(((v - lo) / span) * 3))],
   );
};

const STEP_W = 13;
const STEP_GAP = 1.5;
// 1st, 2nd, 3rd; drawn second, first, third from the left.
const STEP_H = [11.5, 8, 5];
const STEP_ORDER = [1, 0, 2];
const PODIUM_BASE = FIGURE_H - 1.5;
const MEDAL_R = 1.8;
const MEDAL_PITCH = 4.4;
const MEDALS_PER_ROW = 3;
const MEDAL_MAX = 6;

/** Podium steps carrying one dot per finish in that place. `places` is
 *  [first, second, third]. */
export const podiumSteps = (places: number[]): Figure | undefined => {
   const total = places.reduce((sum, n) => sum + n, 0);
   if (places.some((n) => !Number.isInteger(n) || n < 0 || n > MEDAL_MAX))
      return pips(total);
   if (!total) return undefined;
   const parts = STEP_ORDER.flatMap((place, slot) => {
      const x = PAD + slot * (STEP_W + STEP_GAP);
      const top = PODIUM_BASE - STEP_H[place];
      const stepPart = group(
         "rise",
         step(slot, 3, 0.2),
         rect(x, top, STEP_W, STEP_H[place], "faint", 1),
      );
      const medals = range(places[place]).map((k) => {
         const row = Math.floor(k / MEDALS_PER_ROW);
         const inRow = Math.min(
            MEDALS_PER_ROW,
            places[place] - row * MEDALS_PER_ROW,
         );
         const col = k % MEDALS_PER_ROW;
         const cx = x + STEP_W / 2 + (col - (inRow - 1) / 2) * MEDAL_PITCH;
         const cy = top - MEDAL_R - 1.2 - row * MEDAL_PITCH;
         // first place's dots land first, then second's, then third's
         const at = 0.4 + place * 0.2 + k * 0.07;
         return group("pop", at, dot(cx, cy, MEDAL_R));
      });
      return [stepPart, ...medals];
   });
   return { width: r1(2 * PAD + 3 * STEP_W + 2 * STEP_GAP), parts };
};

const RAIL_PITCH = 7.5;
const COMMIT_R = 2.4;

/** Commits on a rail: a solid dot per `solid` item, then a ring per `rings`. */
export const rail = (solid: number, rings = 0): Figure | undefined => {
   const count = solid + rings;
   if (!isCount(count)) return undefined;
   const pitch = Math.min(
      RAIL_PITCH,
      (MAX_W - 2 * (PAD + COMMIT_R)) / Math.max(count - 1, 1),
   );
   if (pitch < 2 * COMMIT_R + 1) return waffle(split(count, solid));
   const x = (i: number) => PAD + COMMIT_R + i * pitch;
   return {
      width: r1(2 * (PAD + COMMIT_R) + (count - 1) * pitch),
      parts: [
         ...(count > 1
            ? [draw(`M${pt(x(0), MID)} H${r1(x(count - 1))}`, "track")]
            : []),
         ...range(count).map((i) =>
            group(
               "pop",
               along(i, count),
               i < solid ? dot(x(i), MID, COMMIT_R) : ring(x(i), MID, COMMIT_R),
            ),
         ),
      ],
   };
};

const BAR_PITCH = 6.6;
const BAR_FILL = 0.64;
const BAR_MIN = 1.2;
const BAR_TOP = 2;
const BAR_BASE = 21.5;

/** One bar per value, tallest first, all to one linear scale on a baseline. */
export const bars = (values: number[]): Figure | undefined => {
   const sorted = values.filter((v) => v > 0).sort((a, b) => b - a);
   if (!sorted.length) return undefined;
   const pitch = Math.min(BAR_PITCH, (MAX_W - 2 * PAD) / sorted.length);
   const w = pitch * BAR_FILL;
   const width = 2 * PAD + (sorted.length - 1) * pitch + w;
   return {
      width: r1(width),
      parts: [
         draw(`M${pt(PAD, BAR_BASE + 1.2)} H${r1(width - PAD)}`, "track"),
         ...sorted.map((v, i) => {
            const h = Math.max(BAR_MIN, (v / sorted[0]) * (BAR_BASE - BAR_TOP));
            return group(
               "rise",
               step(i, sorted.length),
               rect(PAD + i * pitch, BAR_BASE - h, w, h, "solid", 0.8),
            );
         }),
      ],
   };
};

const CURVE_W = 76;
const CURVE_TOP = 5;
const CURVE_BASE = 20;

/** Every value in order as one line drawing left to right; a ring lands on
 *  the highest. */
export const curve = (values: number[]): Figure | undefined => {
   if (values.length < 2) return undefined;
   const lo = Math.min(...values);
   const hi = Math.max(...values);
   const span = Math.max(hi - lo, 1);
   const x0 = PAD + DOT_R;
   const xSpan = CURVE_W - 2 * x0;
   const points = values.map((v, i): [number, number] => [
      x0 + (i / (values.length - 1)) * xSpan,
      CURVE_BASE - ((v - lo) / span) * (CURVE_BASE - CURVE_TOP),
   ]);
   const [px, py] = points[values.indexOf(hi)];
   return {
      width: CURVE_W,
      parts: [
         draw(polyline(points), "line"),
         group("pop", DRAW_S, ring(px, py, DOT_R + 0.4)),
      ],
   };
};

const RULER_TICKS = 20;
const RULER_PITCH = 4.4;
const RULER_BASE = 20;
const MARKER_W = 5.6;

/** A ruler across the whole field, a tick per 5%; a marker drops at the
 *  `top` percent position and the ticks past it light up. */
export const ruler = (top: number): Figure | undefined => {
   if (!(top > 0 && top < 100)) return undefined;
   const x0 = PAD + MARKER_W / 2;
   const span = (RULER_TICKS - 1) * RULER_PITCH;
   const mark = x0 + (1 - top / 100) * span;
   return {
      width: r1(2 * x0 + span),
      parts: [
         ...range(RULER_TICKS).map((k) => {
            const x = x0 + k * RULER_PITCH;
            const lit = x >= mark - 0.01;
            return group(
               "rise",
               step(k, RULER_TICKS, 0.6),
               path(
                  `M${pt(x, RULER_BASE - (lit ? 10 : 6))} V${RULER_BASE}`,
                  lit ? "line" : "track",
               ),
            );
         }),
         group(
            "pop",
            0.75,
            path(
               `M${pt(mark - MARKER_W / 2, 3)} H${r1(mark + MARKER_W / 2)} L${pt(mark, 7.6)} Z`,
               "solid",
            ),
         ),
      ],
   };
};

const BLOCK_PITCH = 5;
const BLOCK_W = 3.2;
const BLOCK_H = 14;
const BLOCK_UNIT = 100;
const BLOCK_MAX = 22;

/** A block per hundred (per a larger hundred-multiple when that would not
 *  fit): solid for the first group, faint for the rest. */
export const tally = (groups: number[]): Figure | undefined => {
   const total = groups.reduce((sum, n) => sum + n, 0);
   const unit =
      BLOCK_UNIT * Math.max(1, Math.ceil(total / (BLOCK_UNIT * BLOCK_MAX)));
   const tones = groups.flatMap((n, g) =>
      range(Math.round(n / unit)).map((): FigureTone =>
         g ? "faint" : "solid",
      ),
   );
   if (!tones.length) return undefined;
   return {
      width: r1(2 * PAD + (tones.length - 1) * BLOCK_PITCH + BLOCK_W),
      parts: tones.map((tone, i) =>
         group(
            "rise",
            step(i, tones.length),
            rect(
               PAD + i * BLOCK_PITCH,
               MID - BLOCK_H / 2,
               BLOCK_W,
               BLOCK_H,
               tone,
               0.8,
            ),
         ),
      ),
   };
};

const TIER_H = [7, 12, 17];
const TIER_W = 5;
const TIER_PITCH = 7;
const TIER_BASE = MID + 8.5;

/** Easy, medium and hard as rising bars, the hard tier solid. */
export const tiers = (): Figure => ({
   width: r1(2 * PAD + (TIER_H.length - 1) * TIER_PITCH + TIER_W),
   parts: TIER_H.map((h, i) =>
      group(
         "rise",
         step(i, TIER_H.length, 0.3),
         rect(
            PAD + i * TIER_PITCH,
            TIER_BASE - h,
            TIER_W,
            h,
            i === TIER_H.length - 1 ? "solid" : "faint",
            1,
         ),
      ),
   ),
});
