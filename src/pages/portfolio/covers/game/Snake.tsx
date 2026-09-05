import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { AMBER, MONO_FONT } from "@/constants/theme";
import {
   MEET,
   NON_SCALING,
   NONE,
   VIEW_BOX,
   WHITE_06,
   WHITE_20,
   clock,
   labelStyle,
   loop,
   svgStyle,
} from "./shared";

/*
 * Snake Game Unity: InvokeRepeating("Move") steps the head one cell per
 * tick and rotates the tail list; a FoodPrefab hit bumps ScoreScript and
 * instantiates a tailPrefab; SpawnFood drops a fresh square on its own
 * timer; touching a border destroys the snake, GameOverScript shows, and
 * Restart reloads the scene with the score back at zero.
 */

const CYCLE = 5;
const t = clock(CYCLE);

/* Arena: 10 x 5 cells of 12 units inside the thick border. */
const CELL = 12;
const COLS = 10;
const ROWS = 5;
const ARENA = { x: 20, y: 26, w: CELL * COLS, h: CELL * ROWS };
const SQUARE = 10;
const PAD = (CELL - SQUARE) / 2;
const FOOD = 7;
const FOOD_PAD = (CELL - FOOD) / 2;
const cellX = (col: number) => ARENA.x + CELL * col;
const cellY = (row: number) => ARENA.y + CELL * row;

/* Head trail including the resting body; index BODY - 1 is the head. */
const TRAIL: [number, number][] = [
   [0, 2],
   [1, 2],
   [2, 2],
   [3, 2],
   [4, 2],
   [5, 2],
   [6, 2],
   [7, 2],
   [7, 3],
   [7, 4],
   [8, 4],
   [9, 4],
];
const BODY = 4;
const MOVES = TRAIL.length - BODY;
const SEGMENTS = BODY + 1;
const SEGMENT_ALPHA = ["", "cc", "99", "66", "44"];

/* Ticks: InvokeRepeating cadence, hold then snap. */
const TICK = 0.28;
const MOVE_START = 0.4;
const SNAP = 0.04;
const tickAt = (k: number) => MOVE_START + TICK * (k - 1);
const EAT_TICK = 4;
const EAT_AT = tickAt(EAT_TICK);
const GROW_AT = tickAt(EAT_TICK + 1);
const HIT_AT = tickAt(MOVES + 1);
const VANISH = 0.15;
const FADE = 0.2;
const FLASH = 0.3;
const GAME_OVER_IN = 2.75;
const SNAP_BACK = 3.3;
const GAME_OVER_OUT = 3.9;
const FOOD2_IN = 2.0;
const FOOD2_OUT = 4.1;
const SCORE_RESET = 4.1;
const FOOD1_BACK = 4.2;
const SNAKE_BACK = 4.4;

const FOOD1_CELL = TRAIL[BODY - 1 + EAT_TICK];
const FOOD2_CELL: [number, number] = [1, 0];

/* Hold each cell until the next tick, then snap; return home while hidden. */
const stepped = (points: number[]) => {
   const values = [points[0]];
   const times = [0];
   for (let k = 1; k <= MOVES; k += 1) {
      values.push(points[k - 1], points[k]);
      times.push(t(tickAt(k) - SNAP), t(tickAt(k)));
   }
   values.push(points[MOVES], points[0], points[0]);
   times.push(t(SNAP_BACK - SNAP), t(SNAP_BACK), 1);
   return { values, times };
};
const segmentPath = (index: number) => {
   const cells = Array.from(
      { length: MOVES + 1 },
      (_, k) => TRAIL[Math.max(0, BODY - 1 + k - index)],
   );
   const xs = stepped(cells.map(([col]) => cellX(col) + PAD));
   const ys = stepped(cells.map(([, row]) => cellY(row) + PAD));
   return { x: xs.values, y: ys.values, times: xs.times };
};
const SEGMENT_INDICES = Array.from({ length: SEGMENTS }, (_, i) => i);
const SEGMENT_PATHS = SEGMENT_INDICES.map(segmentPath);
const BODY_OPACITY = [1, 1, 0, 0, 1, 1];
const BODY_OPACITY_TIMES = [
   0,
   t(HIT_AT),
   t(HIT_AT + VANISH),
   t(SNAKE_BACK),
   t(SNAKE_BACK + FADE),
   1,
];
/* The tailPrefab instantiated on the tick after eating. */
const GROWN_OPACITY = [0, 0, 1, 1, 0, 0];
const GROWN_OPACITY_TIMES = [
   0,
   t(GROW_AT),
   t(GROW_AT + VANISH),
   t(HIT_AT),
   t(HIT_AT + VANISH),
   1,
];

