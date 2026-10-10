import { useId, type CSSProperties } from "react";
import { motion } from "motion/react";
import { AMBER, GREEN } from "@/constants/theme";
import {
   INK,
   MEET,
   NON_SCALING,
   NONE,
   ROUND,
   VIEW_BOX,
   WHITE_03,
   WHITE_06,
   WHITE_12,
   WHITE_16,
   WHITE_28,
   WHITE_35,
   WHITE_45,
   WHITE_85,
   beats,
   eases,
   labelStyle,
   loop,
   svgStyle,
   washStyle,
} from "./shared";
import { DOOR_D, DOTS_D, HOUSE_D, WALLS_D } from "./pacmanMaze";

/*
 * PacMan Game Unity on the repo's own maze: the 26 x 29 dot grid and wall
 * tubes below are traced from images/Gameplay.png. PacmanMove holds Right
 * and steps tile to tile along the corridor over the ghost house, each
 * Pacdot destroys itself on contact, Down is pressed early so valid(dir)
 * Linecasts into the house wall twice before the junction opens, and
 * GhostMove walks its waypoint circuit round the bar under the house at
 * speed 0.3 against Pac-Man's 0.4 until its OnTriggerEnter2D destroys him.
 */

const CYCLE = 6;
const at = beats(CYCLE);

/* Maze units are one dot pitch; the double outer line sits at -1 and -1.44. */
const TILE = 2.7;
const MAZE_TRANSFORM = `translate(75.8 11.9) scale(${TILE})`;

/*
 * PacmanMove: MoveTowards at 0.4 per step against GhostMove's 0.3, so the
 * ghost laps its 24 tile circuit in one cycle and Pac-Man runs 4/3 as fast.
 */
const GHOST_SPEED = 4;
const PAC_SPEED = (GHOST_SPEED * 4) / 3;
const START = { x: 5, y: 10 };
const TURN = { x: 17, y: 10 };
const HIT = { x: 17, y: 15.3 };
const RUN_START = 0.5;
const reach = (col: number) => RUN_START + (col - START.x) / PAC_SPEED;
const TURN_AT = reach(TURN.x);
const HIT_AT = TURN_AT + (HIT.y - TURN.y) / PAC_SPEED;
const GONE = HIT_AT + 0.12;
const SNAP = 5.1;
const RESPAWN = 5.3;
const BACK = 5.7;

const PAC_TIMES = at(RUN_START, TURN_AT, HIT_AT, SNAP, SNAP + 0.05);
const PAC_X = [START.x, START.x, TURN.x, HIT.x, HIT.x, START.x, START.x];
const PAC_Y = [START.y, START.y, TURN.y, HIT.y, HIT.y, START.y, START.y];
const FACING = [0, 0, 90, 90, 0, 0];
const FACING_TIMES = at(TURN_AT - 0.04, TURN_AT + 0.08, SNAP, SNAP + 0.05);
const LIFE_TIMES = at(HIT_AT, GONE, RESPAWN, BACK);
const LIFE_OPACITY = [1, 1, 0, 0, 1, 1];
const LIFE_SCALE = [1, 1, 0.4, 0.4, 1, 1];
const PAC_R = 0.85;
const MOUTH_HALF = Math.PI / 6;
const MOUTH_X = PAC_R * Math.cos(MOUTH_HALF);
const MOUTH_Y = PAC_R * Math.sin(MOUTH_HALF);
const MOUTH_D = `M0 0L${MOUTH_X} ${-MOUTH_Y}A${PAC_R} ${PAC_R} 0 0 1 ${MOUTH_X} ${MOUTH_Y}Z`;
const CHOMP = [1, 0.1, 1];

