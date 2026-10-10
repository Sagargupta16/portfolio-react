import { useId, type CSSProperties } from "react";
import { motion } from "motion/react";
import { AMBER, MONO_FONT } from "@/constants/theme";
import {
   INK,
   MEET,
   NON_SCALING,
   NONE,
   ROUND,
   VIEW_BOX,
   WHITE_05,
   WHITE_10,
   WHITE_16,
   WHITE_85,
   beats,
   clock,
   labelStyle,
   loop,
   svgStyle,
   washStyle,
} from "./shared";

/*
 * Snake Game Unity: InvokeRepeating("Move") translates the head one cell
 * per tick and moves the last tail square to where the head was; a
 * FoodPrefab hit adds one to ScoreScript and the next Move instantiates a
 * tailPrefab in that spot instead. SpawnFood drops a new square on its own
 * timer without clearing the old ones, so food piles up. Running into the
 * border destroys only the head, leaves the tail behind and calls
 * GameOverScript.Setup; the HUD keeps its two speed sliders on top.
 */

const CYCLE = 6;
const t = clock(CYCLE);
const at = beats(CYCLE);

/* Arena: 32 x 14 cells of 4 units inside the thick border colliders. */
const CELL = 4;
const COLS = 32;
const ROWS = 14;
const ARENA = { x: 16, y: 26, w: CELL * COLS, h: CELL * ROWS };
const BORDER = 1.6;
const HEAD = 3.4;
const SEGMENT = 2.4;
const FOOD = 2.4;
const cellX = (col: number) => ARENA.x + CELL * col;
const cellY = (row: number) => ARENA.y + CELL * row;

/* Head trail: index TAIL is the head at tick 0; the last cell is the border. */
const TRAIL: [number, number][] = [
   [11, 9],
   [12, 9],
   [13, 9],
   ...Array.from({ length: 9 }, (_, i): [number, number] => [14 + i, 9]),
   ...Array.from({ length: 9 }, (_, i): [number, number] => [22, 8 - i]),
   [22, -1],
];
const TAIL = 3;
const MOVES = TRAIL.length - 1 - TAIL;

/* Ticks: hold each cell, snap on the InvokeRepeating beat. */
const TICK = 0.17;
const MOVE_START = 0.15;
const SNAP = 0.04;
const tickAt = (k: number) => MOVE_START + TICK * k;
const EAT_TICK = 4;
const EAT_AT = tickAt(EAT_TICK);
const GROW_AT = tickAt(EAT_TICK + 1);
const HIT_AT = tickAt(MOVES);
const SPAWN_AT = 2;
const OVER_IN = 3.4;
const CLEAR = 4.9;
const CLEARED = 5.2;
const HOME = 5.35;
const BACK_IN = 5.5;
const BACK = 5.9;

/* Slot i (0 = head) sits on TRAIL[TAIL + k - i] after tick k. */
const stepped = (slot: number, axis: 0 | 1, inset: number) => {
   const cellAt = (k: number) => {
      const cell = TRAIL[Math.max(0, TAIL + k - slot)];
      return (axis === 0 ? cellX(cell[0]) : cellY(cell[1])) + inset;
   };
   const values = [cellAt(0)];
   const times = [0];
   for (let k = 1; k <= MOVES; k += 1) {
      values.push(cellAt(k - 1), cellAt(k));
      times.push(t(tickAt(k) - SNAP), t(tickAt(k)));
   }
   values.push(cellAt(MOVES), cellAt(0), cellAt(0));
   times.push(t(HOME - 0.02), t(HOME), 1);
   return { values, times };
};
const slotPath = (slot: number) => {
   const inset = slot === 0 ? (CELL - HEAD) / 2 : (CELL - SEGMENT) / 2;
   const x = stepped(slot, 0, inset);
   const y = stepped(slot, 1, inset);
   return { x: x.values, y: y.values, times: x.times };
};
const SLOTS = [0, 1, 2, 3, 4].map((slot) => ({
   id: `slot${slot}`,
   slot,
   path: slotPath(slot),
}));
const SLOT_ALPHA = ["", "d9", "b3", "8c", "66"];
const HEAD_OPACITY = [1, 1, 0, 0, 1, 1];
const HEAD_TIMES = at(HIT_AT, HIT_AT + 0.1, BACK_IN, BACK);
const TAIL_OPACITY = [1, 1, 0, 0, 1, 1];
const TAIL_TIMES = at(CLEAR, CLEARED, BACK_IN, BACK);
/* The tailPrefab instantiated on the tick after the eat. */
const GROWN_OPACITY = [0, 0, 1, 1, 0, 0];
const GROWN_TIMES = at(GROW_AT - 0.01, GROW_AT, CLEAR, CLEARED);