const FOOD1_TIMES = [
   0,
   t(EAT_AT),
   t(EAT_AT + VANISH),
   t(FOOD1_BACK),
   t(FOOD1_BACK + FADE),
   1,
];
const FOOD1_OPACITY = [0.85, 0.85, 0, 0, 0.85, 0.85];
const FOOD1_SCALE = [1, 1, 0, 0.6, 1, 1];
const FOOD2_TIMES = [
   0,
   t(FOOD2_IN),
   t(FOOD2_IN + FADE),
   t(FOOD2_OUT),
   t(FOOD2_OUT + FADE),
   1,
];
const FOOD2_OPACITY = [0, 0, 0.85, 0.85, 0, 0];
const FOOD2_SCALE = [0.6, 0.6, 1, 1, 0.6, 0.6];

const FLASH_TIMES = [0, t(HIT_AT), t(HIT_AT + 0.1), t(HIT_AT + FLASH), 1];
const GAME_OVER_TIMES = [
   0,
   t(GAME_OVER_IN),
   t(GAME_OVER_IN + FADE),
   t(GAME_OVER_OUT),
   t(GAME_OVER_OUT + FLASH),
   1,
];
const DIGIT_H = 9;
const SCORE_TIMES = [
   0,
   t(EAT_AT + 0.05),
   t(EAT_AT + FADE),
   t(SCORE_RESET),
   t(SCORE_RESET + VANISH),
   1,
];
const SCORE_Y = [0, 0, -DIGIT_H, -DIGIT_H, 0, 0];

const GRID_COLS = Array.from({ length: COLS - 1 }, (_, i) => cellX(i + 1));
const GRID_ROWS = Array.from({ length: ROWS - 1 }, (_, i) => cellY(i + 1));
const hudLabel: CSSProperties = { ...labelStyle, position: "static" };

const Arena = ({ tint }: { tint: string }) => (
   <>
      {GRID_COLS.map((x) => (
         <line
            key={x}
            x1={x}
            y1={ARENA.y}
            x2={x}
            y2={ARENA.y + ARENA.h}
            stroke={WHITE_06}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
      ))}
      {GRID_ROWS.map((y) => (
         <line
            key={y}
            x1={ARENA.x}
            y1={y}
            x2={ARENA.x + ARENA.w}
            y2={y}
            stroke={WHITE_06}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
      ))}
      <rect
         x={ARENA.x}
         y={ARENA.y}
         width={ARENA.w}
         height={ARENA.h}
         rx={2}
         fill={NONE}
         stroke={`${tint}99`}
         strokeWidth={2}
      />
      {/* The border collider lights amber on OnTriggerEnter2D. */}
      <motion.rect
         x={ARENA.x}
         y={ARENA.y}
         width={ARENA.w}
         height={ARENA.h}
         rx={2}
         fill={NONE}
         stroke={AMBER}
         strokeWidth={2}
         initial={{ opacity: 0 }}
         animate={{ opacity: [0, 0, 1, 0, 0] }}
         transition={loop(CYCLE, FLASH_TIMES, "linear")}
      />
   </>
);

const Food = ({
   cell,
   opacity,
   scale,
   times,
}: {
   cell: [number, number];
   opacity: number[];
   scale: number[];
   times: number[];
}) => (
   <motion.rect
      x={cellX(cell[0]) + FOOD_PAD}
      y={cellY(cell[1]) + FOOD_PAD}
      width={FOOD}
      height={FOOD}
      rx={1}
      fill="#fff"
      initial={{ opacity: opacity[0], scale: scale[0] }}
      animate={{ opacity, scale }}
      transition={loop(CYCLE, times)}
   />
);

