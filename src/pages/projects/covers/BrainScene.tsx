import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Shell,
   Trace,
   Wire,
} from "./kit/primitives";
import {
   INK,
   RAILS,
   W06,
   W10,
   W16,
   W40,
   W55,
   W70,
   clock,
   label,
   line,
   loopProps,
   pctX,
   pctY,
   ride,
   route,
   shown,
} from "./kit/sceneTokens";
import type { Cubic, Loop, Pt, Stop, TintProps } from "./kit/sceneTokens";

/*
 * agent-brain: three agent hosts (Claude Code, Codex, Kiro) share one folder
 * of markdown fact pages. The first host `remember`s a new page; the second
 * `correct`s an old one, which stays on disk struck and marked corrected
 * with a superseded_by arrow to its replacement; the third runs a BM25
 * `recall`, the active pages get ranked score bars (the corrected page gets
 * none) and the top hit rides back. The loop opens on the finished state, so
 * the frozen Reduced frame is the brain after all three writes: it clears,
 * replays, then holds.
 */

const beat = clock(6);
/* written things fade out here at the top of every loop */
const CLEAR = [0.03, 0.07];

const PAGE_W = 54;
const PAGE_H = 36;
const ROW_1 = 80;
const ROW_2 = 124;
const COLS = [31, 99, 167, 235];
const BRAIN_TOP = 60;
const HOST_X = [48, 138, 228];
const HOST_Y = 16;
const HOST_W = 44;
const HOST_H = 24;

const NEW_COL = 0;
const OLD_COL = 1;
const FIX_COL = 2;

const centreOf = (col: number) => COLS[col] + PAGE_W / 2;

/* cubic with vertical tangents, host port down to the brain's top edge */
const vCurve = (a: Pt, b: Pt): Cubic => {
   const k = (b[1] - a[1]) / 2;
   return [a, [a[0], a[1] + k], [b[0], b[1] - k], b];
};

/* host port, into the brain, down to the top of one page slot */
const drop = (host: number, col: number) => {
   const from: Pt = [HOST_X[host] + HOST_W / 2, HOST_Y + HOST_H];
   const edge: Pt = [centreOf(col), BRAIN_TOP];
   return route(vCurve(from, edge), line(edge, [centreOf(col), ROW_1]));
};

const REMEMBER_ROUTE = drop(0, NEW_COL);
const CORRECT_ROUTE = drop(1, OLD_COL);
const RECALL_ROUTE = drop(2, FIX_COL);

const REMEMBER_STOPS: Stop[] = [
   [0.1, 0],
   [0.21, 1],
];
const CORRECT_STOPS: Stop[] = [
   [0.29, 0],
   [0.39, 1],
];
/* query down, a hold on the top hit, then the hit rides home */
const RECALL_STOPS: Stop[] = [
   [0.6, 0],
   [0.69, 1],
   [0.75, 1],
   [0.85, 0],
];

/* shown at rest, gone during CLEAR, back at `at` */
const OUT_IN = [1, 1, 0, 0, 1, 1];
const backAt = (at: number, ramp = 0.04) => [0, ...CLEAR, at, at + ramp, 1];

/* a stroke that is drawn at rest, hidden in CLEAR, redrawn from `at` */
const redraw = (at: number, span: number): Loop =>
   beat({
      times: [0, ...CLEAR, at - 0.01, at, at + span, 1],
      pathLength: [1, 1, 1, 0, 0, 1, 1],
      opacity: [1, 1, 0, 0, 1, 1, 1],
   });

const REMEMBER = beat(ride(REMEMBER_ROUTE, REMEMBER_STOPS));
const CORRECT = beat(ride(CORRECT_ROUTE, CORRECT_STOPS));
const RECALL = beat(ride(RECALL_ROUTE, RECALL_STOPS));

const NEW_PAGE = beat({
   times: backAt(0.21),
   opacity: OUT_IN,
   y: [0, 0, -6, -6, 0, 0],
});
const STRIKE = redraw(0.4, 0.06);
const OLD_DIM = beat({
   times: [0, ...CLEAR, 0.44, 0.48, 1],
   opacity: [0.4, 0.4, 1, 1, 0.4, 0.4],
});
const STAMP = beat({ times: backAt(0.44), opacity: OUT_IN });
const POINTER = redraw(0.47, 0.05);
const FIX_PAGE = beat({
   times: backAt(0.51),
   opacity: OUT_IN,
   y: [0, 0, -6, -6, 0, 0],
});
const RANKED = beat(shown(0.7, 0.93));
const REMEMBER_TAG = beat(shown(0.08, 0.27));
const RECALL_TAG = beat(shown(0.58, 0.88));

/* superseded_by: an arc from the corrected page to its replacement */
const ARC_FROM = centreOf(OLD_COL) + 14;
const ARC_TO = centreOf(FIX_COL) - 14;
const POINTER_D = [
   `M${ARC_FROM},${ROW_1} C${ARC_FROM},69 ${ARC_TO},69 ${ARC_TO},${ROW_1 - 1}`,
   `M${ARC_TO - 3.5},${ROW_1 - 4.5} L${ARC_TO},${ROW_1 - 0.5} L${ARC_TO + 3.5},${ROW_1 - 4.5}`,
].join(" ");
const STRIKE_Y = ROW_1 + 17;
const STRIKE_D = `M${COLS[OLD_COL] + 3},${STRIKE_Y} H${COLS[OLD_COL] + PAGE_W - 3}`;

