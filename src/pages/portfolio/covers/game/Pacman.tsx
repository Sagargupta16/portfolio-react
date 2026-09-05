import { motion } from "motion/react";
import {
   INK,
   MEET,
   NON_SCALING,
   NONE,
   VIEW_BOX,
   WHITE_06,
   WHITE_16,
   WHITE_25,
   WHITE_28,
   WHITE_70,
   clock,
   eases,
   labelStyle,
   loop,
   svgStyle,
} from "./shared";

/*
 * PacMan Game Unity: PacmanMove steps one tile at a time along a corridor,
 * each Pacdot destroys itself as the centre crosses it, a failed Linecast
 * flashes at the wall before the 90 degree turn down the next corridor, and
 * GhostMove loops a fixed waypoint circuit without ever chasing.
 */

const CYCLE = 6;
const t = clock(CYCLE);

/* Maze: 12 x 6 grid of 12-unit cells inside a rounded frame. */
const CELL = 12;
const GRID_X = 8;
const GRID_Y = 13;
const GRID_COLS = 12;
const GRID_ROWS = 6;
const WALL_INSET = 1.5;
const WALL_RADIUS = 2.5;
const centreX = (col: number) => GRID_X + CELL * col + CELL / 2;
const centreY = (row: number) => GRID_Y + CELL * row + CELL / 2;

interface Block {
   col: number;
   row: number;
   cols: number;
   rows: number;
}

const WALLS: Block[] = [
   { col: 8, row: 0, cols: 3, rows: 2 },
   { col: 1, row: 1, cols: 3, rows: 1 },
   { col: 5, row: 1, cols: 2, rows: 1 },
   { col: 1, row: 3, cols: 2, rows: 1 },
   { col: 8, row: 3, cols: 3, rows: 1 },
   { col: 1, row: 5, cols: 3, rows: 1 },
   { col: 8, row: 5, cols: 3, rows: 1 },
];
const HOUSE: Block = { col: 5, row: 3, cols: 2, rows: 2 };
const DOOR_HALF = 4;

const blockRect = (b: Block) => ({
   x: GRID_X + CELL * b.col + WALL_INSET,
   y: GRID_Y + CELL * b.row + WALL_INSET,
   width: CELL * b.cols - 2 * WALL_INSET,
   height: CELL * b.rows - 2 * WALL_INSET,
});
const HOUSE_RECT = blockRect(HOUSE);
const DOOR_X = HOUSE_RECT.x + HOUSE_RECT.width / 2;

/* Ghost house outline with the door gap centred on its top edge. */
const housePath = () => {
   const { x, y, width: w, height: h } = HOUSE_RECT;
   const r = WALL_RADIUS;
   return [
      `M${DOOR_X - DOOR_HALF},${y} H${x + r}`,
      `Q${x},${y} ${x},${y + r} V${y + h - r}`,
      `Q${x},${y + h} ${x + r},${y + h} H${x + w - r}`,
      `Q${x + w},${y + h} ${x + w},${y + h - r} V${y + r}`,
      `Q${x + w},${y} ${x + w - r},${y} H${DOOR_X + DOOR_HALF}`,
   ].join(" ");
};

/* PacmanMove: idle, run the top corridor, Linecast at the wall, turn, drop. */
const START = { x: centreX(1), y: centreY(0) };
const CORNER = { x: centreX(7), y: centreY(0) };
const END = { x: centreX(7), y: centreY(4) };
/* MoveTowards runs at one speed: 4/3 of the ghost's (speed 0.4 vs 0.3). */
const GHOST_SPEED = 20;
const PAC_SPEED = (GHOST_SPEED * 4) / 3;
const RUN_START = 0.4;
const RUN_END = RUN_START + (CORNER.x - START.x) / PAC_SPEED;
const TURN_AT = RUN_END + 0.15;
const DROP_START = RUN_END + 0.3;
const DROP_END = DROP_START + (END.y - CORNER.y) / PAC_SPEED;
const FADE_OUT_END = DROP_END + 0.2;
const SNAP_END = DROP_END + 0.3;
const FADE_IN_END = DROP_END + 0.5;

/* Body: a 9-unit tint disc inside the 12-unit corridor. */
const PAC_R = 4.5;
/*
 * Mouth: an INK pie slice over the body, symmetric about the facing axis so
 * its fill-box centre sits on the centre line and scaleY closes it in place.
 */
