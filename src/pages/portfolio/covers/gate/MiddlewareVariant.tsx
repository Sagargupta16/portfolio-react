import { motion } from "motion/react";
import { Dot, Label, Rider, Shapes, Shell } from "./primitives";
import {
   AMBER,
   GREEN,
   LINEAR,
   WHITE_03,
   WHITE_12,
   WHITE_15,
   WHITE_25,
   WHITE_50,
   layer,
   loopProps,
   pctX,
   pctY,
} from "./sceneTokens";
import type {
   Box,
   Keyframes,
   Line,
   Loop,
   Rect,
   Statics,
   TintProps,
} from "./sceneTokens";

/* MCP Toolkit: a tool call leaves the client, runs the ordered withCors /
   withAuth / withRateLimit / withCache gates and lands on the handler; the
   next dies at AUTH (amber) and the last short-circuits on a cache hit.
   Every keyframe array ends where it starts. */

const MW_CYCLE = 5.6;
const RAIL = 92;
const DOT_Y = 76;
const CLIENT = 36;
const AUTH = 128;
const CACHE = 218;
const HANDLER = 269;
const GATE_W = 34;

const GATES = [
   { name: "CORS", cx: 83 },
   { name: "AUTH", cx: AUTH },
   { name: "RATE", cx: 173 },
   { name: "CACHE", cx: CACHE },
];

const gateBox = (cx: number): Box => [cx - GATE_W / 2, 69, GATE_W, 46];
const HANDLER_BOX: Box = [249, 69, 40, 46];

const pulse = (loop: Keyframes): Loop => ({ ...loop, duration: MW_CYCLE });
const travel = (loop: Keyframes): Loop => ({ ...pulse(loop), ease: LINEAR });

/* Requests ride one track from the client to the handler; x is the fraction
   of that track, so a stop at AUTH or CACHE lands on the panel at any width. */
const along = (...xs: number[]) =>
   xs.map((x) => `${(((x - CLIENT) / (HANDLER - CLIENT)) * 100).toFixed(2)}%`);

const PASS = travel({
   x: along(CLIENT, CLIENT, HANDLER, HANDLER, CLIENT),
   opacity: [0, 1, 1, 0, 0],
   times: [0, 0.02, 0.3, 0.36, 1],
});
/* response back to the client; CACHE blinks as it passes (cache.set) */
const REPLY = travel({
   x: along(HANDLER, HANDLER, 236, 70, CLIENT, HANDLER),
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.36, 0.38, 0.48, 0.5, 1],
});
/* AuthError: the dot stops at AUTH and hands over to its amber twin */
const REJECT_X = along(CLIENT, CLIENT, CLIENT, AUTH, AUTH, AUTH, CLIENT);
const REJECT = travel({
   x: REJECT_X,
   opacity: [0, 0, 1, 1, 0, 0, 0],
   times: [0, 0.49, 0.5, 0.6, 0.64, 0.66, 1],
});
const REJECT_AMBER = travel({
   x: REJECT_X,
   opacity: [0, 0, 0, 0, 1, 0, 0],
   times: [0, 0.49, 0.5, 0.6, 0.63, 0.67, 1],
});
/* cache hit: reaches CACHE and reverses without touching the handler */
const HIT = travel({
   x: along(CLIENT, CLIENT, CLIENT, CACHE, CLIENT, CLIENT, CLIENT),
   opacity: [0, 0, 1, 1, 1, 0, 0],
   times: [0, 0.73, 0.74, 0.84, 0.92, 0.93, 1],
});
const AUTH_FLASH = pulse({
   opacity: [0, 0, 1, 0, 0],
   scale: [1, 1, 1.6, 1, 1],
   times: [0, 0.6, 0.64, 0.68, 1],
});
/* CACHE panel and its dot light together: a small blink for cache.set, a
   full flash for the hit; only the dot grows */
