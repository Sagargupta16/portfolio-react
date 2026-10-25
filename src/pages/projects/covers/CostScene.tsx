import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import type { MotionStyle } from "motion/react";
import { Bar, Label, Panel, Shell } from "./kit/primitives";
import {
   COLUMNS,
   NON_SCALING,
   W06,
   W10,
   W16,
   W25,
   W40,
   W55,
   W70,
   clock,
   label,
   loopProps,
   pctX,
   pctY,
} from "./kit/sceneTokens";
import type { Box, Loop, TintProps } from "./kit/sceneTokens";
import { sceneDriver } from "@utils/sceneClock";

/*
 * Claude Cost Optimizer: what one Claude Code session pays per turn, and the
 * levers that cut it. Left, a turn's prompt as the calculator builds it
 * (CLAUDE.md lines, MCP server schemas, the reply, the model). Right, the
 * calculator's cost-per-turn chart: output at the bottom, the new exchange
 * written to the cache, and the earlier turns read back from it on top, so
 * the climbing edge is the cache read and turn 1 is one big cache write.
 * A cursor walks the levers in order:
 * 1. CLAUDE.md is trimmed: the cached prefix, so the cache read and the
 *    turn 1 write shrink.
 * 2. Two of three MCP servers go: the prefix shrinks again.
 * 3. cost-mode drops the filler: the reply collapses to one short line and
 *    the output band thins.
 * 4. `/model haiku` routes the work: every band gets cheaper.
 * The dashed caps keep the unoptimised silhouette. The loop opens on the
 * optimised session, so the frozen Reduced frame is the finished cut: it
 * rewinds, holds the full bill, then applies the levers. One 6 s loop,
 * 12 animated nodes.
 */

const CYCLE = 6;
const beat = clock(CYCLE);
/* rewind to the full bill, hold it, then the four levers */
const REWIND = [0.08, 0.16];
const TRIM = [0.24, 0.32];
const MCP_CUT = [0.38, 0.46];
const BRIEF = [0.52, 0.6];
const ROUTE = [0.66, 0.74];

/* hold the cut, rewind to full, cut again inside [on, off] */
const cut = ([on, off]: number[], low: number) => ({
   times: [0, ...REWIND, on, off, 1],
   track: [low, low, 1, 1, low, low],
});

/* ---------- prompt panel, left ---------- */

const PROMPT: Box = [26, 16, 110, 138];
const ROW_X = 36;
const CURSOR_X = 29;
/* row centres: CLAUDE.md, MCP, reply, model */
const ROW_C = [38, 70, 102, 132];
const MCP_Y = 68;
const MCP_X = [36, 66, 96];
const CHIP_W = 26;
const REPLY_Y = [94, 101, 108];
const MODEL: Box = [36, 127, 10, 10];

/* ---------- cost per turn chart, right ---------- */

const CHART: Box = [148, 16, 146, 138];
const BASE_Y = 144;
const BAR_W = 10;
const OUT_H = 14;
const WRITE_H = 7;
const SPIKE_H = 38;
const TURNS = 8;
const barX = (t: number) => 160 + t * 16;
/* cache read per later turn: the cached prefix plus growing history */
const readH = (t: number) => 34 + (t - 1) * 8;
const LATER = Array.from({ length: TURNS - 1 }, (_, i) => i + 1);
const READ_FLOOR = BASE_Y - OUT_H - WRITE_H;
const OUT_LOW = 0.45;
const DROP = OUT_H * (1 - OUT_LOW);

const ORIGIN_LEFT: MotionStyle = { originX: 0 };
const ORIGIN_BOTTOM: MotionStyle = { originY: 1 };

/* ---------- timelines ---------- */

/* the kit's Loop has no scaleY track, so bars that grow upward use this */
interface Stretch {
   duration: number;
   times: number[];
   scaleY: number[];
}

const stretch = (times: number[], scaleY: number[]): Stretch => ({
   duration: CYCLE,
   times,
   scaleY,
});