const MOUTH_HALF = Math.PI / 6;
const MOUTH_X = PAC_R * Math.cos(MOUTH_HALF);
const MOUTH_Y = PAC_R * Math.sin(MOUTH_HALF);
const MOUTH = `M0,0 L${MOUTH_X},${-MOUTH_Y} A${PAC_R},${PAC_R} 0 0 1 ${MOUTH_X},${MOUTH_Y} Z`;
const CHOMP = 0.5;
const CHOMP_SCALE = [1, 0.1, 1];
const CHOMP_EASE = eases(CHOMP_SCALE.length - 1);
const PAC_X = [START.x, START.x, CORNER.x, CORNER.x, START.x, START.x];
const PAC_X_TIMES = [
   0,
   t(RUN_START),
   t(RUN_END),
   t(FADE_OUT_END),
   t(SNAP_END),
   1,
];
const PAC_Y = [START.y, START.y, END.y, END.y, START.y, START.y];
const PAC_Y_TIMES = [
   0,
   t(DROP_START),
   t(DROP_END),
   t(FADE_OUT_END),
   t(SNAP_END),
   1,
];
const PAC_OPACITY = [1, 1, 0, 0, 1, 1];
const PAC_OPACITY_TIMES = [
   0,
   t(DROP_END),
   t(FADE_OUT_END),
   t(SNAP_END),
   t(FADE_IN_END),
   1,
];
const FACING = [0, 0, 90, 90, 0, 0];
const FACING_TIMES = [
   0,
   t(TURN_AT),
   t(DROP_START),
   t(FADE_OUT_END),
   t(SNAP_END),
   1,
];
const LINECAST_TIMES = [0, t(RUN_END), t(RUN_END + 0.08), t(TURN_AT + 0.1), 1];

/* Pacdots die exactly when the chomper's centre crosses them. */
interface Dot {
   x: number;
   y: number;
   eatAt: number;
}
const runDot = (col: number): Dot => ({
   x: centreX(col),
   y: START.y,
   eatAt:
      RUN_START +
      ((centreX(col) - START.x) / (CORNER.x - START.x)) * (RUN_END - RUN_START),
});
const dropDot = (row: number): Dot => ({
   x: CORNER.x,
   y: centreY(row),
   eatAt:
      DROP_START +
      ((centreY(row) - CORNER.y) / (END.y - CORNER.y)) *
         (DROP_END - DROP_START),
});
const DOTS: Dot[] = [...[2, 3, 4, 5, 6].map(runDot), ...[1, 2, 3].map(dropDot)];
const DOT_ALPHA = 0.45;
const DOT_POP = 0.1;

/* GhostMove: waypoints[cur] around the left block, constant speed, no chase. */
const WAYPOINTS = [
   { x: centreX(3), y: centreY(2) },
   { x: centreX(3), y: centreY(4) },
   { x: centreX(0), y: centreY(4) },
   { x: centreX(0), y: centreY(2) },
];
const GHOST_X = [...WAYPOINTS.map((p) => p.x), WAYPOINTS[0].x];
const GHOST_Y = [...WAYPOINTS.map((p) => p.y), WAYPOINTS[0].y];
/* Leg times follow leg lengths (24, 36, 24, 36): 120 units at GHOST_SPEED. */
const GHOST_TIMES = [0, 0.2, 0.5, 0.7, 1];
const GHOST_BODY =
   "M-4.5,5 V-0.5 A4.5,4.5 0 0 1 4.5,-0.5 V5 L3,3.5 L1.5,5 L0,3.5 L-1.5,5 L-3,3.5 Z";
const MARKER = 1.5;

const Maze = ({ tint }: { tint: string }) => (
   <>
      <rect
         x={GRID_X}
         y={GRID_Y}
         width={CELL * GRID_COLS}
         height={CELL * GRID_ROWS}
         rx={3}
         fill={NONE}
         stroke={WHITE_16}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      {WALLS.map((b) => (
         <rect
            key={`${b.col}:${b.row}`}
            {...blockRect(b)}
            rx={WALL_RADIUS}
            fill={NONE}
            stroke={WHITE_16}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
      ))}
      <path
         d={housePath()}
         fill={NONE}
         stroke={WHITE_16}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      <line
         x1={DOOR_X - DOOR_HALF}
         y1={HOUSE_RECT.y}
         x2={DOOR_X + DOOR_HALF}
         y2={HOUSE_RECT.y}
         stroke={`${tint}99`}
         strokeWidth={1.2}
      />
      {WAYPOINTS.map((p) => (
         <rect
            key={`${p.x}:${p.y}`}
            x={p.x - MARKER / 2}
            y={p.y - MARKER / 2}
            width={MARKER}
            height={MARKER}
            fill={WHITE_25}
         />
      ))}
   </>
);

