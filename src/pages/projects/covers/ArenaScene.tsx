import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, Label, Packet, Panel, Pip, Shell, Wire } from "./kit/primitives";
import {
   GREEN,
   GRID,
   W03,
   W06,
   W10,
   W16,
   W25,
   W40,
   W55,
   W70,
   clock,
   curveD,
   layer,
   line,
   loopProps,
   pctY,
   ride,
   route,
   sCurve,
   shown,
} from "./kit/sceneTokens";
import type { Box, Keys, Loop } from "./kit/sceneTokens";

/*
 * Code Arena: the Arena page itself. A top bar with the server-authoritative
 * timer ticking, the problem on the left, the Monaco editor on the right with
 * the test results strip under it, and the Live Status Board beside it.
 * 1. You finish typing a line and hit Submit.
 * 2. match:submit rides to the hosted Judge0 CE API, which runs the Python submission.
 * 3. The result rides back: the test cases light one by one.
 * 4. The status board updates: your row goes AC and overtakes the leader,
 *    while the other players' passed bars keep moving on their own clock.
 * One 6 s loop, 12 animated nodes.
 */

const beat = clock(6);
const HOLD = 0.9;
const GONE = 0.94;

/* arena window: top bar, problem pane, editor, test results */
const WIN: Box = [26, 18, 180, 128];
const WIN_RIGHT = WIN[0] + WIN[2];
const BAR_Y = 32;
const SPLIT_X = 102;
const STRIP_Y = 118;
const CASE_Y = 130;
const CASE_W = 20;
const CASE_STEP = 24;
const CASES = [0, 1, 2, 3].map((i) => 108 + i * CASE_STEP);
const CASES_ID = "arena-cases";

/* right column: the Judge0 runner and the Live Status Board */
const JUDGE: Box = [222, 18, 72, 46];
const PY_CHIP: Box = [229, 38, 28, 16];
const CPP_CHIP: Box = [261, 38, 26, 16];
const BOARD: Box = [222, 76, 72, 70];
const SLOTS = [98, 114, 130];
const SLOT_STEP = SLOTS[1] - SLOTS[0];
const TRACK_X = 257;
const TRACK_W = 20;

/* editor lines: [y, indent x, width, fill]; the tint ones are keywords */
const CODE: [number, number, number, string][] = [
   [52, 114, 34, "k"],
   [60, 120, 46, W25],
   [68, 126, 30, W16],
   [76, 126, 52, W25],
   [84, 120, 26, "k"],
   [92, 126, 40, W16],
];
const TYPED_Y = 100;

/* submit leaves the editor's edge for the Python runtime and back */
const SUBMIT_CURVE = sCurve([WIN_RIGHT, 40], [JUDGE[0], 46]);
const SUBMIT_ROUTE = route(SUBMIT_CURVE, line([JUDGE[0], 46], [243, 46]));
const RESULT_CURVE = sCurve([JUDGE[0], 58], [WIN_RIGHT, 134]);
const RESULT_ROUTE = route(RESULT_CURVE);

/* scaleX fill that grows to `to` between `on` and `off`, then fades */
const grow = (on: number, off: number, to = 1): Loop =>
   beat({
      times: [0, on, off, HOLD, GONE, 1],
      scaleX: [0, 0, to, to, to, 0],
      opacity: [1, 1, 1, 1, 0, 0],
   });

/* your row overtakes the leader after AC, both swap back while cleared */
const SWAP_TIMES = [0, 0.68, 0.74, 0.95, 0.99, 1];
const swap = (dy: number): Keys => ({
   times: SWAP_TIMES,
   y: [0, 0, dy, dy, 0, 0],
});