/* same contract as loopProps: one easeInOut per segment */
const motionOf = (loop: Loop | Stretch) => {
   if (!("scaleY" in loop)) return loopProps(loop);
   const { duration, times, scaleY } = loop;
   return {
      animate: { scaleY },
      transition: {
         duration,
         times,
         ease: times.slice(1).map(() => "easeInOut" as const),
         repeat: Infinity,
         driver: sceneDriver,
      },
   };
};

const trim = cut(TRIM, 0.45);
const brief = cut(BRIEF, OUT_LOW);
const route = cut(ROUTE, 0.7);
const briefOut = cut(BRIEF, 0);
const routeIn = cut(ROUTE, 0);
const mcpOut = cut(MCP_CUT, 0.12);

/* two-step shrink: trimmed CLAUDE.md, then fewer MCP schemas */
const prefix = (mid: number, low: number) =>
   stretch(
      [0, ...REWIND, ...TRIM, ...MCP_CUT, 1],
      [low, low, 1, 1, mid, mid, low, low],
   );

const CLAUDE_MD = beat({ times: trim.times, scaleX: trim.track });
const MCP_GONE = beat({ times: mcpOut.times, opacity: mcpOut.track });
const FILLER = beat({ times: briefOut.times, opacity: briefOut.track });
const FIRST_LINE = beat({ times: brief.times, scaleX: brief.track });
/* the model chip and its label fade in on the route beat, out on rewind */
const HAIKU = beat({
   times: routeIn.times,
   opacity: routeIn.track.map((v) => 1 - v),
});
const CURSOR = beat({
   times: [0, ...REWIND, 0.34, 0.38, 0.48, 0.52, 0.62, 0.66, 1],
   y: [3, 3, 0, 0, 1, 1, 2, 2, 3, 3].map((row) => ROW_C[row] - ROW_C[0]),
});

const READ = prefix(0.75, 0.55);
const SPIKE = prefix(0.65, 0.5);
const OUTPUT = stretch(brief.times, brief.track);
const LIFT = beat({
   times: brief.times,
   y: brief.track.map((v) => (v === 1 ? 0 : DROP)),
});
const ROUTED = stretch(route.times, route.track);

/* before silhouette: a dashed cap on every full height bar */
const barTop = (t: number) =>
   t === 0 ? BASE_Y - OUT_H - SPIKE_H : READ_FLOOR - readH(t);
const CAPS_D = Array.from(
   { length: TURNS },
   (_, t) => `M${barX(t) - 1},${barTop(t)} H${barX(t) + BAR_W + 1}`,
).join(" ");

const Loops = ({
   loop,
   style,
   children,
}: Readonly<{
   loop: Loop | Stretch;
   style?: MotionStyle;
   children: ReactNode;
}>) => (
   <motion.g style={style} {...motionOf(loop)}>
      {children}
   </motion.g>
);

/* one MCP server's tool schema: a chip with a status dot and a name bar */
const Chip = ({ x, tint }: Readonly<{ x: number; tint: string }>) => (
   <>
      <Panel box={[x, MCP_Y, CHIP_W, 10]} rx={2} />
      <circle cx={x + 5} cy={MCP_Y + 5} r={1.6} fill={`${tint}99`} />
      <Bar box={[x + 9, MCP_Y + 3.75, 13, 2.5]} fill={W16} />
   </>
);