const Pacdot = ({ dot }: { dot: Dot }) => (
   <motion.circle
      cx={dot.x}
      cy={dot.y}
      r={1.3}
      fill="#fff"
      initial={{ opacity: DOT_ALPHA, scale: 1 }}
      animate={{
         opacity: [DOT_ALPHA, DOT_ALPHA, 0, 0, DOT_ALPHA, DOT_ALPHA],
         scale: [1, 1, 1.6, 1, 1, 1],
      }}
      transition={loop(
         CYCLE,
         [
            0,
            t(dot.eatAt),
            t(dot.eatAt + DOT_POP),
            t(FADE_OUT_END),
            t(FADE_IN_END),
            1,
         ],
         "linear",
      )}
   />
);

/* The failed Linecast from the current tile into the wall ahead. */
const Linecast = ({ tint }: { tint: string }) => (
   <motion.line
      x1={CORNER.x}
      y1={CORNER.y}
      x2={CORNER.x + CELL}
      y2={CORNER.y}
      stroke={tint}
      strokeWidth={1}
      strokeLinecap="round"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 0.9, 0, 0] }}
      transition={loop(CYCLE, LINECAST_TIMES, "linear")}
   />
);

/* The group's fill-box is the body, so rotate turns it about its centre. */
const PacMan = ({ tint }: { tint: string }) => (
   <motion.g
      initial={{ x: START.x, y: START.y, opacity: 1, rotate: 0 }}
      animate={{ x: PAC_X, y: PAC_Y, opacity: PAC_OPACITY, rotate: FACING }}
      transition={{
         x: loop(CYCLE, PAC_X_TIMES, "linear"),
         y: loop(CYCLE, PAC_Y_TIMES, "linear"),
         opacity: loop(CYCLE, PAC_OPACITY_TIMES, "linear"),
         rotate: loop(CYCLE, FACING_TIMES),
      }}
   >
      <circle r={PAC_R} fill={tint} />
      <motion.path
         d={MOUTH}
         fill={INK}
         initial={{ scaleY: 1 }}
         animate={{ scaleY: CHOMP_SCALE }}
         transition={{ duration: CHOMP, repeat: Infinity, ease: CHOMP_EASE }}
      />
   </motion.g>
);

const Ghost = () => (
   <motion.g
      initial={{ x: WAYPOINTS[0].x, y: WAYPOINTS[0].y }}
      animate={{ x: GHOST_X, y: GHOST_Y }}
      transition={loop(CYCLE, GHOST_TIMES, "linear")}
   >
      <path
         d={GHOST_BODY}
         fill={WHITE_06}
         stroke={WHITE_28}
         strokeWidth={0.8}
      />
      <circle cx={-1.8} cy={0.6} r={1} fill={WHITE_70} />
      <circle cx={1.8} cy={0.6} r={1} fill={WHITE_70} />
   </motion.g>
);

const Pacman = ({ tint }: { tint: string }) => (
   <>
      <svg viewBox={VIEW_BOX} preserveAspectRatio={MEET} style={svgStyle}>
         <Maze tint={tint} />
         {DOTS.map((dot) => (
            <Pacdot key={`${dot.x}:${dot.y}`} dot={dot} />
         ))}
         <Linecast tint={tint} />
         <PacMan tint={tint} />
         <Ghost />
      </svg>
      <span style={{ ...labelStyle, left: "5%", top: "3%" }}>PACMANMOVE</span>
      <span style={{ ...labelStyle, right: "5%", top: "3%" }}>UNITY 2D</span>
      <span style={{ ...labelStyle, left: "5%", bottom: "4%" }}>GHOSTMOVE</span>
      <span style={{ ...labelStyle, left: "66.5%", top: "40%" }}>PACDOT</span>
   </>
);

export default Pacman;