const TICK: Loop = { duration: 1, times: [0, 0.5, 1], opacity: [1, 0.35, 1] };
const TYPED = grow(0.04, 0.18);
const SUBMIT = beat(
   ride(SUBMIT_ROUTE, [
      [0.22, 0],
      [0.32, 1],
   ]),
);
const RUN = beat(shown(0.32, 0.46));
const RESULT = beat(
   ride(RESULT_ROUTE, [
      [0.46, 0],
      [0.56, 1],
   ]),
);
const PASSED = beat({
   times: [0, 0.56, 0.66, HOLD, GONE, 1],
   scaleX: [0, 0, 1, 1, 1, 0],
   opacity: [1, 1, 1, 1, 0, 0],
   ease: "linear",
});
const LEADER_FILL = grow(0.1, 0.16, 0.75);
const THIRD_FILL = grow(0.36, 0.42, 0.5);
const YOU_FILL = grow(0.58, 0.64);
const YOU_ROW = beat(swap(-SLOT_STEP));
const LEADER_ROW = beat(swap(SLOT_STEP));
/* the AC badge is HTML, so it rides the same swap in stage percent */
const HOME = "0%";
const UP = pctY(-SLOT_STEP);
const AC_ROW = beat({
   times: [0, 0.64, 0.67, 0.68, 0.74, HOLD, GONE, 0.95, 0.99, 1],
   opacity: [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
   y: [HOME, HOME, HOME, HOME, UP, UP, UP, UP, HOME, HOME],
});

const Grow = ({
   loop,
   right,
   children,
}: Readonly<{ loop: Loop; right?: boolean; children: ReactNode }>) => (
   <motion.g style={{ originX: right ? 1 : 0 }} {...loopProps(loop)}>
      {children}
   </motion.g>
);

const TopBar = () => (
   <>
      <Bar box={[32, 23.5, 24, 3]} fill={W40} />
      <Wire d="M60,21 V29" />
      <Bar box={[70, 23.5, 16, 3]} fill={`${GREEN}99`} />
      <Wire d="M92,21 V29" />
      <Bar box={[96, 23.5, 36, 3]} fill={W25} />
      <Bar box={[136, 22, 14, 6]} fill={W10} />
      <Panel box={[184, 21.5, 17, 7]} rx={2} fill={W06} />
      <Wire d={`M${WIN[0]},${BAR_Y} H${WIN_RIGHT}`} />
   </>
);

/* problem statement, an example block, constraints */
const Problem = () => (
   <>
      <Bar box={[32, 39, 40, 4]} fill={W40} />
      <Bar box={[76, 38, 18, 6]} fill={W10} />
      {[62, 54, 58, 40].map((w, i) => (
         <Bar key={`p${w}`} box={[32, 50 + i * 6, w, 2.5]} fill={W10} />
      ))}
      <Panel box={[32, 78, 64, 30]} rx={4} />
      <Bar box={[37, 85, 30, 2.5]} fill={W25} />
      <Bar box={[37, 92, 46, 2.5]} fill={W10} />
      <Bar box={[37, 99, 38, 2.5]} fill={W10} />
      {[56, 48, 60, 30].map((w, i) => (
         <Bar key={`c${w}`} box={[32, 116 + i * 6, w, 2.5]} fill={W10} />
      ))}
      <Wire d={`M${SPLIT_X},${BAR_Y} V${WIN[1] + WIN[3]}`} />
   </>
);

const Editor = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={[108, 36, 20, 7]} rx={2} />
      <Bar box={[111, 38.5, 14, 2]} fill={W25} />
      <Panel
         box={[164, 35, 37, 9]}
         rx={2}
         fill={`${tint}26`}
         stroke={`${tint}88`}
      />
      {[...CODE.map(([y]) => y), TYPED_Y].map((y) => (
         <Bar key={`n${y}`} box={[108, y - 1, 3, 2]} fill={W10} />
      ))}
      {CODE.map(([y, x, w, fill]) => (
         <Bar
            key={`l${y}`}
            box={[x, y - 1.5, w, 3]}
            fill={fill === "k" ? `${tint}88` : fill}
         />
      ))}
      <Grow loop={TYPED}>
         <rect x={126} y={TYPED_Y - 1.5} width={36} height={3} fill={W40} />
      </Grow>
   </>
);