const Prompt = ({ tint }: TintProps) => (
   <>
      <Panel box={PROMPT} rx={7} />
      {/* CLAUDE.md: the full file stays as a ghost, the kept lines shrink */}
      <Bar box={[ROW_X, 36, 90, 4]} fill={W06} />
      <Bar box={[ROW_X, 43, 74, 4]} fill={W06} />
      <Loops loop={CLAUDE_MD} style={ORIGIN_LEFT}>
         <Bar box={[ROW_X, 36, 90, 4]} fill={W40} />
         <Bar box={[ROW_X, 43, 74, 4]} fill={W25} />
      </Loops>
      <Chip x={MCP_X[0]} tint={tint} />
      <Loops loop={MCP_GONE}>
         <Chip x={MCP_X[1]} tint={tint} />
         <Chip x={MCP_X[2]} tint={tint} />
      </Loops>
      {/* the reply: three lines of prose, then one short answer */}
      <Loops loop={FIRST_LINE} style={ORIGIN_LEFT}>
         <Bar box={[ROW_X, REPLY_Y[0], 90, 3.5]} fill={W25} />
      </Loops>
      <Loops loop={FILLER}>
         <Bar box={[ROW_X, REPLY_Y[1], 84, 3.5]} fill={W10} />
         <Bar box={[ROW_X, REPLY_Y[2], 62, 3.5]} fill={W10} />
      </Loops>
      <Panel box={MODEL} rx={2} stroke={W25} />
      <Loops loop={HAIKU}>
         <rect
            x={MODEL[0] + 2.5}
            y={MODEL[1] + 2.5}
            width={MODEL[2] - 5}
            height={MODEL[3] - 5}
            rx={1}
            fill={tint}
         />
      </Loops>
      <Loops loop={CURSOR}>
         <rect
            x={CURSOR_X}
            y={ROW_C[0] - 7}
            width={2}
            height={14}
            rx={1}
            fill={tint}
         />
      </Loops>
   </>
);

/* the calculator's stacked cost per turn: output, cache write, cache read */
const Chart = ({ tint }: TintProps) => {
   const write = `${tint}cc`;
   return (
      <>
         <Panel box={CHART} rx={7} />
         <rect x={156} y={25} width={5} height={5} rx={1} fill={`${tint}59`} />
         <path
            d={`M154,${BASE_Y} H288`}
            stroke={W16}
            vectorEffect={NON_SCALING}
         />
         <path
            d={CAPS_D}
            fill="none"
            stroke={W40}
            strokeDasharray="2 2"
            vectorEffect={NON_SCALING}
         />
         <Loops loop={ROUTED} style={ORIGIN_BOTTOM}>
            <Loops loop={OUTPUT} style={ORIGIN_BOTTOM}>
               {Array.from({ length: TURNS }, (_, t) => (
                  <rect
                     key={t}
                     x={barX(t)}
                     y={BASE_Y - OUT_H}
                     width={BAR_W}
                     height={OUT_H}
                     fill={W25}
                  />
               ))}
            </Loops>
            <Loops loop={LIFT}>
               <Loops loop={SPIKE} style={ORIGIN_BOTTOM}>
                  <rect
                     x={barX(0)}
                     y={BASE_Y - OUT_H - SPIKE_H}
                     width={BAR_W}
                     height={SPIKE_H}
                     fill={write}
                  />
               </Loops>
               {LATER.map((t) => (
                  <rect
                     key={t}
                     x={barX(t)}
                     y={READ_FLOOR}
                     width={BAR_W}
                     height={WRITE_H}
                     fill={write}
                  />
               ))}
               <Loops loop={READ} style={ORIGIN_BOTTOM}>
                  {LATER.map((t) => (
                     <rect
                        key={t}
                        x={barX(t)}
                        y={READ_FLOOR - readH(t)}
                        width={BAR_W}
                        height={readH(t)}
                        fill={`${tint}59`}
                     />
                  ))}
               </Loops>
            </Loops>
         </Loops>
      </>
   );
};

const Stage = ({ tint }: TintProps) => (
   <>
      <Prompt tint={tint} />
      <Chart tint={tint} />
   </>
);

/* /model haiku, beside the model chip once the route lever lands */
const routeTag: CSSProperties = {
   ...label,
   left: pctX(MODEL[0] + 16),
   top: pctY(ROW_C[3]),
   transform: "translateY(-50%)",
   color: W70,
};

const CostScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="72% 60%"
      texture={COLUMNS}
      stage={<Stage tint={tint} />}
   >
      <Label at={[ROW_X, 29]} color={W55}>
         CLAUDE.MD
      </Label>
      <Label at={[ROW_X, 61]} color={W55}>
         MCP
      </Label>
      <Label at={[164, 27.5]} color={W55}>
         CACHE READ
      </Label>
      <motion.span style={routeTag} {...loopProps(HAIKU)}>
         /MODEL HAIKU
      </motion.span>
   </Shell>
);

export default CostScene;