/* Eaten Pacdots: a mask stroke that trails Pac-Man's route, then lets go. */
const ROUTE_D = `M${START.x} ${START.y}H${TURN.x}V${HIT.y}`;
const ROUTE_TURN = (TURN.x - START.x) / (TURN.x - START.x + HIT.y - TURN.y);
const EATEN_TIMES = at(RUN_START, TURN_AT, HIT_AT, 5.5, 5.55);
const EATEN_LENGTH = [0, 0, ROUTE_TURN, 1, 1, 0, 0];
const EATEN_FADE_TIMES = at(4.8, 5.4, 5.6, 5.9);
const EATEN_OPACITY = [1, 1, 0, 0, 1, 1];

/* valid(Vector2.down): two Linecasts hit the house wall, the third is clear. */
const BLOCKED_TIMES = at(
   reach(15) - 0.02,
   reach(15) + 0.02,
   reach(15) + 0.12,
   reach(16) - 0.02,
   reach(16) + 0.02,
   reach(16) + 0.12,
);
const BLOCKED_OPACITY = [0, 0, 1, 0, 0, 1, 0, 0];
const CLEAR_TIMES = at(
   TURN_AT - 0.03,
   TURN_AT + 0.02,
   TURN_AT + 0.2,
   TURN_AT + 0.4,
);
const CLEAR_OPACITY = [0, 0, 1, 1, 0, 0];

/* GhostMove: waypoints[cur] round the bar, phased to meet Pac-Man at HIT. */
const WAYPOINTS = [
   { x: 8, y: 16 },
   { x: 17, y: 16 },
   { x: 17, y: 19 },
   { x: 8, y: 19 },
];
const GHOST_START = { x: 11.675, y: 19 };
const GHOST_TRACK = [
   GHOST_START,
   WAYPOINTS[3],
   WAYPOINTS[0],
   WAYPOINTS[1],
   WAYPOINTS[2],
   GHOST_START,
];
const legs = GHOST_TRACK.slice(1).map(
   (p, i) =>
      Math.abs(p.x - GHOST_TRACK[i].x) + Math.abs(p.y - GHOST_TRACK[i].y),
);
const LAP = legs.reduce((sum, leg) => sum + leg, 0);
const GHOST_TIMES = legs.reduce(
   (times, leg) => [...times, (times.at(-1) ?? 0) + leg / LAP],
   [0],
);
const GHOST_X = GHOST_TRACK.map((p) => p.x);
const GHOST_Y = GHOST_TRACK.map((p) => p.y);
const GHOST_D =
   "M-0.85 0.85V0A0.85 0.85 0 0 1 0.85 0V0.85L0.57 0.6L0.28 0.85L0 0.6L-0.28 0.85L-0.57 0.6Z";
const MARKER = 0.5;

/* OnTriggerEnter2D: Destroy(co.gameObject) where the two colliders meet. */
const RING = { x: 16.65, y: 15.65 };
const RING_TIMES = at(HIT_AT - 0.02, HIT_AT + 0.1, HIT_AT + 0.6);

/* Input.GetKey arrows, laid out as the inverted T in the left column. */
const KEY = 6.4;
const KEY_GAP = 1.1;
const KEYS_X = 12.8;
const KEYS_Y = 15.5;
interface Arrow {
   id: string;
   col: number;
   row: number;
   chevron: string;
}
const ARROWS: Arrow[] = [
   { id: "up", col: 1, row: 0, chevron: "M-1 0.5L0 -0.5L1 0.5" },
   { id: "left", col: 0, row: 1, chevron: "M0.5 -1L-0.5 0L0.5 1" },
   { id: "down", col: 1, row: 1, chevron: "M-1 -0.5L0 0.5L1 -0.5" },
   { id: "right", col: 2, row: 1, chevron: "M-0.5 -1L0.5 0L-0.5 1" },
];
const keyX = (a: Arrow) => KEYS_X + (KEY + KEY_GAP) * a.col;
const keyY = (a: Arrow) => KEYS_Y + (KEY + KEY_GAP) * a.row;
const HELD: Record<string, { times: number[]; opacity: number[] }> = {
   right: {
      times: at(0.25, 0.35, TURN_AT, TURN_AT + 0.1),
      opacity: [0, 0, 1, 1, 0, 0],
   },
   down: {
      times: at(reach(15) - 0.1, reach(15) - 0.02, HIT_AT, HIT_AT + 0.1),
      opacity: [0, 0, 1, 1, 0, 0],
   },
};

