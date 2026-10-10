import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Pip,
   Shell,
   Trace,
   Wire,
} from "../kit/primitives";
import {
   AMBER,
   GREEN,
   GRID,
   W06,
   W16,
   W25,
   clock,
   comet,
   line,
   loopProps,
   passAt,
   ride,
   route,
} from "../kit/sceneTokens";
import type { Box, Pt, Stop, TintProps } from "../kit/sceneTokens";

/*
 * MCP Toolkit: every with* call wraps the server's tool registration, so a
 * call runs an onion, outermost first: withCors, withAuth, withRateLimit,
 * withCache, then the tool handler at the core.
 *   call 1 passes every layer, spends a token-bucket token, runs the handler,
 *          and its response is cached on the way out (cache.set)
 *   call 2 spends a token and returns from CACHE without reaching the handler
 *   call 3 carries a bad key and dies at AUTH (AuthError) before the rate
 *          limiter, so it costs no token
 * The bucket refills and the entry expires while the loop resets.
 */

const beat = clock(5.6);
const RAIL_Y = 92;
const RAIL_X0 = 52;
const CORE_X = 212;
/* the rail ends just inside the handler, where the call is served */
const RAIL_X1 = CORE_X + 4;
const W02 = "rgba(255,255,255,0.02)";

const RAIL = route(line([RAIL_X0, RAIL_Y], [RAIL_X1, RAIL_Y]));
/* rail fraction at stage x */
const at = (x: number) => (x - RAIL_X0) / (RAIL_X1 - RAIL_X0);

interface Layer {
   name: string;
   box: Box;
   rx: number;
}

/* nested from the outside in; left walls 36 units apart, common centre y */
const LAYERS: Layer[] = [
   { name: "CORS", box: [64, 17, 230, 150], rx: 12 },
   { name: "AUTH", box: [100, 33, 186, 118], rx: 11 },
   { name: "RATE LIMIT", box: [136, 49, 142, 86], rx: 10 },
   { name: "CACHE", box: [172, 66, 98, 52], rx: 9 },
];
const AUTH_WALL = 100;
const RATE_WALL = 136;
const CACHE_WALL = 172;
const CORE: Box = [CORE_X, 76, 52, 32];

const CALL: Stop[] = [
   [0.04, 0],
   [0.19, 1],
   [0.24, 1],
   [0.38, 0],
];
const HIT_X = at(184);
const CACHED: Stop[] = [
   [0.44, 0],
   [0.54, HIT_X],
   [0.57, HIT_X],
   [0.66, 0],
];
const DENIED: Stop[] = [
   [0.72, 0],
   [0.79, at(AUTH_WALL - 5)],
];

/* derived beats: where each packet crosses the layer it changes */
const SPEND_1 = passAt(CALL[0], CALL[1], at(RATE_WALL));
const SPEND_2 = passAt(CACHED[0], CACHED[1], at(RATE_WALL));
const CACHE_SET = passAt(CALL[2], CALL[3], at(CACHE_WALL));

const token = (spent: number, refill: number) =>
   beat({
      times: [0, spent, spent + 0.02, refill, refill + 0.04, 1],
      opacity: [1, 1, 0.12, 0.12, 1, 1],
   });

const HANDLER = beat({
   times: [0, 0.185, 0.2, 0.24, 0.28, 1],
   opacity: [0, 0, 1, 1, 0, 0],
});
const ENTRY = beat({
   times: [0, CACHE_SET, CACHE_SET + 0.03, 0.54, 0.56, 0.6, 0.88, 0.92, 1],
   opacity: [0, 0, 0.7, 0.7, 1, 0.7, 0.7, 0, 0],
});
const HIT = beat({
   times: [0, 0.54, 0.56, 0.63, 1],
   opacity: [0, 0, 1, 0, 0],
   scale: [1, 1, 1.5, 1, 1],
});
const AUTH_ERROR = beat({
   times: [0, 0.785, 0.805, 0.87, 1],
   opacity: [0, 0, 1, 0, 0],
   scale: [1, 1, 1.6, 1, 1],
});

const FLIGHTS = [CALL, CACHED, DENIED].map((stops) => ({
   key: stops[0][0],
   dot: beat(ride(RAIL, stops)),
   trail: beat(comet(stops, 0.16)),
}));

const Bucket = ({ tint }: TintProps) => (
   <>
      <Wire d="M147,104 V129 H161 V104" stroke={W16} />
      <circle cx={154} cy={124} r={2.4} fill={tint} />
      <motion.circle
         cx={154}
         cy={117}
         r={2.4}
         fill={tint}
         {...loopProps(token(SPEND_2, 0.92))}
      />
      <motion.circle
         cx={154}
         cy={110}
         r={2.4}
         fill={tint}
         {...loopProps(token(SPEND_1, 0.89))}
      />
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      {LAYERS.map(({ name, box, rx }) => (
         <Panel key={name} box={box} rx={rx} fill={W02} />
      ))}
      <Panel box={CORE} rx={7} fill={`${tint}10`} stroke={`${tint}59`} />
      <motion.g {...loopProps(HANDLER)}>
         <Panel box={CORE} rx={7} fill={`${tint}26`} stroke={tint} />
      </motion.g>
      <Bar box={[220, 83, 34, 4]} fill={W25} />
      <Bar box={[220, 99, 24, 4]} fill={W16} />
      {/* client, the rail into the onion */}
      <Panel box={[26, 80, 26, 24]} rx={5} />
      <circle cx={39} cy={RAIL_Y} r={2.6} fill={tint} />
      <Wire d={RAIL.d} />
      <Bucket tint={tint} />
      {/* LRU slot inside CACHE: empty until the first response is stored */}
      <Bar box={[178, 104, 26, 5]} fill={W06} />
      <motion.g {...loopProps(ENTRY)}>
         <Bar box={[178, 104, 26, 5]} fill={tint} />
      </motion.g>
      {FLIGHTS.map((f) => (
         <Trace
            key={f.key}
            d={RAIL.d}
            color={`${tint}99`}
            width={2.6}
            loop={f.trail}
         />
      ))}
   </>
);

/* each package name sits in its layer's top band, a staircase into the core */
const tab = ([x, y]: Box): Pt => [x + 7, y + 8.5];

const MiddlewareVariant = ({ tint }: TintProps) => (
   <Shell
      tint={tint}
      focus="74% 46%"
      texture={GRID}
      stage={<Stage tint={tint} />}
   >
      {FLIGHTS.map((f) => (
         <Packet key={f.key} color={tint} loop={f.dot} />
      ))}
      <Pip at={[208, 106.5]} size={5} color={GREEN} loop={HIT} />
      <Pip at={[AUTH_WALL, RAIL_Y]} size={6} color={AMBER} loop={AUTH_ERROR} />
      {LAYERS.map(({ name, box }) => (
         <Label key={name} at={tab(box)}>
            {name}
         </Label>
      ))}
   </Shell>
);

export default MiddlewareVariant;
