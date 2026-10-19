import { motion } from "motion/react";
import { Bar, Label, Packet, Panel, Pip, Shell, Wire } from "./kit/primitives";
import {
   AMBER,
   COLUMNS,
   GREEN,
   INK,
   NON_SCALING,
   W06,
   W10,
   W16,
   W25,
   W40,
   W55,
   clock,
   curveD,
   line,
   loopProps,
   ride,
   route,
   sCurve,
} from "./kit/sceneTokens";
import type { Box, Keys, Loop, Pt, Stop, TintProps } from "./kit/sceneTokens";

/*
 * AgentCore harness agent on Terraform: an MCP client signs a call (SigV4)
 * and reaches the AgentCore Gateway, whose default deny Cedar policy permits
 * only the listed tools and callers.
 * 1. The client's ask_architect call passes Cedar (green), crosses to the
 *    tools runtime (a grid of eight tools plus ask_architect) and starts a
 *    turn of the harness, whose run bar fills for the rest of the turn.
 * 2. A caller missing from tool_caller_role_names is stopped at the gateway
 *    wall (amber) and never lands.
 * 3. The harness calls the tools back through the same gateway: Cedar passes
 *    it, render_diagram runs and the finished file drops into S3.
 * 4. Evaluations scores the session (green) and promote.sh moves the version
 *    into the pinned PROD endpoint.
 * One 6 s loop, 11 animated nodes, all of it fading out together.
 */

const beat = clock(6);
const HOLD = 0.9;
const GONE = 0.94;

/* MCP clients, left: one listed caller, one that Cedar does not list */
const CLIENT_X = 26;
const CLIENT_W = 40;
const CLIENT_H = 24;
const CLIENT_Y = 52;
const STRANGER_Y = 104;
const CLIENT_RIGHT = CLIENT_X + CLIENT_W;

/* the gateway: calls enter on its left wall, Cedar decides at its centre */
const GATE: Box = [98, 40, 44, 76];
const GATE_IN: Pt = [98, 78];
const GATE_C: Pt = [120, 78];
const GATE_OUT: Pt = [142, 78];
const GATE_BOTTOM = GATE[1] + GATE[3];

/* tools runtime: 3 x 3 tiles, eight tools and ask_architect */
const TOOLS: Box = [172, 22, 78, 82];
const TOOLS_X = TOOLS[0];
const TOOLS_RIGHT = TOOLS[0] + TOOLS[2];
const TILE = 16;
const COLS = [189, 211, 233];
const ROWS = [46, 68, 90];
const ASK: Pt = [COLS[0], ROWS[2]];
const RENDER: Pt = [COLS[2], ROWS[1]];

/* harness below the tools, PROD endpoint beside it, S3 right of the tools */
const HARNESS: Box = [172, 116, 78, 24];
const HARNESS_Y = HARNESS[1] + HARNESS[3] / 2;
const S3: Pt = [276, 68];
const PROD: Box = [262, 118, 32, 20];
const CHIP: Box = [233, 124, 14, 8];
const PROMOTE = PROD[0] + PROD[2] / 2 - (CHIP[0] + CHIP[2] / 2);
const RUN: Box = [178, 132, 42, 2.5];

/* ---------------- routes ---------------- */

/* client -> Cedar -> ask_architect -> harness */
const ASK_ROUTE = route(
   sCurve([CLIENT_RIGHT, CLIENT_Y], GATE_IN),
   line(GATE_IN, GATE_C),
   line(GATE_C, GATE_OUT),
   sCurve(GATE_OUT, [TOOLS_X, ASK[1]]),
   line([TOOLS_X, ASK[1]], ASK),
   line(ASK, [ASK[0], HARNESS[1]]),
);
const ASK_STOPS: Stop[] = [
   [0.04, 0],
   [0.12, ASK_ROUTE.ends[1]],
   [0.16, ASK_ROUTE.ends[1]],
   [0.24, ASK_ROUTE.ends[4]],
   [0.27, ASK_ROUTE.ends[4]],
   [0.31, 1],
];

