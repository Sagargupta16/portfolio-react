import { useId, type CSSProperties } from "react";
import { motion } from "motion/react";
import { AMBER, MONO_FONT } from "@/constants/theme";
import {
   INK,
   MEET,
   NON_SCALING,
   NONE,
   VIEW_BOX,
   WHITE_03,
   WHITE_04,
   WHITE_10,
   WHITE_12,
   WHITE_16,
   WHITE_45,
   WHITE_70,
   beats,
   clock,
   labelStyle,
   loop,
   svgStyle,
   washStyle,
} from "./shared";
import {
   ALL_D,
   BOARD_X,
   BOARD_Y,
   CLICK,
   CLICK_AT,
   CLOSED,
   CYCLE,
   FADE,
   HIT,
   LCD,
   LINK_AT,
   MINE_AT,
   MINES,
   NUMBERED,
   PANEL_AT,
   PITCH,
   RESET,
   RESET_END,
   RESTART_AT,
   RINGS,
   SCORE_X,
   TILE,
   TIME_X,
   centre,
   ringAt,
   tileX,
   tileY,
   tilesD,
   type Cell,
} from "./minesweeperBoard";
import MinesweeperHud from "./MinesweeperHud";

/*
 * Minesweeper Game Unity on its real PlayField: w = 10, h = 13, mines at
 * Random.value < 0.15 (medium). A click on a covered Element runs FFuncover,
 * which floods out four ways and stops on numbered cells while ScoreScript
 * counts every uncover (rim cells reached twice count twice, so 36 opened
 * cells score 038). TimerScript snaps back to 060 on each safe click; the
 * mine click runs uncoverMines, freezes the timer and GameOverScript.Setup
 * shows the score until RestartButton reloads the scene.
 */

const t = clock(CYCLE);
const at = beats(CYCLE);

const coverTimes = (openAt: number) =>
   at(openAt, openAt + FADE, RESET, RESET_END);
const COVER_OPACITY = [1, 1, 0, 0, 1, 1];

/* Task(1) then GameOverScript.Setup: a hairline from the mine to the panel. */
const PANEL = { left: 60, top: 28, width: 31, height: 40 };
const HIT_CENTRE = centre(HIT);
const PANEL_EDGE = {
   x: (PANEL.left / 100) * 160,
   y: PANEL.top + PANEL.height / 2,
};
const LINK_D = `M${HIT_CENTRE.x + 2.6} ${HIT_CENTRE.y}C${HIT_CENTRE.x + 12} ${HIT_CENTRE.y} ${PANEL_EDGE.x - 10} ${PANEL_EDGE.y} ${PANEL_EDGE.x} ${PANEL_EDGE.y}`;
const LINK_LENGTH_TIMES = at(LINK_AT, LINK_AT + 0.45, 5.6, 5.65);
const LINK_LENGTH = [0, 0, 1, 1, 0, 0];
const LINK_FADE_TIMES = at(RESET, RESET_END, 5.7, 5.8);
const LINK_OPACITY = [1, 1, 0, 0, 1, 1];
const PANEL_TIMES = at(PANEL_AT, PANEL_AT + 0.3, RESET, RESET + 0.3);
const PANEL_OPACITY = [0.22, 0.22, 1, 1, 0.22, 0.22];

/* Cursor: click, guess the mine, press RESTART, park. */
const HOME = { x: 140, y: 84 };
const RESTART = {
   x: ((PANEL.left + PANEL.width / 2) / 100) * 160,
   y: PANEL.top + PANEL.height * 0.76,
};
const CLICK_CENTRE = centre(CLICK);
const CURSOR_PATH = [
   HOME,
   HOME,
   CLICK_CENTRE,
   CLICK_CENTRE,
   HIT_CENTRE,
   HIT_CENTRE,
   RESTART,
   RESTART,
   HOME,
   HOME,
];
const CURSOR_TIMES = [0, 0.2, 0.9, 2.6, 3.6, 4.6, 5.1, 5.3, 5.9, 6].map(t);
const PRESS_TIMES = [
   0,
   0.95,
   CLICK_AT,
   1.1,
   MINE_AT - 0.05,
   MINE_AT,
   MINE_AT + 0.1,
   RESTART_AT - 0.05,
   RESTART_AT,
   RESTART_AT + 0.1,
   6,
].map(t);
const PRESS_SCALE = [1, 1, 0.7, 1, 1, 0.7, 1, 1, 0.7, 1, 1];

const fill = (color: string) => ({ fill: color, stroke: NONE });
const hairline = {
   fill: NONE,
   strokeWidth: 1,
   vectorEffect: NON_SCALING,
} as const;

const Backdrop = () => {
   const patternId = `mslattice${useId().replaceAll(/\W/g, "")}`;
   return (
      <>
         <defs>
            <pattern
               id={patternId}
               width={PITCH}
               height={PITCH}
               patternUnits="userSpaceOnUse"
            >
               <circle cx={PITCH / 2} cy={PITCH / 2} r={0.22} fill={WHITE_04} />
            </pattern>
         </defs>
         <rect width={160} height={100} fill={`url(#${patternId})`} />
      </>
   );
};

/* Bevelled frame, sunken HUD strip and the opened-floor tiles. */
const Frame = () => (
   <>
      <rect
         x={25.8}
         y={12.5}
         width={49.8}
         height={75.6}
         rx={2.4}
         {...hairline}
         fill={WHITE_03}
         stroke={WHITE_10}
      />
      <rect
         x={BOARD_X - 0.6}
         y={14.3}
         width={46.6}
         height={10.4}
         rx={1.6}
         fill={NONE}
         stroke={WHITE_10}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      <rect
         x={BOARD_X - 0.6}
         y={BOARD_Y - 0.6}
         width={46.6}
         height={60.4}
         rx={1.6}
         fill={NONE}
         stroke={WHITE_10}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      <path d={ALL_D} {...fill(WHITE_03)} />
   </>
);