/* test results: four cases, revealed one by one through a clip */
const Results = () => (
   <>
      <Wire d={`M${SPLIT_X},${STRIP_Y} H${WIN_RIGHT}`} />
      <Bar box={[108, 123, 26, 2.5]} fill={W25} />
      <defs>
         <clipPath id={CASES_ID}>
            {CASES.map((x) => (
               <rect
                  key={x}
                  x={x}
                  y={CASE_Y}
                  width={CASE_W}
                  height={8}
                  rx={2}
               />
            ))}
         </clipPath>
      </defs>
      {CASES.map((x) => (
         <Panel key={x} box={[x, CASE_Y, CASE_W, 8]} rx={2} />
      ))}
      <g clipPath={`url(#${CASES_ID})`}>
         <Grow loop={PASSED}>
            <rect
               x={108}
               y={CASE_Y}
               width={92}
               height={8}
               fill={`${GREEN}66`}
            />
         </Grow>
      </g>
   </>
);

const Judge = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={JUDGE} rx={7} />
      <Wire d={`M${JUDGE[0]},31 H${JUDGE[0] + JUDGE[2]}`} />
      <Panel box={PY_CHIP} rx={3} />
      <Panel box={CPP_CHIP} rx={3} />
      {[PY_CHIP, CPP_CHIP].map(([x, y]) => (
         <g key={x}>
            <Bar box={[x + 5, y + 5, 12, 2.5]} fill={W25} />
            <Bar box={[x + 5, y + 10, 16, 2]} fill={W10} />
         </g>
      ))}
      <motion.g {...loopProps(RUN)}>
         <Panel box={PY_CHIP} rx={3} fill={`${tint}26`} stroke={`${tint}cc`} />
      </motion.g>
   </>
);

interface RowProps {
   y: number;
   avatar: string;
   fill: string;
   fillLoop: Loop;
}

/* one player: avatar, handle, test cases passed bar */
const Row = ({ y, avatar, fill, fillLoop }: Readonly<RowProps>) => (
   <>
      <circle cx={231} cy={y} r={2.5} fill={avatar} />
      <Bar box={[237, y - 1.5, 16, 3]} fill={W16} />
      <Bar box={[TRACK_X, y - 1.5, TRACK_W, 3]} fill={W06} />
      <Grow loop={fillLoop}>
         <rect
            x={TRACK_X}
            y={y - 1.5}
            width={TRACK_W}
            height={3}
            rx={1.5}
            fill={fill}
         />
      </Grow>
   </>
);

const Board = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={BOARD} rx={7} />
      <Bar box={[229, 84, 30, 2.5]} fill={W25} />
      <motion.g {...loopProps(LEADER_ROW)}>
         <Row
            y={SLOTS[0]}
            avatar={W25}
            fill={`${tint}88`}
            fillLoop={LEADER_FILL}
         />
      </motion.g>
      <motion.g {...loopProps(YOU_ROW)}>
         <Row y={SLOTS[1]} avatar={tint} fill={GREEN} fillLoop={YOU_FILL} />
      </motion.g>
      <Row y={SLOTS[2]} avatar={W25} fill={`${tint}88`} fillLoop={THIRD_FILL} />
   </>
);

const Stage = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Wire d={curveD(SUBMIT_CURVE)} />
      <Wire d={curveD(RESULT_CURVE)} />
      <Panel box={WIN} rx={7} fill={W03} />
      <TopBar />
      <Problem />
      <Editor tint={tint} />
      <Results />
      <Judge tint={tint} />
      <Board tint={tint} />
   </>
);

const ArenaScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="40% 50%"
      texture={GRID}
      stage={<Stage tint={tint} />}
   >
      <Pip at={[66, 25]} color={GREEN} size={4} loop={TICK} />
      <Packet color={tint} loop={SUBMIT} />
      <Packet color={GREEN} size={4} loop={RESULT} />
      <Label at={[182.5, 39.5]} color={W70} centered>
         SUBMIT
      </Label>
      <Label at={[229, 25]} color={W55}>
         JUDGE0
      </Label>
      <motion.div style={layer} {...loopProps(AC_ROW)}>
         <Label at={[281, SLOTS[1]]} color={GREEN}>
            AC
         </Label>
      </motion.div>
   </Shell>
);

export default ArenaScene;