/* the unlisted caller reaches the gateway wall and stops there */
const DENIED_ROUTE = route(sCurve([CLIENT_RIGHT, STRANGER_Y], GATE_IN));
const DENIED_STOPS: Stop[] = [
   [0.32, 0],
   [0.4, 1],
   [0.44, 1],
];

/* harness -> the same gateway, from below -> render_diagram -> S3 */
const CALLBACK_ROUTE = route(
   line([TOOLS_X, HARNESS_Y], [GATE_C[0], HARNESS_Y]),
   line([GATE_C[0], HARNESS_Y], GATE_C),
   line(GATE_C, GATE_OUT),
   sCurve(GATE_OUT, [TOOLS_X, RENDER[1]]),
   line([TOOLS_X, RENDER[1]], RENDER),
   line(RENDER, S3),
);
const CALLBACK_STOPS: Stop[] = [
   [0.5, 0],
   [0.58, CALLBACK_ROUTE.ends[1]],
   [0.62, CALLBACK_ROUTE.ends[1]],
   [0.69, CALLBACK_ROUTE.ends[4]],
   [0.72, CALLBACK_ROUTE.ends[4]],
   [0.77, 1],
];

const WIRES = [
   curveD(sCurve([CLIENT_RIGHT, CLIENT_Y], GATE_IN)),
   curveD(sCurve([CLIENT_RIGHT, STRANGER_Y], GATE_IN)),
   curveD(sCurve(GATE_OUT, [TOOLS_X, ASK[1]])),
   curveD(sCurve(GATE_OUT, [TOOLS_X, RENDER[1]])),
   `M${ASK[0]},${ROWS[2] + TILE / 2} V${HARNESS[1]}`,
   `M${TOOLS_X},${HARNESS_Y} H${GATE_C[0]} V${GATE_BOTTOM}`,
   `M${TOOLS_RIGHT},${S3[1]} H${S3[0] - 10}`,
];

/* ---------------- timeline ---------------- */

const ASK_PACKET = beat(ride(ASK_ROUTE, ASK_STOPS));
const DENIED_PACKET = beat(ride(DENIED_ROUTE, DENIED_STOPS));
const CALLBACK_PACKET = beat(ride(CALLBACK_ROUTE, CALLBACK_STOPS));

/* Cedar permits twice: the client's call, then the harness's */
const PERMIT = beat({
   times: [0, 0.12, 0.14, 0.18, 0.21, 0.58, 0.6, 0.64, 0.67, 1],
   opacity: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
});
const DENY = beat({
   times: [0, 0.4, 0.42, 0.48, 0.51, 1],
   opacity: [0, 0, 1, 1, 0, 0],
});

const held = (on: number, extra: Omit<Keys, "times" | "opacity"> = {}) =>
   beat({
      times: [0, on, on + 0.03, HOLD, GONE, 1],
      opacity: [0, 0, 1, 1, 0, 0],
      ...extra,
   });
const ASK_LIT = held(0.24);
const RENDER_LIT = held(0.69);
const FILE_IN = held(0.77, { y: [-6, -6, 0, 0, 0, -6] });
const SCORED = held(0.79, { scale: [0.4, 0.4, 1, 1, 1, 0.4] });

/* the harness turn runs until its file is in S3 */
const TURN = beat({
   times: [0, 0.31, 0.33, 0.76, HOLD, GONE, 1],
   opacity: [0, 0, 1, 1, 1, 0, 0],
   scaleX: [0, 0, 0.04, 1, 1, 1, 0],
   ease: "linear",
});
const PROMOTED = beat({
   times: [0, 0.8, 0.82, 0.87, HOLD, GONE, 1],
   opacity: [0, 0, 1, 1, 1, 0, 0],
   x: [0, 0, 0, PROMOTE, PROMOTE, PROMOTE, 0],
});

/* ---------------- clients ---------------- */

const DASH = "3 2";