/* recall score bars under each active hit: [col, length, top hit] */
const SCORES: [number, number, boolean][] = [
   [FIX_COL, 46, true],
   [NEW_COL, 30, false],
   [3, 18, false],
];

interface PageProps {
   x: number;
   y: number;
   tint: string;
   faint?: boolean;
}

/* One fact page: folded corner, title, body, and its source line. */
const Page = ({ x, y, tint, faint }: Readonly<PageProps>) => {
   const ink = faint ? W06 : W16;
   return (
      <>
         <Panel
            box={[x, y, PAGE_W, PAGE_H]}
            rx={4}
            stroke={faint ? W06 : W10}
         />
         <Wire d={`M${x + 46},${y} V${y + 8} H${x + PAGE_W}`} stroke={ink} />
         <Bar box={[x + 6, y + 7, 28, 3]} fill={faint ? W10 : W40} />
         <Bar box={[x + 6, y + 15, 38, 2.5]} fill={ink} />
         <Bar box={[x + 6, y + 21, 30, 2.5]} fill={ink} />
         <circle cx={x + 7.5} cy={y + 29.5} r={1.5} fill={`${tint}66`} />
         <Bar box={[x + 11, y + 28.5, 22, 2]} fill={W10} />
      </>
   );
};

/* Agent host tile: a prompt chevron, a cursor, a name stand-in. */
const Host = ({ x }: Readonly<{ x: number }>) => (
   <>
      <Panel box={[x, HOST_Y, HOST_W, HOST_H]} rx={6} />
      <Wire
         d={`M${x + 8},${HOST_Y + 8.5} L${x + 12},${HOST_Y + 12} L${x + 8},${HOST_Y + 15.5}`}
         stroke={W40}
      />
      <Bar box={[x + 15, HOST_Y + 14.5, 6, 2]} fill={W40} />
      <Bar box={[x + 25, HOST_Y + 10.5, 12, 3]} fill={W16} />
   </>
);

const Reveal = ({
   loop,
   children,
}: Readonly<{ loop: Loop; children: ReactNode }>) => (
   <motion.g {...loopProps(loop)}>{children}</motion.g>
);

const Ranking = ({ tint }: TintProps) => (
   <Reveal loop={RANKED}>
      <Panel
         box={[COLS[FIX_COL], ROW_1, PAGE_W, PAGE_H]}
         rx={4}
         fill={`${tint}14`}
         stroke={tint}
      />
      {SCORES.map(([col, len, top]) => (
         <Bar
            key={col}
            box={[COLS[col], ROW_1 + PAGE_H + 2.5, len, 3]}
            fill={top ? `${tint}cc` : `${tint}55`}
         />
      ))}
   </Reveal>
);

const Brain = ({ tint }: TintProps) => (
   <>
      <Panel box={[26, BRAIN_TOP, 268, 108]} rx={9} />
      {/* empty slots stay outlined while the brain is cleared */}
      {[NEW_COL, FIX_COL].map((col) => (
         <Panel
            key={col}
            box={[COLS[col], ROW_1, PAGE_W, PAGE_H]}
            rx={4}
            fill="none"
            stroke={W06}
         />
      ))}
      <Page x={COLS[3]} y={ROW_1} tint={tint} />
      {COLS.map((x) => (
         <Page key={x} x={x} y={ROW_2} tint={tint} faint />
      ))}
      <Reveal loop={NEW_PAGE}>
         <Page x={COLS[NEW_COL]} y={ROW_1} tint={tint} />
      </Reveal>
      <Reveal loop={OLD_DIM}>
         <Page x={COLS[OLD_COL]} y={ROW_1} tint={tint} />
      </Reveal>
      <Trace d={STRIKE_D} color={W70} width={1.4} loop={STRIKE} />
      <Trace d={POINTER_D} color={`${tint}b3`} width={1.2} loop={POINTER} />
      <Reveal loop={FIX_PAGE}>
         <Page x={COLS[FIX_COL]} y={ROW_1} tint={tint} />
      </Reveal>
      <Ranking tint={tint} />
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      {[REMEMBER_ROUTE, CORRECT_ROUTE, RECALL_ROUTE].map((r) => (
         <Wire key={r.d} d={r.d} />
      ))}
      {HOST_X.map((x) => (
         <Host key={x} x={x} />
      ))}
      <Brain tint={tint} />
   </>
);

/* status: corrected, stamped across the old page's bottom edge */
const stamp = (tint: string): CSSProperties => ({
   ...label,
   left: pctX(centreOf(OLD_COL)),
   top: pctY(ROW_1 + PAGE_H),
   transform: "translate(-50%, -50%)",
   padding: "2px 4px",
   borderRadius: 3,
   border: `1px solid ${tint}66`,
   background: INK,
   color: W70,
});

const BrainScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="50% 50%"
      texture={RAILS}
      stage={<Stage tint={tint} />}
   >
      <Packet color={tint} loop={REMEMBER} />
      <Packet color={tint} loop={CORRECT} />
      <Packet color={tint} loop={RECALL} />
      <Label at={[76, 50]} color={W70} loop={REMEMBER_TAG}>
         REMEMBER
      </Label>
      <Label at={[256, 50]} color={W70} loop={RECALL_TAG}>
         RECALL
      </Label>
      <Label at={[238, 67]} color={W55}>
         INDEX.MD
      </Label>
      <motion.span style={stamp(tint)} {...loopProps(STAMP)}>
         CORRECTED
      </motion.span>
   </Shell>
);

export default BrainScene;
