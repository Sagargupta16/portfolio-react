import { useId } from "react";
import { motion } from "motion/react";
import {
   CYCLE,
   LAND_AT,
   NON_SCALING,
   PANEL_SOLID,
   WHITE_05,
   WHITE_07,
   WHITE_22,
   WHITE_35,
   WHITE_55,
   loop,
} from "./sceneTokens";
import type { PipelineProps, Point } from "./sceneTokens";
import { Label, Panel, Pop, Rule, SceneSvg } from "./primitives";
import { QueryOverlay, QueryPanel } from "./QueryStage";

/* GitHub Stats Card Action (github_stats_card.py render_card): one GraphQL
   query, then the card draws as the real SVG does. Five stat tiles fade in,
   the contribution calendar fills one week column at a time from the left,
   the current streak goes live, and the top languages bar grows. */

const CARD = { x: 540, y: 110, w: 924, h: 690 };
const INNER_X = CARD.x + 32;
const INNER_W = CARD.w - 64;
const TARGETS: Point[] = [[CARD.x, CARD.y + CARD.h / 2]];

/* Five stat tiles: contributions, commits, pull requests, stars, followers. */
const TILE_GAP = 16;
const TILE_W = (INNER_W - 4 * TILE_GAP) / 5;
const TILE_Y = CARD.y + 80;
const TILE_H = 104;
const TILE_XS = [0, 1, 2, 3, 4].map((i) => INNER_X + i * (TILE_W + TILE_GAP));
const TILE_VALUES = [96, 76, 64, 84, 56];

/* Contribution calendar: one column per week, seven days each. */
const WEEKS = 15;
const DAYS = 7;
const CELL = 32;
const PITCH = 40;
const CAL_X = INNER_X;
const CAL_Y = TILE_Y + TILE_H + 36;
const CAL_W = WEEKS * PITCH - (PITCH - CELL);
const CAL_H = DAYS * PITCH - (PITCH - CELL);

/* Streak panel to the right of the calendar. */
const STREAK = { x: CAL_X + CAL_W + 26, y: CAL_Y, h: CAL_H };
const STREAK_W = INNER_X + INNER_W - STREAK.x;

/* Top languages by code size: a stacked bar and its legend. */
const BAR_Y = CAL_Y + CAL_H + 36;
const BAR_H = 20;
const LANG_SHARES = [0.34, 0.22, 0.17, 0.12, 0.09, 0.06];
const LANG_ALPHAS = ["ff", "c7", "99", "73", "52", "38"];
/* Three languages per legend row, as the real card lays them out. */
const LEGEND_YS = [BAR_Y + 66, BAR_Y + 110];
const LEGEND_PITCH = 290;

interface Cell {
   id: string;
   x: number;
   y: number;
   level: number;
}

/* Integer mix (two multiply and xorshift rounds): 0..99, no visible stripes. */
const scatter = (n: number): number => {
   let h = n + 1;
   h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
   h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
   return ((h ^ (h >>> 16)) >>> 0) % 100;
};

/* Fixed, hash-scattered activity so every render draws the same calendar;
   the last weeks run hot, the way a live streak ends the year. */
const CELLS: Cell[] = Array.from({ length: WEEKS * DAYS }, (_, i) => {
   const week = Math.floor(i / DAYS);
   const day = i % DAYS;
   const hash = scatter(i);
   const warm = week >= WEEKS - 3 ? 30 : 0;
   const score = hash + warm;
   let level = 0;
   if (score > 92) level = 4;
   else if (score > 78) level = 3;
   else if (score > 58) level = 2;
   else if (score > 32) level = 1;
   return {
      id: `w${week}d${day}`,
      x: CAL_X + week * PITCH,
      y: CAL_Y + day * PITCH,
      level,
   };
});

/* Beats, cycle seconds. */
const TILES_AT = LAND_AT + 0.1;
const SWEEP_FROM = 2.05;
const SWEEP_TO = 3.25;
const STREAK_AT = 3.3;
const BAR_FROM = 3.5;
const BAR_TO = 4.4;
const RESET = 5.3;

const Tiles = () => (
   <motion.g
      animate={{ opacity: [0, 0, 1, 1, 0, 0], y: [10, 10, 0, 0, 0, 10] }}
      transition={loop(0, TILES_AT, TILES_AT + 0.4, RESET, RESET + 0.35, CYCLE)}
   >
      {TILE_XS.map((x, i) => (
         <g key={x}>
            <Panel
               x={x}
               y={TILE_Y}
               w={TILE_W}
               h={TILE_H}
               rx={12}
               fill={WHITE_05}
               stroke={WHITE_07}
            />
            <rect
               x={x + 20}
               y={TILE_Y + 26}
               width={TILE_VALUES[i]}
               height={20}
               rx={5}
               fill={WHITE_55}
            />
            <Rule x={x + 20} y={TILE_Y + 76} w={TILE_W - 50} color={WHITE_22} />
         </g>
      ))}
   </motion.g>
);

const Calendar = ({ tint }: { tint: string }) => {
   const shades = [WHITE_05, `${tint}38`, `${tint}66`, `${tint}a6`, tint];
   return (
      <g>
         {CELLS.map((cell) => (
            <rect
               key={cell.id}
               x={cell.x}
               y={cell.y}
               width={CELL}
               height={CELL}
               rx={6}
               fill={shades[cell.level]}
            />
         ))}
      </g>
   );
};