const Client = ({
   tint,
   y,
   listed,
}: Readonly<TintProps & { y: number; listed: boolean }>) => {
   const top = y - CLIENT_H / 2;
   const ink = listed ? W55 : W25;
   return (
      <>
         <rect
            x={CLIENT_X}
            y={top}
            width={CLIENT_W}
            height={CLIENT_H}
            rx={5}
            fill={INK}
            stroke={listed ? W16 : W25}
            strokeDasharray={listed ? undefined : DASH}
            vectorEffect={NON_SCALING}
         />
         <Wire
            d={`M${CLIENT_X + 6},${y - 3} L${CLIENT_X + 9},${y} L${CLIENT_X + 6},${y + 3}`}
            stroke={ink}
         />
         <Bar box={[CLIENT_X + 13, y - 1.5, 18, 3]} fill={listed ? W16 : W10} />
         {listed && (
            <circle cx={CLIENT_RIGHT - 5} cy={top + 5} r={1.6} fill={tint} />
         )}
      </>
   );
};

/* ---------------- gateway ---------------- */

/* Cedar rows above and below the crossing: permit(, principal, action, when */
const CEDAR_ROWS: [number, number, string][] = [
   [60, 18, "key"],
   [66, 26, W16],
   [92, 12, W16],
   [98, 10, W10],
   [104, 14, "key"],
];

const Gateway = ({ tint }: TintProps) => (
   <>
      <Panel box={GATE} rx={6} fill={INK} stroke={W25} />
      <Wire d={`M${GATE[0]},52 H${GATE[0] + GATE[2]}`} />
      {CEDAR_ROWS.map(([y, w, fill]) => (
         <Bar
            key={y}
            box={[GATE[0] + 6, y - 1.5, w, 3]}
            fill={fill === "key" ? `${tint}80` : fill}
         />
      ))}
      <Wire d={`M${GATE_IN[0]},${GATE_C[1]} H${GATE_OUT[0]}`} stroke={W06} />
      <circle
         cx={GATE_C[0]}
         cy={GATE_C[1]}
         r={3.2}
         fill={INK}
         stroke={W40}
         vectorEffect={NON_SCALING}
      />
      <motion.g {...loopProps(PERMIT)}>
         <Panel box={GATE} rx={6} fill={`${GREEN}0d`} stroke={`${GREEN}b3`} />
         <circle cx={GATE_C[0]} cy={GATE_C[1]} r={3.2} fill={GREEN} />
      </motion.g>
      <motion.g {...loopProps(DENY)}>
         <Panel box={GATE} rx={6} fill="none" stroke={`${AMBER}b3`} />
         <rect
            x={GATE_IN[0] - 1.5}
            y={GATE_IN[1] - 9}
            width={3}
            height={18}
            rx={1.5}
            fill={AMBER}
         />
      </motion.g>
   </>
);

/* ---------------- tools runtime ---------------- */

const tileBox = ([x, y]: Pt) => ({
   x: x - TILE / 2,
   y: y - TILE / 2,
   width: TILE,
   height: TILE,
   rx: 3,
});

const TILES: Pt[] = ROWS.flatMap((y) => COLS.map((x): Pt => [x, y]));
const tileKey = ([x, y]: Pt) => x * 1000 + y;
const ASK_KEY = tileKey(ASK);

const LitTile = ({
   tint,
   at,
   loop,
}: Readonly<TintProps & { at: Pt; loop: Loop }>) => (
   <motion.g {...loopProps(loop)}>
      <rect
         {...tileBox(at)}
         fill={`${tint}33`}
         stroke={`${tint}b3`}
         vectorEffect={NON_SCALING}
      />
      <Bar box={[at[0] - 4, at[1] - 1, 8, 2]} fill={tint} />
   </motion.g>
);

