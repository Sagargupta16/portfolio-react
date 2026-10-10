import type { CSSProperties } from "react";
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
   COLUMNS,
   GREEN,
   INK,
   NON_SCALING,
   W06,
   W10,
   W16,
   W25,
   W40,
   W70,
   clock,
   comet,
   curveD,
   label,
   layer,
   line,
   lit,
   loopProps,
   pctX,
   pctY,
   ride,
   route,
   sCurve,
   shown,
} from "../kit/sceneTokens";
import type { Stop, TintProps } from "../kit/sceneTokens";

/*
 * AI Git Hooks, in the order git fires them:
 *   pre-commit          the staged diff goes to the model, which answers
 *                       NO_ISSUES, so the commit may proceed
 *   prepare-commit-msg  the model writes a conventional message (feat: ...)
 *   commit-msg          the message passes the convention check and the
 *                       commit lands on the branch
 *   pre-push            the secret scan holds the push, passes, and the
 *                       commit reaches origin
 */

const beat = clock(6);
const HOLD = 0.9;
const GONE = 0.94;

const DIFF_PORT = sCurve([140, 64], [170, 43]);
const COMMIT_X = 224;
const BRANCH_Y = 118;
const GATE_X = 257;
const ORIGIN_X = 286;
const PUSH_FROM = COMMIT_X + 5;
const PUSH_TO = ORIGIN_X - 5;
const PUSH = route(line([PUSH_FROM, BRANCH_Y], [PUSH_TO, BRANCH_Y]));
const AT_GATE = (GATE_X - PUSH_FROM) / (PUSH_TO - PUSH_FROM);
const TO_COMMIT = `M${COMMIT_X},68 V${BRANCH_Y - 5.5}`;

/* the push waits at the pre-push gate while the scan runs */
const PUSH_STOPS: Stop[] = [
   [0.64, 0],
   [0.71, AT_GATE],
   [0.75, AT_GATE],
   [0.8, 1],
];