/* A card-coloured cover pulls back to the right, uncovering the weeks left
   to right; a tint scan line rides its edge. Same clock, same easing. */
const SWEEP = loop(0, SWEEP_FROM, SWEEP_TO, RESET, RESET + 0.4, CYCLE);
const SCAN_FADE = loop(
   0,
   SWEEP_FROM - 0.05,
   SWEEP_FROM + 0.05,
   SWEEP_TO - 0.1,
   SWEEP_TO + 0.05,
   CYCLE,
);
const CalendarSweep = ({ tint }: { tint: string }) => (
   <>
      <motion.rect
         x={CAL_X - 8}
         y={CAL_Y - 8}
         width={CAL_W + 16}
         height={CAL_H + 16}
         fill={PANEL_SOLID}
         animate={{ scaleX: [1, 1, 0, 0, 1, 1] }}
         transition={SWEEP}
         style={{ originX: 1 }}
      />
      <motion.line
         x1={CAL_X - 8}
         x2={CAL_X - 8}
         y1={CAL_Y - 14}
         y2={CAL_Y + CAL_H + 14}
         stroke={tint}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
         animate={{
            x: [0, 0, CAL_W + 16, CAL_W + 16, 0, 0],
            opacity: [0, 0, 0.9, 0.9, 0, 0],
         }}
         transition={{ x: SWEEP, opacity: SCAN_FADE }}
      />
   </>
);

const StreakPanel = () => (
   <>
      <Panel
         x={STREAK.x}
         y={STREAK.y}
         w={STREAK_W}
         h={STREAK.h}
         rx={14}
         fill={WHITE_05}
         stroke={WHITE_07}
      />
      <rect
         x={STREAK.x + 26}
         y={STREAK.y + 92}
         width={120}
         height={34}
         rx={6}
         fill={WHITE_55}
      />
      <Rule
         x={STREAK.x + 26}
         y={STREAK.y + 186}
         w={STREAK_W - 60}
         color={WHITE_22}
      />
      <Rule
         x={STREAK.x + 26}
         y={STREAK.y + 222}
         w={STREAK_W - 110}
         color={WHITE_22}
      />
   </>
);

const LANG_SEGMENTS = LANG_SHARES.map((share, i) => {
   const before = LANG_SHARES.slice(0, i).reduce((sum, s) => sum + s, 0);
   return {
      alpha: LANG_ALPHAS[i],
      x: INNER_X + before * INNER_W,
      w: share * INNER_W,
   };
});

const Languages = ({ tint, clipId }: { tint: string; clipId: string }) => (
   <>
      <defs>
         <clipPath id={clipId}>
            <rect
               x={INNER_X}
               y={BAR_Y}
               width={INNER_W}
               height={BAR_H}
               rx={BAR_H / 2}
            />
         </clipPath>
      </defs>
      <rect
         x={INNER_X}
         y={BAR_Y}
         width={INNER_W}
         height={BAR_H}
         rx={BAR_H / 2}
         fill={WHITE_05}
      />
      <g clipPath={`url(#${clipId})`}>
         <motion.g
            animate={{ scaleX: [0, 0, 1, 1, 0, 0] }}
            transition={loop(0, BAR_FROM, BAR_TO, RESET, RESET + 0.4, CYCLE)}
            style={{ originX: 0 }}
         >
            {LANG_SEGMENTS.map((seg) => (
               <rect
                  key={seg.alpha}
                  x={seg.x}
                  y={BAR_Y}
                  width={seg.w}
                  height={BAR_H}
                  fill={`${tint}${seg.alpha}`}
               />
            ))}
         </motion.g>
      </g>
      {LANG_SEGMENTS.map((seg, i) => {
         const x = INNER_X + (i % 3) * LEGEND_PITCH;
         const y = LEGEND_YS[Math.floor(i / 3)];
         return (
            <g key={seg.alpha}>
               <circle cx={x + 10} cy={y} r={10} fill={`${tint}${seg.alpha}`} />
               <Rule x={x + 34} y={y} w={120} color={WHITE_35} />
            </g>
         );
      })}
   </>
);

const GithubCardPipeline = ({ tint }: PipelineProps) => {
   const clipId = useId();
   return (
      <>
         <SceneSvg>
            <QueryPanel tint={tint} fields={[124, 94, 114]} targets={TARGETS} />
            <Panel {...CARD} fill={PANEL_SOLID} />
            <Tiles />
            <Calendar tint={tint} />
            <CalendarSweep tint={tint} />
            <StreakPanel />
            <Languages tint={tint} clipId={clipId} />
         </SceneSvg>
         <QueryOverlay tint={tint} label="GRAPHQL" targets={TARGETS} />
         <Label x={INNER_X} y={CARD.y + 44} text="GITHUB" color={tint} />
         <Pop
            x={STREAK.x + 30}
            y={STREAK.y + 40}
            at={STREAK_AT}
            until={RESET}
         />
         <Label
            x={STREAK.x + 48}
            y={STREAK.y + 40}
            text="STREAK"
            color={WHITE_55}
         />
      </>
   );
};

export default GithubCardPipeline;
