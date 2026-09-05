import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { AMBER, GREEN, MONO_FONT } from "@/constants/theme";
import {
   INK,
   MEET,
   NON_SCALING,
   NONE,
   SHADOW_55,
   VIEW_BOX,
   WHITE_04,
   WHITE_08,
   WHITE_12,
   WHITE_28,
   WHITE_70,
   WHITE_85,
   clock,
   labelStyle,
   loop,
   svgStyle,
} from "./shared";

/*
 * Minesweeper Game Unity: SCORE and TIME LCDs flank a smiley above a
 * bevelled board. Clicking a covered Element resets the per-move
 * TimerScript, FFuncover floods outward and halts at the digit rim while
 * ScoreScript counts every opened cell; a mine click runs uncoverMines and
 * Game Over, then RestartButton reloads the scene.
 */

const CYCLE = 6;
const t = clock(CYCLE);

/* Board: 6 x 5 tiles of 10 units on an 11.5 pitch, centred at x = 80. */
const COLS = 6;
const ROWS = 5;
const TILE = 10;
const PITCH = 11.5;
const BOARD_X = 80 - (COLS * PITCH - (PITCH - TILE)) / 2;
const BOARD_Y = 32;
const tileX = (col: number) => BOARD_X + PITCH * col;
const tileY = (row: number) => BOARD_Y + PITCH * row;
const tileCentre = (col: number, row: number) => ({
   x: tileX(col) + TILE / 2,
   y: tileY(row) + TILE / 2,
});

interface Cell {
   col: number;
   row: number;
}
interface Digit extends Cell {
   n: number;
}

const CLICK: Cell = { col: 1, row: 1 };
const HIT_MINE: Cell = { col: 4, row: 3 };
const OTHER_MINES: Cell[] = [
   { col: 4, row: 1 },
   { col: 0, row: 4 },
];
const ZEROS: Cell[] = [
   { col: 0, row: 0 },
   { col: 1, row: 0 },
   { col: 2, row: 0 },
   { col: 0, row: 1 },
   { col: 1, row: 1 },
   { col: 2, row: 1 },
   { col: 0, row: 2 },
   { col: 1, row: 2 },
   { col: 2, row: 2 },
   { col: 2, row: 3 },
   { col: 2, row: 4 },
];
/* adjacentMines > 0: the rim where FFuncover halts. */
const DIGITS: Digit[] = [
   { col: 3, row: 0, n: 1 },
   { col: 3, row: 1, n: 1 },
   { col: 3, row: 2, n: 2 },
   { col: 3, row: 3, n: 1 },
   { col: 3, row: 4, n: 1 },
   { col: 1, row: 3, n: 1 },
   { col: 1, row: 4, n: 1 },
   { col: 0, row: 3, n: 1 },
];
const OPENED: Cell[] = [...ZEROS, ...DIGITS];
const MINES: Cell[] = [HIT_MINE, ...OTHER_MINES];
const cellKey = (c: Cell) => `${c.col}:${c.row}`;
const isListed = (list: Cell[], c: Cell) =>
   list.some((o) => o.col === c.col && o.row === c.row);
const ALL_CELLS: Cell[] = Array.from({ length: COLS * ROWS }, (_, i) => ({
   col: i % COLS,
   row: Math.floor(i / COLS),
}));
const CLOSED: Cell[] = ALL_CELLS.filter(
   (c) => !isListed(OPENED, c) && !isListed(MINES, c),
);
/* Flood radiates by Manhattan distance from the click; the far rim merges. */
const RING_COUNT = 5;
const ringOf = (c: Cell) =>
   Math.min(
      Math.abs(c.col - CLICK.col) + Math.abs(c.row - CLICK.row),
      RING_COUNT - 1,
   );
const RING_INDICES = Array.from({ length: RING_COUNT }, (_, d) => d);
const RINGS: Cell[][] = RING_INDICES.map((d) =>
   OPENED.filter((c) => ringOf(c) === d),
);

/* Storyboard clock, seconds. */
const CLICK_AT = 1.0;
const FLOOD_STEP = 0.12;
const FADE = 0.15;
const SCORE_TICKS = [1.1, 1.4, 1.7];
const ROLL = 0.1;
const MINE_AT = 4.2;
const MINES_AT = 4.35;
const GAME_OVER_IN = 4.3;
const GAME_OVER_OUT = 5.0;
const RESET_AT = 5.1;
const RESET_END = 5.5;

