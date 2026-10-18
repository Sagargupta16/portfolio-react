import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, Label, Packet, Panel, Pip, Shell, Wire } from "./kit/primitives";
import {
   DOTS,
   INK,
   NON_SCALING,
   W06,
   W10,
   W16,
   W25,
   W40,
   W55,
   W70,
   clock,
   curveD,
   line,
   loopProps,
   ride,
   route,
   sCurve,
   shown,
} from "./kit/sceneTokens";
import type { Box, Cubic, Loop, Pt, Stop } from "./kit/sceneTokens";

/*
 * LeetCode Rating Predictor: the real form (username, a weekly and a
 * biweekly contest, each a checkbox plus your rank) posts to /api/predict.
 * For every ticked contest the backend builds the feature row from the
 * profile and the rank, scales it, and runs the exported Dense network
 * (15 inputs, ReLU layers of 128, 64 and 32, one linear output). Each answer
 * lands as a result card whose delta bar grows from a centre axis: right
 * for a gain, left for a drop. The second contest starts from the first
 * one's rating after, so they run in order.
 * 1. Both contests are ticked, Predict is pressed.
 * 2. The weekly row rides through the network, the layers fire left to
 *    right, the output fires, card one's bar grows right.
 * 3. The biweekly row follows, card two's bar grows left.
 * One 6 s loop, 9 animated nodes.
 */

const beat = clock(6);
const HOLD = 0.9;
const GONE = 0.94;

/* the form, left */
const FORM: Box = [26, 16, 80, 128];
const FORM_RIGHT = FORM[0] + FORM[2];
const CONTEST_TOPS = [42, 84];
const CHECK = 6;

/* the Dense network, centre: shown neurons per layer, the real ones are
   15, 128, 64, 32 and 1 */
const LAYER_X = [132, 150, 168, 186, 204];
const LAYER_N = [7, 8, 6, 4, 1];
const NET_Y = 80;
const NEURON_GAP = 9;
const IN: Pt = [LAYER_X[0], NET_Y];
const OUT: Pt = [LAYER_X[4], NET_Y];
const BAND_W = 10;

/* result cards, right */
const CARD_X = 228;
const CARD_W = 66;
const CARD_H = 44;
const CARD_TOPS = [30, 86];
const AXIS_X = 261;
const GAIN_W = 22;
const DROP_W = 12;

const neuronYs = (n: number) =>
   Array.from({ length: n }, (_, j) => NET_Y + (j - (n - 1) / 2) * NEURON_GAP);
const LAYERS = LAYER_X.map((x, i) => ({ x, ys: neuronYs(LAYER_N[i]) }));

/* every neuron to every neuron in the next layer, one static path */
const EDGES_D = LAYERS.slice(1)
   .flatMap((to, i) =>
      LAYERS[i].ys.flatMap((y0) =>
         to.ys.map((y1) => `M${LAYERS[i].x},${y0} L${to.x},${y1}`),
      ),
   )
   .join(" ");

/* rank field port, into the input layer, through, out to its card */
const portY = (top: number) => top + 26;
const cardPort = (top: number): Pt => [CARD_X, top + 22];
const feedCurve = (top: number): Cubic => sCurve([FORM_RIGHT, portY(top)], IN);
const landCurve = (top: number): Cubic => sCurve(OUT, cardPort(top));
const ROUTES = CONTEST_TOPS.map((top, i) =>
   route(feedCurve(top), line(IN, OUT), landCurve(CARD_TOPS[i])),
);
const [AT_IN, AT_OUT] = ROUTES[0].ends;

/* each contest: feed, forward pass, land */
const PASS_STARTS = [0.22, 0.5];
const passStops = (t0: number): Stop[] => [
   [t0, 0],
   [t0 + 0.06, AT_IN],
   [t0 + 0.18, AT_OUT],
   [t0 + 0.24, 1],
];
const PASSES = PASS_STARTS.map((t0, i) => beat(ride(ROUTES[i], passStops(t0))));

/* forward pass windows: the packet crosses the network in each */
const WINDOWS = PASS_STARTS.map((t0) => [t0 + 0.06, t0 + 0.18] as const);
const BAND_FROM = LAYER_X[0] - BAND_W / 2;
const BAND_TO = LAYER_X[4] - BAND_W / 2;

/* a tint band sweeps the layers in step with each forward pass, then
   slides home while hidden */
const SWEEP = beat({
   times: [
      0,
      ...WINDOWS.flatMap(([on, off]) => [on - 0.01, on, off, off + 0.01]),
      1,
   ],
   x: [
      BAND_FROM,
      ...WINDOWS.flatMap(() => [BAND_FROM, BAND_FROM, BAND_TO, BAND_TO]),
      BAND_FROM,
   ],
   opacity: [0, ...WINDOWS.flatMap(() => [0, 1, 1, 0]), 0],
});

/* the output neuron fires as each pass reaches it */
const FIRE = beat({
   times: [
      0,
      ...WINDOWS.flatMap(([, off]) => [off - 0.01, off, off + 0.05]),
      1,
   ],
   opacity: [0, ...WINDOWS.flatMap(() => [0, 1, 0]), 0],
   scale: [1, ...WINDOWS.flatMap(() => [1, 1, 2]), 1],
});

/* delta bars grow from the axis once their card is reached */
const deltaGrow = (on: number): Loop =>
   beat({
      times: [0, on, on + 0.06, HOLD, GONE, 1],
      scaleX: [0, 0, 1, 1, 1, 0],
      opacity: [1, 1, 1, 1, 0, 0],
   });
const GAIN = deltaGrow(PASS_STARTS[0] + 0.24);
const DROP = deltaGrow(PASS_STARTS[1] + 0.24);