/* FoodPrefab: one eaten, one left from an older spawn, one fresh spawn. */
const EATEN: [number, number] = TRAIL[TAIL + EAT_TICK];
const LEFTOVER: [number, number] = [27, 11];
const SPAWNED: [number, number] = [6, 3];
const EATEN_TIMES = at(EAT_AT, EAT_AT + 0.08, BACK_IN, BACK);
const EATEN_OPACITY = [1, 1, 0, 0, 1, 1];
const SPAWN_TIMES = at(SPAWN_AT, SPAWN_AT + 0.15, CLEAR, CLEARED);
const SPAWN_OPACITY = [0, 0, 1, 1, 0, 0];
const RIPPLE_TIMES = at(SPAWN_AT, SPAWN_AT + 0.05, SPAWN_AT + 0.6);

const FLASH_TIMES = at(HIT_AT, HIT_AT + 0.08, HIT_AT + 0.5);
const OVER_TIMES = at(OVER_IN, OVER_IN + 0.25, CLEAR, CLEARED);
const DIGIT_H = 9;
const SCORE_TIMES = at(EAT_AT, EAT_AT + 0.15, BACK_IN, BACK);
const SCORE_Y = [0, 0, -DIGIT_H, -DIGIT_H, 0, 0];

const hairline = {
   fill: NONE,
   strokeWidth: 1,
   vectorEffect: NON_SCALING,
} as const;

const Arena = ({ tint }: { tint: string }) => {
   const latticeId = `snakelattice${useId().replaceAll(/\W/g, "")}`;
   return (
      <>
         <defs>
            <pattern
               id={latticeId}
               x={ARENA.x}
               y={ARENA.y}
               width={CELL}
               height={CELL}
               patternUnits="userSpaceOnUse"
            >
               <circle cx={CELL / 2} cy={CELL / 2} r={0.25} fill={WHITE_05} />
            </pattern>
         </defs>
         <rect
            x={ARENA.x}
            y={ARENA.y}
            width={ARENA.w}
            height={ARENA.h}
            fill={`url(#${latticeId})`}
         />
         <rect
            x={ARENA.x - BORDER / 2}
            y={ARENA.y - BORDER / 2}
            width={ARENA.w + BORDER}
            height={ARENA.h + BORDER}
            rx={1.2}
            fill={NONE}
            stroke={`${tint}66`}
            strokeWidth={BORDER}
         />
         {/* The border collider flares on OnTriggerEnter2D. */}
         <motion.rect
            x={ARENA.x - BORDER / 2}
            y={ARENA.y - BORDER / 2}
            width={ARENA.w + BORDER}
            height={ARENA.h + BORDER}
            rx={1.2}
            fill={NONE}
            stroke={AMBER}
            strokeWidth={BORDER}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 0, 0] }}
            transition={loop(CYCLE, FLASH_TIMES)}
         />
      </>
   );
};

const Food = ({
   cell,
   opacity,
   times,
}: {
   cell: [number, number];
   opacity?: number[];
   times?: number[];
}) => {
   const props = {
      x: cellX(cell[0]) + (CELL - FOOD) / 2,
      y: cellY(cell[1]) + (CELL - FOOD) / 2,
      width: FOOD,
      height: FOOD,
      rx: 0.4,
      fill: WHITE_85,
   };
   if (!opacity || !times) return <rect {...props} />;
   return (
      <motion.rect
         {...props}
         initial={{ opacity: opacity[0] }}
         animate={{ opacity }}
         transition={loop(CYCLE, times)}
      />
   );
};

/* SpawnFood's Instantiate: a hairline ripple where the new square lands. */
const SpawnRipple = () => (
   <motion.circle
      cx={cellX(SPAWNED[0]) + CELL / 2}
      cy={cellY(SPAWNED[1]) + CELL / 2}
      r={3.2}
      stroke={WHITE_85}
      {...hairline}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{
         opacity: [0, 0, 0.8, 0, 0],
         scale: [0.4, 0.4, 0.5, 1.6, 1.6],
      }}
      transition={loop(CYCLE, RIPPLE_TIMES)}
   />
);