const hairline = {
   fill: NONE,
   strokeWidth: 1,
   vectorEffect: NON_SCALING,
} as const;

const Maze = ({ tint }: { tint: string }) => (
   <>
      <rect
         x={-1.44}
         y={-1.44}
         width={27.88}
         height={30.88}
         rx={0.9}
         stroke={WHITE_12}
         {...hairline}
      />
      <path d={WALLS_D} stroke={WHITE_16} {...hairline} />
      <path d={HOUSE_D} stroke={WHITE_16} {...hairline} />
      <path d={DOOR_D} stroke={`${tint}aa`} {...hairline} />
      {WAYPOINTS.map((p) => (
         <rect
            key={`${p.x}:${p.y}`}
            x={p.x - MARKER / 2}
            y={p.y - MARKER / 2}
            width={MARKER}
            height={MARKER}
            stroke={WHITE_28}
            {...hairline}
         />
      ))}
   </>
);

const Pacdots = () => {
   const maskId = `pacdots${useId().replaceAll(/\W/g, "")}`;
   return (
      <>
         <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x={-2}
            y={-2}
            width={30}
            height={33}
         >
            <rect x={-2} y={-2} width={30} height={33} fill="#fff" />
            <motion.path
               d={ROUTE_D}
               fill={NONE}
               stroke="#000"
               strokeWidth={1.1}
               strokeLinecap={ROUND}
               initial={{ pathLength: 0, opacity: 1 }}
               animate={{ pathLength: EATEN_LENGTH, opacity: EATEN_OPACITY }}
               transition={{
                  pathLength: loop(CYCLE, EATEN_TIMES, "linear"),
                  opacity: loop(CYCLE, EATEN_FADE_TIMES),
               }}
            />
         </mask>
         <path
            d={DOTS_D}
            stroke={WHITE_45}
            strokeWidth={0.26}
            strokeLinecap={ROUND}
            mask={`url(#${maskId})`}
         />
      </>
   );
};

const PacMan = ({ tint }: { tint: string }) => (
   <motion.g
      initial={{ x: START.x, y: START.y, rotate: 0, opacity: 1, scale: 1 }}
      animate={{
         x: PAC_X,
         y: PAC_Y,
         rotate: FACING,
         opacity: LIFE_OPACITY,
         scale: LIFE_SCALE,
      }}
      transition={{
         x: loop(CYCLE, PAC_TIMES, "linear"),
         y: loop(CYCLE, PAC_TIMES, "linear"),
         rotate: loop(CYCLE, FACING_TIMES),
         opacity: loop(CYCLE, LIFE_TIMES),
         scale: loop(CYCLE, LIFE_TIMES),
      }}
   >
      <circle r={PAC_R} fill={tint} />
      <motion.path
         d={MOUTH_D}
         fill={INK}
         initial={{ scaleY: 1 }}
         animate={{ scaleY: CHOMP }}
         transition={{ duration: 0.3, repeat: Infinity, ease: eases(2) }}
      />
   </motion.g>
);

/* The Linecast from the tile below back to Pac-Man, riding with him. */
const Linecast = () => (
   <motion.g
      initial={{ x: START.x, y: START.y }}
      animate={{ x: PAC_X, y: PAC_Y }}
      transition={loop(CYCLE, PAC_TIMES, "linear")}
   >
      <motion.path
         d="M0 0V1M-0.4 1H0.4"
         stroke={AMBER}
         strokeLinecap={ROUND}
         {...hairline}
         initial={{ opacity: 0 }}
         animate={{ opacity: BLOCKED_OPACITY }}
         transition={loop(CYCLE, BLOCKED_TIMES, "linear")}
      />
      <motion.path
         d="M0 0V1.1"
         stroke={GREEN}
         strokeLinecap={ROUND}
         {...hairline}
         initial={{ opacity: 0 }}
         animate={{ opacity: CLEAR_OPACITY }}
         transition={loop(CYCLE, CLEAR_TIMES, "linear")}
      />
   </motion.g>
);