/* Cursor: home corner, click tile, mine tile, home. */
const HOME = { x: 135, y: 85 };
const CLICK_TILE = tileCentre(CLICK.col, CLICK.row);
const MINE_TILE = tileCentre(HIT_MINE.col, HIT_MINE.row);
const MOVE_TIMES = [0, t(0.9), t(2.4), t(3.6), t(5.2), t(5.8), 1];
const CURSOR_PATH = [
   HOME,
   CLICK_TILE,
   CLICK_TILE,
   MINE_TILE,
   MINE_TILE,
   HOME,
   HOME,
];
const CURSOR_X = CURSOR_PATH.map((p) => p.x);
const CURSOR_Y = CURSOR_PATH.map((p) => p.y);
const PRESS_TIMES = [
   0,
   t(0.9),
   t(CLICK_AT),
   t(1.1),
   t(MINE_AT),
   t(4.3),
   t(4.4),
   1,
];
const PRESS_SCALE = [1, 1, 0.7, 1, 1, 0.7, 1, 1];

/* HUD. */
const LCD_W = 34;
const LCD_H = 12;
const SCORE_ROWS = ["000", "005", "012", "019"];
const SCORE_TIMES = [
   0,
   ...SCORE_TICKS.flatMap((s) => [t(s), t(s + ROLL)]),
   t(RESET_AT),
   t(RESET_AT + FADE),
   1,
];
const SCORE_Y = [
   0,
   ...SCORE_TICKS.flatMap((_, i) => [-LCD_H * i, -LCD_H * (i + 1)]),
   -LCD_H * SCORE_TICKS.length,
   0,
   0,
];
/* timeReset snaps the bar full on the safe click; isTimer stops at the loss. */
const TIMER_TIMES = [
   0,
   t(0.9),
   t(CLICK_AT),
   t(MINE_AT),
   t(GAME_OVER_OUT),
   t(RESET_AT + 0.05),
   1,
];
const TIMER_SCALE = [0.85, 0.7, 1, 0.55, 0.55, 1, 0.85];
const SMILEY = 12;
const SMILEY_TIMES = [
   0,
   t(MINE_AT),
   t(MINE_AT + FADE),
   t(RESET_AT),
   t(RESET_AT + 0.3),
   1,
];
const GAME_OVER_TIMES = [
   0,
   t(GAME_OVER_IN),
   t(GAME_OVER_IN + 0.2),
   t(GAME_OVER_OUT),
   t(GAME_OVER_OUT + 0.3),
   1,
];

const hudLabel: CSSProperties = { ...labelStyle, position: "static" };
const lcdBox = (tint: string): CSSProperties => ({
   width: LCD_W,
   height: LCD_H,
   borderRadius: 2,
   border: `1px solid ${tint}55`,
   background: "rgba(0,0,0,0.45)",
   overflow: "hidden",
   fontFamily: MONO_FONT,
   fontSize: 8,
   fontWeight: 700,
   letterSpacing: 1,
   lineHeight: `${LCD_H}px`,
   textAlign: "center",
   color: tint,
});
const ring = (color: string): CSSProperties => ({
   position: "absolute",
   inset: 0,
   borderRadius: "50%",
   border: `1px solid ${color}`,
});
const eye = (side: "left" | "right"): CSSProperties => ({
   position: "absolute",
   top: 4,
   [side]: 3,
   width: 2,
   height: 2,
   borderRadius: "50%",
   background: WHITE_85,
});

/* Opened look plus the digits and mines that covers hide until revealed. */
const Base = ({ tint }: { tint: string }) => (
   <>
      {ALL_CELLS.map((c) => (
         <rect
            key={cellKey(c)}
            x={tileX(c.col)}
            y={tileY(c.row)}
            width={TILE}
            height={TILE}
            rx={1}
            fill={WHITE_04}
            stroke={WHITE_08}
            strokeWidth={0.5}
         />
      ))}
      {DIGITS.map((d) => {
         const p = tileCentre(d.col, d.row);
         return (
            <text
               key={cellKey(d)}
               x={p.x}
               y={p.y}
               fontFamily={MONO_FONT}
               fontSize={6}
               fontWeight={700}
               textAnchor="middle"
               dominantBaseline="central"
               fill={d.n === 2 ? tint : WHITE_85}
            >
               {d.n}
            </text>
         );
      })}
      {MINES.map((m) => {
         const p = tileCentre(m.col, m.row);
         return <circle key={cellKey(m)} cx={p.x} cy={p.y} r={2} fill={tint} />;
      })}
   </>
);

/*
 * Win98 raised tile: light top/left edge, dark bottom/right edge. The ink
 * backing keeps the digit or mine underneath hidden until the cover lifts.
 */
const Cover = ({ cell }: { cell: Cell }) => {
   const x = tileX(cell.col);
   const y = tileY(cell.row);
   const far = TILE - 0.5;
   return (
      <g>
         <rect x={x} y={y} width={TILE} height={TILE} fill={INK} />
         <rect x={x} y={y} width={TILE} height={TILE} fill={WHITE_12} />
         <path
            d={`M${x + 0.5},${y + far} V${y + 0.5} H${x + far}`}
            stroke={WHITE_28}
            strokeWidth={1}
            fill={NONE}
         />
         <path
            d={`M${x + far},${y + 0.5} V${y + far} H${x + 0.5}`}
            stroke={SHADOW_55}
            strokeWidth={1}
            fill={NONE}
         />
      </g>
   );
};