const Slot = ({
   slot,
   path,
   tint,
}: {
   slot: number;
   path: ReturnType<typeof slotPath>;
   tint: string;
}) => {
   const size = slot === 0 ? HEAD : SEGMENT;
   let opacity = TAIL_OPACITY;
   let opacityTimes = TAIL_TIMES;
   if (slot === 0) {
      opacity = HEAD_OPACITY;
      opacityTimes = HEAD_TIMES;
   } else if (slot === TAIL + 1) {
      opacity = GROWN_OPACITY;
      opacityTimes = GROWN_TIMES;
   }
   return (
      <motion.rect
         width={size}
         height={size}
         rx={slot === 0 ? 0.6 : 0.4}
         fill={`${tint}${SLOT_ALPHA[slot]}`}
         initial={{ x: path.x[0], y: path.y[0], opacity: opacity[0] }}
         animate={{ x: path.x, y: path.y, opacity }}
         transition={{
            x: loop(CYCLE, path.times, "linear"),
            y: loop(CYCLE, path.times, "linear"),
            opacity: loop(CYCLE, opacityTimes, "linear"),
         }}
      />
   );
};

/* The real HUD's two sliders: green left of the knob, yellow right of it. */
const SLIDER_Y = 17;
const SLIDER_W = 26;
const KNOB = 0.59;
const Slider = ({ x, tint }: { x: number; tint: string }) => (
   <>
      <line
         x1={x}
         y1={SLIDER_Y}
         x2={x + SLIDER_W}
         y2={SLIDER_Y}
         stroke={WHITE_16}
         strokeLinecap={ROUND}
         {...hairline}
      />
      <line
         x1={x}
         y1={SLIDER_Y}
         x2={x + SLIDER_W * KNOB}
         y2={SLIDER_Y}
         stroke={`${tint}b3`}
         strokeLinecap={ROUND}
         {...hairline}
      />
      <circle cx={x + SLIDER_W * KNOB} cy={SLIDER_Y} r={1.3} fill={tint} />
   </>
);

const hudLabel: CSSProperties = { ...labelStyle, position: "static" };

/* ScoreScript: " Score " + scoreValue, rolling 3 to 4 on the eat. */
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
      <span
         style={{
            display: "block",
            height: DIGIT_H,
            overflow: "hidden",
            fontFamily: MONO_FONT,
            fontSize: 8,
            fontWeight: 700,
            lineHeight: `${DIGIT_H}px`,
            color: tint,
         }}
      >
         <motion.span
            initial={{ y: 0 }}
            animate={{ y: SCORE_Y }}
            transition={loop(CYCLE, SCORE_TIMES)}
            style={{ display: "block" }}
         >
            <span style={{ display: "block" }}>3</span>
            <span style={{ display: "block" }}>4</span>
         </motion.span>
      </span>
   </div>
);

const GameOver = () => (
   <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
      transition={loop(CYCLE, OVER_TIMES)}
      style={{
         ...labelStyle,
         left: "50%",
         top: "55%",
         transform: "translate(-50%, -50%)",
         padding: "3px 7px",
         borderRadius: 6,
         border: `1px solid ${WHITE_10}`,
         background: `${INK}e6`,
         color: AMBER,
         fontSize: 8,
      }}
   >
      GAME OVER
   </motion.span>
);

const Snake = ({ tint }: { tint: string }) => (
   <>
      <div style={washStyle(tint, "66% 36%")} />
      <svg viewBox={VIEW_BOX} preserveAspectRatio={MEET} style={svgStyle}>
         <Slider x={12.8} tint={tint} />
         <Slider x={147.2 - SLIDER_W} tint={tint} />
         <Arena tint={tint} />
         <Food cell={LEFTOVER} />
         <Food cell={EATEN} opacity={EATEN_OPACITY} times={EATEN_TIMES} />
         <Food cell={SPAWNED} opacity={SPAWN_OPACITY} times={SPAWN_TIMES} />
         <SpawnRipple />
         {SLOTS.map((s) => (
            <Slot key={s.id} slot={s.slot} path={s.path} tint={tint} />
         ))}
      </svg>
      <span style={{ ...labelStyle, left: "8%", top: "8%" }}>SPAWNFOOD</span>
      <Score tint={tint} />
      <span style={{ ...labelStyle, right: "8%", top: "8%" }}>SNAKE SPEED</span>
      <GameOver />
   </>
);

export default Snake;