const TICKS = [0.04, 0.1].map((on) => beat(shown(on, GONE)));
const PRESS = beat({
   times: [0, 0.15, 0.17, 0.22, 1],
   opacity: [0, 0, 1, 0, 0],
});

const Show = ({
   loop,
   origin = 0,
   children,
}: Readonly<{ loop: Loop; origin?: number; children: ReactNode }>) => (
   <motion.g style={{ originX: origin }} {...loopProps(loop)}>
      {children}
   </motion.g>
);

/* one contest block: checkbox, its question, the rank label and field */
const Contest = ({ top, tick }: Readonly<{ top: number; tick: Loop }>) => (
   <>
      <Panel box={[32, top, 68, 36]} rx={4} />
      <Panel box={[37, top + 5, CHECK, CHECK]} rx={1.5} stroke={W25} />
      <Bar box={[37, top + 16, 34, 2]} fill={W16} />
      <Panel box={[37, top + 21, 58, 10]} rx={2.5} />
      <Bar box={[41, top + 25, 12, 2.5]} fill={W40} />
      <Show loop={tick}>
         <rect
            x={37}
            y={top + 5}
            width={CHECK}
            height={CHECK}
            rx={1.5}
            fill={W70}
         />
         <path
            d={`M38.4,${top + 8} L39.8,${top + 9.5} L41.8,${top + 6.6}`}
            fill="none"
            stroke={INK}
            strokeWidth={1.2}
         />
      </Show>
   </>
);

const Form = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={FORM} rx={7} />
      <Bar box={[32, 22, 30, 2.5]} fill={W25} />
      <Panel box={[32, 27, 68, 9]} rx={3} />
      <Bar box={[36, 30.5, 26, 2]} fill={W40} />
      {CONTEST_TOPS.map((top, i) => (
         <Contest key={top} top={top} tick={TICKS[i]} />
      ))}
      <Panel
         box={[32, 126, 68, 12]}
         rx={4}
         fill={`${tint}33`}
         stroke={`${tint}88`}
      />
      <Show loop={PRESS}>
         <rect
            x={32}
            y={126}
            width={68}
            height={12}
            rx={4}
            fill={`${tint}55`}
         />
      </Show>
   </>
);

const Network = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Wire d={EDGES_D} stroke={W06} />
      <Show loop={SWEEP}>
         <rect
            x={0}
            y={NET_Y - 38}
            width={BAND_W}
            height={76}
            rx={BAND_W / 2}
            fill={`${tint}24`}
         />
      </Show>
      {LAYERS.slice(0, -1).flatMap(({ x, ys }) =>
         ys.map((y) => (
            <circle key={`${x}:${y}`} cx={x} cy={y} r={1.8} fill={W25} />
         )),
      )}
      <circle
         cx={OUT[0]}
         cy={OUT[1]}
         r={3}
         fill={INK}
         stroke={tint}
         vectorEffect={NON_SCALING}
      />
   </>
);

/* one result card: contest title, delta bar on its axis, before/change/after */
const Card = ({
   top,
   tint,
   gain,
}: Readonly<{ top: number; tint: string; gain: boolean }>) => {
   const barY = top + 15;
   return (
      <>
         <Panel box={[CARD_X, top, CARD_W, CARD_H]} rx={6} />
         <Bar box={[CARD_X + 6, top + 7, 30, 2.5]} fill={W25} />
         <rect
            x={CARD_X + 6}
            y={barY}
            width={54}
            height={4}
            rx={2}
            fill={W06}
         />
         {gain ? (
            <Show loop={GAIN}>
               <rect
                  x={AXIS_X}
                  y={barY}
                  width={GAIN_W}
                  height={4}
                  fill={`${tint}cc`}
               />
            </Show>
         ) : (
            <Show loop={DROP} origin={1}>
               <rect
                  x={AXIS_X - DROP_W}
                  y={barY}
                  width={DROP_W}
                  height={4}
                  fill={W40}
               />
            </Show>
         )}
         <Wire d={`M${AXIS_X},${barY - 3} V${barY + 7}`} stroke={W25} />
         {[0, 20, 40].map((dx) => (
            <g key={dx}>
               <Bar box={[CARD_X + 6 + dx, top + 28, 12, 2]} fill={W10} />
               <Bar
                  box={[CARD_X + 6 + dx, top + 33, 14, 3]}
                  fill={dx === 40 ? `${tint}88` : W25}
               />
            </g>
         ))}
      </>
   );
};

const Stage = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      {CONTEST_TOPS.map((top, i) => (
         <g key={top}>
            <Wire d={curveD(feedCurve(top))} />
            <Wire d={curveD(landCurve(CARD_TOPS[i]))} />
         </g>
      ))}
      <Form tint={tint} />
      <Network tint={tint} />
      {CARD_TOPS.map((top, i) => (
         <Card key={top} top={top} tint={tint} gain={i === 0} />
      ))}
   </>
);

const PredictorScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="52% 40%"
      texture={DOTS}
      stage={<Stage tint={tint} />}
   >
      {PASSES.map((loop, i) => (
         <Packet key={CONTEST_TOPS[i]} color={tint} loop={loop} />
      ))}
      <Pip at={OUT} color={tint} size={6} loop={FIRE} />
      <Label at={[47, CONTEST_TOPS[0] + 8]} color={W55}>
         WEEKLY
      </Label>
      <Label at={[47, CONTEST_TOPS[1] + 8]} color={W55}>
         BIWEEKLY
      </Label>
      <Label at={[66, 132]} color={W70} centered>
         PREDICT
      </Label>
      <Label at={[LAYER_X[2], 36]} color={W55} centered>
         DENSE
      </Label>
   </Shell>
);

export default PredictorScene;