const HIT_TIMES = [0, 0.39, 0.41, 0.43, 0.84, 0.87, 0.9, 1];
const HIT_FLASH = pulse({
   opacity: [0, 0, 0.8, 0, 0, 1, 0, 0],
   times: HIT_TIMES,
});
const HIT_GROW = pulse({ scale: [1, 1, 1, 1, 1, 1.6, 1, 1], times: HIT_TIMES });
const LAND_TIMES = [0, 0.3, 0.33, 0.36, 1];
const LAND = pulse({
   scale: [1, 1, 1.6, 1, 1],
   opacity: [0.5, 0.5, 1, 0.5, 0.5],
   times: LAND_TIMES,
});
const LAND_FILL = pulse({ opacity: [0, 0, 1, 0, 0], times: LAND_TIMES });
/* createLogger ticker: one line per request, all cleared at cycle end */
const log = (at: number) =>
   pulse({ opacity: [0, 0, 0.6, 0.6, 0], times: [0, at, at + 0.04, 0.92, 1] });

/* [x, w, fade-in time] */
const LOG_BARS: [number, number, number][] = [
   [26, 40, 0.32],
   [77, 28, 0.62],
   [115, 34, 0.86],
];

/* client, four gates with dim status dots, handler with its tool list */
const statics = (tint: string): Statics => ({
   lines: [
      [CLIENT, RAIL, 294, RAIL],
      ...GATES.map((g): Line => [g.cx, DOT_Y, g.cx, DOT_Y, WHITE_25, 3]),
      [257, 81, 281, 81, WHITE_15, 2],
      [257, 89, 281, 89, WHITE_15, 2],
      [257, 97, 281, 97, WHITE_15, 2],
   ],
   rects: [
      [6, 83, 30, 18, WHITE_03, 4, WHITE_12],
      ...GATES.map((g): Rect => [...gateBox(g.cx), WHITE_03, 5, WHITE_12]),
      [...HANDLER_BOX, `${tint}0a`, 6, `${tint}55`],
   ],
});

const Stage = ({ tint }: TintProps) => (
   <>
      <Shapes {...statics(tint)} />
      <motion.g {...loopProps(LAND_FILL)}>
         <Shapes rects={[[...HANDLER_BOX, `${tint}22`, 6]]} />
      </motion.g>
   </>
);

/* CACHE panel overlay in slot percentages; radius matches the SVG rx of 5 */
const cacheFill = (tint: string): React.CSSProperties => {
   const [x, y, w, h] = gateBox(CACHE);
   return {
      position: "absolute",
      left: pctX(x),
      top: pctY(y),
      width: pctX(w),
      height: pctY(h),
      borderRadius: "15% / 11%",
      background: `${tint}22`,
   };
};

const logBar = (x: number, w: number): React.CSSProperties => ({
   position: "absolute",
   left: pctX(x),
   top: pctY(160),
   width: pctX(w),
   height: 2,
   borderRadius: 1,
   background: WHITE_25,
});

const Signals = ({ tint }: TintProps) => (
   <>
      <Dot x={AUTH} y={DOT_Y} size={3} color={AMBER} loop={AUTH_FLASH} />
      <motion.div style={layer} {...loopProps(HIT_FLASH)}>
         <div style={cacheFill(tint)} />
         <Dot x={CACHE} y={DOT_Y} size={3} color={GREEN} loop={HIT_GROW} />
      </motion.div>
      <Dot x={HANDLER} y={106} size={3} color={GREEN} loop={LAND} />
      <div
         style={{
            position: "absolute",
            left: pctX(CLIENT),
            width: pctX(HANDLER - CLIENT),
            top: pctY(RAIL),
         }}
      >
         <Rider size={4} color={tint} loop={PASS} />
         <Rider size={3} color={`${tint}aa`} loop={REPLY} />
         <Rider size={4} color={tint} loop={REJECT} />
         <Rider size={4} color={AMBER} loop={REJECT_AMBER} />
         <Rider size={4} color={tint} loop={HIT} />
      </div>
      {LOG_BARS.map(([x, w, at]) => (
         <motion.div key={x} style={logBar(x, w)} {...loopProps(log(at))} />
      ))}
   </>
);

const MiddlewareVariant = ({ tint }: TintProps) => (
   <Shell tint={tint} glow="47% 46%" stage={<Stage tint={tint} />}>
      <Signals tint={tint} />
      {GATES.map((g) => (
         <Label key={g.name} left={pctX(g.cx)} top="51%" color={WHITE_50}>
            {g.name}
         </Label>
      ))}
   </Shell>
);

export default MiddlewareVariant;