/* What the covers hide: adjacentMines digits and the mine sprites. */
const Revealed = ({ tint }: { tint: string }) => (
   <>
      <rect
         x={tileX(HIT)}
         y={tileY(HIT)}
         width={TILE}
         height={TILE}
         rx={0.7}
         fill={`${AMBER}40`}
      />
      {NUMBERED.map((c) => {
         const p = centre(c);
         return (
            <text
               key={`${c.col}:${c.row}`}
               x={p.x}
               y={p.y}
               fontFamily={MONO_FONT}
               fontSize={3}
               fontWeight={700}
               textAnchor="middle"
               dominantBaseline="central"
               fill={c.mark === "1" ? WHITE_70 : tint}
            >
               {c.mark}
            </text>
         );
      })}
      {MINES.map((c) => {
         const p = centre(c);
         return (
            <g key={`${c.col}:${c.row}`} transform={`translate(${p.x} ${p.y})`}>
               <path
                  d="M-1.5 0H1.5M0 -1.5V1.5M-1.05 -1.05L1.05 1.05M-1.05 1.05L1.05 -1.05"
                  stroke={tint}
                  {...hairline}
               />
               <circle r={0.9} fill={tint} />
            </g>
         );
      })}
   </>
);

const CoverPaths = ({ cells }: { cells: Cell[] }) => {
   const d = tilesD(cells);
   return (
      <>
         <path d={d} {...fill(INK)} />
         <path d={d} {...fill(WHITE_12)} />
      </>
   );
};

/* A set of covers that lifts together at `openAt`, back on RestartButton. */
const Covers = ({ cells, openAt }: { cells: Cell[]; openAt: number }) => (
   <motion.g
      initial={{ opacity: 1 }}
      animate={{ opacity: COVER_OPACITY }}
      transition={loop(CYCLE, coverTimes(openAt), "linear")}
   >
      <CoverPaths cells={cells} />
   </motion.g>
);

const Link = ({ tint }: { tint: string }) => (
   <motion.path
      d={LINK_D}
      fill={NONE}
      stroke={`${tint}99`}
      strokeWidth={0.5}
      initial={{ pathLength: 0, opacity: 1 }}
      animate={{ pathLength: LINK_LENGTH, opacity: LINK_OPACITY }}
      transition={{
         pathLength: loop(CYCLE, LINK_LENGTH_TIMES),
         opacity: loop(CYCLE, LINK_FADE_TIMES),
      }}
   />
);

const Cursor = () => (
   <motion.g
      initial={{ x: HOME.x, y: HOME.y, scale: 1 }}
      animate={{
         x: CURSOR_PATH.map((p) => p.x),
         y: CURSOR_PATH.map((p) => p.y),
         scale: PRESS_SCALE,
      }}
      transition={{
         x: loop(CYCLE, CURSOR_TIMES),
         y: loop(CYCLE, CURSOR_TIMES),
         scale: loop(CYCLE, PRESS_TIMES, "linear"),
      }}
   >
      <circle r={2.6} stroke={WHITE_70} {...hairline} />
      <circle r={0.6} fill={WHITE_70} />
   </motion.g>
);

const panelText: CSSProperties = {
   ...labelStyle,
   left: "50%",
   transform: "translate(-50%, -50%)",
};

/* GameOverScript: hidden in play, Setup(score) lights it after the mine. */
const GameOverPanel = ({ tint }: { tint: string }) => (
   <motion.div
      initial={{ opacity: PANEL_OPACITY[0] }}
      animate={{ opacity: PANEL_OPACITY }}
      transition={loop(CYCLE, PANEL_TIMES)}
      style={{
         position: "absolute",
         left: `${PANEL.left}%`,
         top: `${PANEL.top}%`,
         width: `${PANEL.width}%`,
         height: `${PANEL.height}%`,
         borderRadius: 7,
         border: `1px solid ${WHITE_10}`,
         background: WHITE_03,
      }}
   >
      <span style={{ ...panelText, top: "20%", color: AMBER }}>GAME OVER</span>
      <span
         style={{
            ...panelText,
            top: "46%",
            fontSize: 9,
            letterSpacing: 2,
            color: tint,
         }}
      >
         038
      </span>
      <span
         style={{
            ...panelText,
            top: "76%",
            padding: "2px 6px",
            borderRadius: 4,
            border: `1px solid ${WHITE_16}`,
            color: WHITE_45,
         }}
      >
         RESTART
      </span>
   </motion.div>
);

const Minesweeper = ({ tint }: { tint: string }) => (
   <>
      <div style={washStyle(tint, "32% 46%")} />
      <svg viewBox={VIEW_BOX} preserveAspectRatio={MEET} style={svgStyle}>
         <Backdrop />
         <Frame />
         <Revealed tint={tint} />
         <g>
            <CoverPaths cells={CLOSED} />
         </g>
         {RINGS.map((r) => (
            <Covers key={r.id} cells={r.cells} openAt={ringAt(r.ring)} />
         ))}
         <Covers cells={MINES} openAt={MINE_AT} />
         <MinesweeperHud tint={tint} />
         <Link tint={tint} />
         <Cursor />
      </svg>
      <span
         style={{ ...labelStyle, left: `${(SCORE_X / 160) * 100}%`, top: "8%" }}
      >
         SCORE
      </span>
      <span
         style={{
            ...labelStyle,
            right: `${100 - ((TIME_X + LCD.w) / 160) * 100}%`,
            top: "8%",
         }}
      >
         TIME
      </span>
      <GameOverPanel tint={tint} />
   </>
);

export default Minesweeper;