/* the model reads the staged diff top to bottom */
const REVIEW = beat({
   times: [0, 0.05, 0.07, 0.25, 0.27, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   y: [0, 0, 0, 88, 88, 0],
});
const VERDICT = beat(shown(0.27, GONE));
const HANDOFF = beat(
   lit(
      [
         [0.31, 0],
         [0.38, 1],
      ],
      HOLD,
   ),
);
const TYPE_CHIP = beat(shown(0.38, GONE));
const SUBJECT = beat({
   times: [0, 0.4, 0.52, HOLD, GONE, 1],
   opacity: [0, 1, 1, 1, 0, 0],
   scaleX: [0, 0, 1, 1, 1, 0],
});
const VALID = beat({
   times: [0, 0.53, 0.56, HOLD, GONE, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   scale: [0.4, 0.4, 1, 1, 1, 0.4],
});
const LAND_LINE = beat(
   lit(
      [
         [0.55, 0],
         [0.59, 1],
      ],
      HOLD,
   ),
);
const NEW_COMMIT = beat({
   times: [0, 0.58, 0.6, 0.62, HOLD, GONE, 1],
   opacity: [0, 0, 1, 1, 1, 0, 0],
   scale: [0, 0, 1.35, 1, 1, 0, 0],
});
const SHIP = beat(ride(PUSH, PUSH_STOPS));
const SHIP_TRAIL = beat(comet(PUSH_STOPS, 0.3));
const SCAN_PASS = beat({
   times: [0, 0.715, 0.735, 0.77, 0.8, 1],
   opacity: [0, 0, 1, 1, 0, 0],
});
const ORIGIN = beat({
   times: [0, 0.8, 0.82, 0.84, HOLD, GONE, 1],
   opacity: [0, 0, 1, 1, 1, 0, 0],
   scale: [0.4, 0.4, 1.3, 1, 1, 1, 0.4],
});

type RowKind = "context" | "added" | "removed";

/* staged diff: [row top, kind, bar width] */
const DIFF_ROWS: [number, RowKind, number][] = [
   [50, "context", 64],
   [62, "added", 54],
   [74, "added", 76],
   [86, "removed", 46],
   [98, "context", 58],
   [110, "added", 40],
   [122, "context", 66],
   [134, "added", 48],
];

const DiffRow = ({
   tint,
   top,
   kind,
   width,
}: TintProps & { top: number; kind: RowKind; width: number }) => {
   const cy = top + 2;
   const fills: Record<RowKind, string> = {
      context: W16,
      added: `${tint}80`,
      removed: W10,
   };
   return (
      <>
         {kind === "added" && (
            <Wire d={`M34,${cy} H40 M37,${cy - 3} V${cy + 3}`} stroke={tint} />
         )}
         {kind === "removed" && <Wire d={`M34,${cy} H40`} stroke={W25} />}
         <Bar box={[46, top, width, 4]} fill={fills[kind]} />
      </>
   );
};

const Diff = ({ tint }: TintProps) => (
   <>
      <Panel box={[26, 18, 114, 150]} rx={9} />
      <Wire d="M26,40 H140" />
      {/* hook output: the verdict prints below this rule */}
      <Wire d="M26,144 H140" stroke={W06} />
      {DIFF_ROWS.map(([top, kind, width]) => (
         <DiffRow key={top} tint={tint} top={top} kind={kind} width={width} />
      ))}
      <motion.g {...loopProps(REVIEW)}>
         <rect x={27} y={46} width={112} height={10} fill={`${tint}14`} />
         <Wire d="M27,46 H139" stroke={`${tint}80`} />
      </motion.g>
   </>
);

const Message = ({ tint }: TintProps) => (
   <>
      <Wire d={curveD(DIFF_PORT)} />
      <Trace
         d={curveD(DIFF_PORT)}
         color={`${tint}80`}
         width={1.5}
         loop={HANDOFF}
      />
      <Panel box={[170, 18, 124, 50]} rx={8} />
      {/* empty subject line until prepare-commit-msg fills it */}
      <Bar box={[178, 33.5, 106, 4]} fill={W06} />
      <motion.g style={{ originX: 0 }} {...loopProps(SUBJECT)}>
         <Bar box={[212, 33.5, 70, 4]} fill={W40} />
      </motion.g>
      <Bar box={[178, 48, 84, 3]} fill={W10} />
      <Bar box={[178, 56, 58, 3]} fill={W06} />
   </>
);

/* a commit or remote on the branch line */
const Ring = ({ cx, r, stroke }: { cx: number; r: number; stroke: string }) => (
   <circle
      cx={cx}
      cy={BRANCH_Y}
      r={r}
      fill={INK}
      stroke={stroke}
      vectorEffect={NON_SCALING}
   />
);

const Branch = ({ tint }: TintProps) => (
   <>
      <Wire d={TO_COMMIT} />
      <Trace d={TO_COMMIT} color={`${tint}80`} width={1.5} loop={LAND_LINE} />
      <Wire d={`M160,${BRANCH_Y} H${COMMIT_X}`} stroke={W25} />
      {/* not pushed yet: dashed up to origin */}
      <path
         d={`M${COMMIT_X},${BRANCH_Y} H${ORIGIN_X}`}
         fill="none"
         stroke={W16}
         strokeDasharray="2 3"
         vectorEffect={NON_SCALING}
      />
      <Trace d={PUSH.d} color={`${tint}99`} width={2.6} loop={SHIP_TRAIL} />
      <Ring cx={176} r={4} stroke={W40} />
      <Ring cx={200} r={4} stroke={W40} />
      <motion.circle
         cx={COMMIT_X}
         cy={BRANCH_Y}
         r={4.6}
         fill={tint}
         {...loopProps(NEW_COMMIT)}
      />
      <Panel box={[GATE_X - 4, 106, 8, 24]} rx={4} fill={INK} stroke={W25} />
      <motion.g {...loopProps(SCAN_PASS)}>
         <Panel
            box={[GATE_X - 4, 106, 8, 24]}
            rx={4}
            fill={`${GREEN}1f`}
            stroke={GREEN}
         />
      </motion.g>
      <Ring cx={ORIGIN_X} r={5.2} stroke={`${tint}80`} />
      <motion.circle
         cx={ORIGIN_X}
         cy={BRANCH_Y}
         r={3.2}
         fill={tint}
         {...loopProps(ORIGIN)}
      />
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      <Diff tint={tint} />
      <Message tint={tint} />
      <Branch tint={tint} />
   </>
);

/* conventional type the model chose, as the message's leading chip */
const typeChip = (tint: string): CSSProperties => ({
   ...label,
   left: pctX(193),
   top: pctY(35.5),
   transform: "translate(-50%, -50%)",
   padding: "2px 4px",
   borderRadius: 3,
   border: `1px solid ${tint}80`,
   background: `${tint}1a`,
   color: tint,
});

const GitVariant = ({ tint }: TintProps) => (
   <Shell
      tint={tint}
      focus="70% 56%"
      texture={COLUMNS}
      stage={<Stage tint={tint} />}
   >
      <Packet color={tint} loop={SHIP} />
      <Label at={[37, 29]} color={`${tint}b3`}>
         PRE COMMIT
      </Label>
      <motion.div style={layer} {...loopProps(VERDICT)}>
         <Pip at={[38, 156]} color={GREEN} />
         <Label at={[45, 156]} color={W70}>
            NO_ISSUES
         </Label>
      </motion.div>
      <motion.span style={typeChip(tint)} {...loopProps(TYPE_CHIP)}>
         FEAT
      </motion.span>
      <Pip at={[288, 35.5]} color={GREEN} loop={VALID} />
      <Label at={[GATE_X, 142]} color={`${tint}b3`} centered>
         PRE PUSH
      </Label>
   </Shell>
);

export default GitVariant;