/* A set of covers that lifts together at `openAt` and returns on reset. */
const Covers = ({ cells, openAt }: { cells: Cell[]; openAt: number }) => (
   <motion.g
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0, 0, 1, 1] }}
      transition={loop(
         CYCLE,
         [0, t(openAt), t(openAt + FADE), t(RESET_AT), t(RESET_END), 1],
         "linear",
      )}
   >
      {cells.map((c) => (
         <Cover key={cellKey(c)} cell={c} />
      ))}
   </motion.g>
);

const Cursor = () => (
   <motion.g
      initial={{ x: HOME.x, y: HOME.y, scale: 1 }}
      animate={{ x: CURSOR_X, y: CURSOR_Y, scale: PRESS_SCALE }}
      transition={{
         x: loop(CYCLE, MOVE_TIMES),
         y: loop(CYCLE, MOVE_TIMES),
         scale: loop(CYCLE, PRESS_TIMES, "linear"),
      }}
   >
      <circle
         r={3.5}
         fill={NONE}
         stroke={WHITE_70}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      <circle r={0.8} fill={WHITE_70} />
   </motion.g>
);

/* ScoreScript: {0:000}, one count per opened cell. */
const ScoreLcd = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: "8%",
         top: "3%",
         display: "flex",
         flexDirection: "column",
         gap: 2,
      }}
   >
      <span style={hudLabel}>SCORE</span>
      <div style={lcdBox(tint)}>
         <motion.div
            initial={{ y: 0 }}
            animate={{ y: SCORE_Y }}
            transition={loop(CYCLE, SCORE_TIMES, "linear")}
         >
            {SCORE_ROWS.map((row) => (
               <div key={row}>{row}</div>
            ))}
         </motion.div>
      </div>
   </div>
);

/* TimerScript: a per-move countdown, refilled by every safe click. */
const TimeLcd = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         right: "8%",
         top: "3%",
         display: "flex",
         flexDirection: "column",
         alignItems: "flex-end",
         gap: 2,
      }}
   >
      <span style={hudLabel}>TIME</span>
      <div style={lcdBox(tint)}>060</div>
      <motion.div
         initial={{ scaleX: TIMER_SCALE[0] }}
         animate={{ scaleX: TIMER_SCALE }}
         transition={loop(CYCLE, TIMER_TIMES, "linear")}
         style={{
            width: LCD_W + 2,
            height: 2,
            borderRadius: 1,
            background: tint,
            originX: 0,
         }}
      />
   </div>
);

const Smiley = () => (
   <div
      style={{
         position: "absolute",
         left: "50%",
         top: "4%",
         width: SMILEY,
         height: SMILEY,
         marginLeft: -SMILEY / 2,
      }}
   >
      <div style={ring(GREEN)} />
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
         transition={loop(CYCLE, SMILEY_TIMES, "linear")}
         style={ring(AMBER)}
      />
      <span style={eye("left")} />
      <span style={eye("right")} />
   </div>
);

const GameOver = () => (
   <div
      style={{
         position: "absolute",
         left: "50%",
         top: "60%",
         transform: "translate(-50%, -50%)",
      }}
   >
      <motion.span
         initial={{ opacity: 0 }}
         animate={{ opacity: [0, 0, 0.95, 0.95, 0, 0] }}
         transition={loop(CYCLE, GAME_OVER_TIMES, "linear")}
         style={{
            ...hudLabel,
            display: "block",
            padding: "2px 5px",
            borderRadius: 3,
            background: `${INK}e0`,
            border: `1px solid ${AMBER}66`,
            color: AMBER,
            fontSize: 8,
         }}
      >
         GAME OVER
      </motion.span>
   </div>
);

const Minesweeper = ({ tint }: { tint: string }) => (
   <>
      <svg viewBox={VIEW_BOX} preserveAspectRatio={MEET} style={svgStyle}>
         <Base tint={tint} />
         <g>
            {CLOSED.map((c) => (
               <Cover key={cellKey(c)} cell={c} />
            ))}
         </g>
         {RING_INDICES.map((d) => (
            <Covers
               key={d}
               cells={RINGS[d]}
               openAt={CLICK_AT + FLOOD_STEP * d}
            />
         ))}
         <Covers cells={[HIT_MINE]} openAt={MINE_AT} />
         <Covers cells={OTHER_MINES} openAt={MINES_AT} />
         <Cursor />
      </svg>
      <ScoreLcd tint={tint} />
      <Smiley />
      <TimeLcd tint={tint} />
      <span style={{ ...labelStyle, left: "5%", bottom: "4%" }}>PLAYFIELD</span>
      <GameOver />
   </>
);

export default Minesweeper;