const Segment = ({ index, tint }: { index: number; tint: string }) => {
   const path = SEGMENT_PATHS[index];
   const grown = index === BODY;
   const opacity = grown ? GROWN_OPACITY : BODY_OPACITY;
   const opacityTimes = grown ? GROWN_OPACITY_TIMES : BODY_OPACITY_TIMES;
   return (
      <motion.rect
         width={SQUARE}
         height={SQUARE}
         rx={1.5}
         fill={`${tint}${SEGMENT_ALPHA[index]}`}
         initial={{ x: path.x[0], y: path.y[0], opacity: opacity[0] }}
         animate={{ x: path.x, y: path.y, opacity }}
         transition={{
            ...loop(CYCLE, path.times, "linear"),
            opacity: loop(CYCLE, opacityTimes, "linear"),
         }}
      />
   );
};

/* The two live sliders from the real HUD. */
const Slider = ({ tint, knob }: { tint: string; knob: string }) => (
   <div style={{ position: "relative", width: 26, height: 3, marginTop: 3 }}>
      <div
         style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1,
            height: 1,
            background: WHITE_20,
         }}
      />
      <div
         style={{
            position: "absolute",
            left: knob,
            top: 0,
            width: 3,
            height: 3,
            marginLeft: -1.5,
            borderRadius: "50%",
            background: tint,
         }}
      />
   </div>
);

/* ScoreScript.scoreValue rolls 0 to 1 on the eat, back to 0 on Restart. */
const Score = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: "50%",
         top: "7%",
         transform: "translateX(-50%)",
         display: "flex",
         alignItems: "center",
         gap: 4,
      }}
   >
      <span style={hudLabel}>SCORE</span>
      <div
         style={{
            height: DIGIT_H,
            overflow: "hidden",
            fontFamily: MONO_FONT,
            fontSize: 8,
            fontWeight: 700,
            lineHeight: `${DIGIT_H}px`,
            color: tint,
         }}
      >
         <motion.div
            initial={{ y: 0 }}
            animate={{ y: SCORE_Y }}
            transition={loop(CYCLE, SCORE_TIMES, "linear")}
         >
            <div>0</div>
            <div>1</div>
         </motion.div>
      </div>
   </div>
);

const Hud = ({ tint }: { tint: string }) => (
   <>
      <div
         style={{
            position: "absolute",
            left: "6%",
            top: "7%",
            display: "flex",
            flexDirection: "column",
         }}
      >
         <span style={hudLabel}>FOOD 6.00</span>
         <Slider tint={tint} knob="55%" />
      </div>
      <Score tint={tint} />
      <div
         style={{
            position: "absolute",
            right: "6%",
            top: "7%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
         }}
      >
         <span style={hudLabel}>SPEED 5.00</span>
         <Slider tint={tint} knob="45%" />
      </div>
   </>
);

const GameOver = () => (
   <div
      style={{
         position: "absolute",
         left: "50%",
         top: "56%",
         transform: "translate(-50%, -50%)",
      }}
   >
      <motion.span
         initial={{ opacity: 0 }}
         animate={{ opacity: [0, 0, 0.9, 0.9, 0, 0] }}
         transition={loop(CYCLE, GAME_OVER_TIMES, "linear")}
         style={{ ...hudLabel, display: "block", color: AMBER, fontSize: 8 }}
      >
         GAME OVER
      </motion.span>
   </div>
);

const Snake = ({ tint }: { tint: string }) => (
   <>
      <svg viewBox={VIEW_BOX} preserveAspectRatio={MEET} style={svgStyle}>
         <Arena tint={tint} />
         <Food
            cell={FOOD1_CELL}
            opacity={FOOD1_OPACITY}
            scale={FOOD1_SCALE}
            times={FOOD1_TIMES}
         />
         <Food
            cell={FOOD2_CELL}
            opacity={FOOD2_OPACITY}
            scale={FOOD2_SCALE}
            times={FOOD2_TIMES}
         />
         {SEGMENT_INDICES.map((i) => (
            <Segment key={i} index={i} tint={tint} />
         ))}
      </svg>
      <Hud tint={tint} />
      <GameOver />
   </>
);

export default Snake;