const Ghost = () => (
   <motion.g
      initial={{ x: GHOST_START.x, y: GHOST_START.y }}
      animate={{ x: GHOST_X, y: GHOST_Y }}
      transition={loop(CYCLE, GHOST_TIMES, "linear")}
   >
      <path d={GHOST_D} {...hairline} fill={WHITE_06} stroke={WHITE_45} />
      <circle cx={-0.32} cy={0.05} r={0.2} fill={WHITE_85} />
      <circle cx={0.32} cy={0.05} r={0.2} fill={WHITE_85} />
   </motion.g>
);

const HitRing = () => (
   <motion.circle
      cx={RING.x}
      cy={RING.y}
      r={1.2}
      stroke={AMBER}
      {...hairline}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 0, 0.9, 0, 0], scale: [0.5, 0.5, 1, 1.7, 1.7] }}
      transition={loop(CYCLE, RING_TIMES)}
   />
);

const ArrowKey = ({ arrow, tint }: { arrow: Arrow; tint: string }) => {
   const x = keyX(arrow);
   const y = keyY(arrow);
   const held = HELD[arrow.id];
   return (
      <g>
         <rect
            x={x}
            y={y}
            width={KEY}
            height={KEY}
            rx={1.4}
            fill={WHITE_03}
            stroke={WHITE_12}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
         {held && (
            <motion.rect
               x={x}
               y={y}
               width={KEY}
               height={KEY}
               rx={1.4}
               fill={`${tint}2e`}
               stroke={`${tint}b3`}
               strokeWidth={1}
               vectorEffect={NON_SCALING}
               initial={{ opacity: 0 }}
               animate={{ opacity: held.opacity }}
               transition={loop(CYCLE, held.times)}
            />
         )}
         <path
            d={arrow.chevron}
            transform={`translate(${x + KEY / 2} ${y + KEY / 2})`}
            stroke={WHITE_45}
            strokeLinecap={ROUND}
            strokeLinejoin={ROUND}
            {...hairline}
         />
      </g>
   );
};

const legendRow = (top: string): CSSProperties => ({
   position: "absolute",
   left: "8%",
   top,
   display: "flex",
   alignItems: "center",
   gap: 5,
});
const legendLabel: CSSProperties = { ...labelStyle, position: "static" };

const Legend = () => (
   <>
      <span style={{ ...labelStyle, left: "8%", top: "8%" }}>PACMANMOVE</span>
      <div style={legendRow("38%")}>
         <span style={{ width: 8, height: 1, background: GREEN }} />
         <span style={legendLabel}>LINECAST</span>
      </div>
      <div style={legendRow("45%")}>
         <span
            style={{
               width: 4,
               height: 4,
               margin: "0 2px",
               border: `1px solid ${WHITE_35}`,
            }}
         />
         <span style={legendLabel}>GHOSTMOVE</span>
      </div>
      <div style={legendRow("52%")}>
         <span
            style={{
               width: 3,
               height: 3,
               margin: "0 2.5px",
               borderRadius: "50%",
               background: WHITE_45,
            }}
         />
         <span style={legendLabel}>PACDOT</span>
      </div>
   </>
);

const Pacman = ({ tint }: { tint: string }) => (
   <>
      <div style={washStyle(tint, "68% 42%")} />
      <svg viewBox={VIEW_BOX} preserveAspectRatio={MEET} style={svgStyle}>
         {ARROWS.map((arrow) => (
            <ArrowKey key={arrow.id} arrow={arrow} tint={tint} />
         ))}
         <g transform={MAZE_TRANSFORM}>
            <Pacdots />
            <Maze tint={tint} />
            <Linecast />
            <Ghost />
            <PacMan tint={tint} />
            <HitRing />
         </g>
      </svg>
      <Legend />
   </>
);

export default Pacman;