const Tools = ({ tint }: TintProps) => (
   <>
      <Panel box={TOOLS} rx={7} />
      <rect x={180} y={27} width={6} height={6} rx={1.5} fill={`${tint}66`} />
      <Bar box={[190, 28.5, 30, 3]} fill={W16} />
      {TILES.map((p) => (
         <g key={tileKey(p)}>
            <rect
               {...tileBox(p)}
               fill={INK}
               stroke={tileKey(p) === ASK_KEY ? `${tint}80` : W16}
               vectorEffect={NON_SCALING}
            />
            <Bar box={[p[0] - 4, p[1] - 1, 8, 2]} fill={W16} />
         </g>
      ))}
      <LitTile tint={tint} at={ASK} loop={ASK_LIT} />
      <LitTile tint={tint} at={RENDER} loop={RENDER_LIT} />
   </>
);

/* ---------------- S3, harness, PROD ---------------- */

const [S3X, S3Y] = S3;
const BUCKET = `M${S3X - 10},${S3Y - 8} L${S3X - 8},${S3Y + 8} Q${S3X},${S3Y + 12} ${S3X + 8},${S3Y + 8} L${S3X + 10},${S3Y - 8}`;

const Bucket = ({ tint }: TintProps) => (
   <>
      <path
         d={BUCKET}
         fill={`${tint}0d`}
         stroke={`${tint}99`}
         vectorEffect={NON_SCALING}
      />
      <ellipse
         cx={S3X}
         cy={S3Y - 8}
         rx={10}
         ry={3}
         fill={INK}
         stroke={`${tint}cc`}
         vectorEffect={NON_SCALING}
      />
      <motion.g {...loopProps(FILE_IN)}>
         <rect
            x={S3X - 3.5}
            y={S3Y - 3}
            width={7}
            height={9}
            rx={1}
            fill={`${tint}cc`}
         />
      </motion.g>
   </>
);

const Harness = ({ tint }: TintProps) => (
   <>
      <Panel box={HARNESS} rx={6} stroke={`${tint}55`} />
      <Bar box={RUN} fill={W10} />
      <motion.g style={{ originX: 0 }} {...loopProps(TURN)}>
         <Bar box={RUN} fill={tint} />
      </motion.g>
      <rect
         x={CHIP[0]}
         y={CHIP[1]}
         width={CHIP[2]}
         height={CHIP[3]}
         rx={2}
         fill="none"
         stroke={W25}
         vectorEffect={NON_SCALING}
      />
      <rect
         x={PROD[0]}
         y={PROD[1]}
         width={PROD[2]}
         height={PROD[3]}
         rx={5}
         fill={INK}
         stroke={W25}
         strokeDasharray={DASH}
         vectorEffect={NON_SCALING}
      />
      <motion.g {...loopProps(PROMOTED)}>
         <rect
            x={CHIP[0]}
            y={CHIP[1]}
            width={CHIP[2]}
            height={CHIP[3]}
            rx={2}
            fill={tint}
         />
      </motion.g>
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      {WIRES.map((d) => (
         <Wire key={d} d={d} stroke={W16} />
      ))}
      <Client tint={tint} y={CLIENT_Y} listed />
      <Client tint={tint} y={STRANGER_Y} listed={false} />
      <Gateway tint={tint} />
      <Tools tint={tint} />
      <Bucket tint={tint} />
      <Harness tint={tint} />
   </>
);

export default function AgentCoreScene({ tint }: Readonly<TintProps>) {
   return (
      <Shell
         tint={tint}
         focus="40% 45%"
         texture={COLUMNS}
         stage={<Stage tint={tint} />}
      >
         <Label at={[GATE[0] + 6, 46]} color={`${tint}cc`}>
            CEDAR
         </Label>
         <Label at={[HARNESS[0] + 6, HARNESS_Y - 3]} color={W55}>
            HARNESS
         </Label>
         <Label at={[S3X, S3Y + 20]} color={W55} centered>
            S3
         </Label>
         <Label at={[PROD[0] + PROD[2] / 2, PROD[1] - 7]} color={W55} centered>
            PROD
         </Label>
         <Packet color={tint} loop={ASK_PACKET} />
         <Packet color={tint} loop={DENIED_PACKET} />
         <Packet color={tint} loop={CALLBACK_PACKET} />
         <Pip at={[226, HARNESS_Y]} color={GREEN} loop={SCORED} />
      </Shell>
   );
}
