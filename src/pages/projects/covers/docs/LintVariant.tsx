import { motion } from "motion/react";
import {
   AMBER,
   EASE,
   FILL,
   LINEAR,
   W10,
   W18,
   W30,
   W50,
   W80,
   cubicD,
   hair,
   loop,
   pin,
   px,
   sCurve,
   windowKeys,
   windowTimes,
   type Leg,
} from "./kit";
import {
   Bar,
   Dot,
   Label,
   Packet,
   Panel,
   Pop,
   SceneRoot,
   Text,
   Wires,
} from "./primitives";

/*
 * skillcheck: `skillcheck lint` opens a SKILL.md and a rule head sweeps its
 * YAML frontmatter. The `name` row fails SC013 (name-invalid-chars, an ERR
 * square), the `model` row warns SC301 (a Claude Code extension field, an
 * amber ring). Each finding flies to the report and its line lights up, then
 * the run writes its SARIF report for code scanning. Between runs the report
 * keeps a ghost of the last result, so the resting frame reads complete.
 *
 * Animated nodes (8): scan head, ERR mark, WARN mark, two packets, two report
 * lines, SARIF chip.
 */

const CYCLE = 5.2;
const HOLD = 0.86;
const GHOST = 0.3;

/* SKILL.md card, left. */
const DOC = { x: 13, y: 9, w: 60, h: 76 };
const DOC_RIGHT = DOC.x + DOC.w;
const HEADER_Y = 20;
const KEY_X = 19;
const FENCE_TOP = 27;
const FENCE_BOTTOM = 61;
const MARK_X = 67;
const MARK = 7;

interface Field {
   y: number;
   key: number;
   value: number;
}

/* name / description / model, as key and value bars. */
const FIELDS: Field[] = [
   { y: 35, key: 10, value: 24 },
   { y: 44, key: 17, value: 26 },
   { y: 53, key: 11, value: 14 },
];
const NAME_ROW = FIELDS[0];
const MODEL_ROW = FIELDS[2];
const BODY = [
   { y: 68, w: 40 },
   { y: 74, w: 46 },
   { y: 80, w: 30 },
];

/* The rule head sweeps the frontmatter linearly from fence to fence, so a
   row's mark fires exactly when the head crosses it. */
const SWEEP = { from: 0.1, to: 0.5 };
const crossing = (y: number) =>
   SWEEP.from +
   ((SWEEP.to - SWEEP.from) * (y - FENCE_TOP)) / (FENCE_BOTTOM - FENCE_TOP);
const SCAN_TIMES = [0, 0.06, SWEEP.from, SWEEP.to, SWEEP.to + 0.06, 1];
const SCAN_EASE = [EASE, EASE, LINEAR, EASE, EASE];
const SCAN_SPAN = `${FENCE_BOTTOM - FENCE_TOP}%`;

/* Report panel, right, and where each finding lands. */
const REPORT = { x: 83, y: 9, w: 64, h: 54 };
const REPORT_RIGHT = REPORT.x + REPORT.w;
const REPORT_BOTTOM = REPORT.y + REPORT.h;
const ROW_X = 88;
const ERR_LINE_Y = 30;
const WARN_LINE_Y = 40;
const SUMMARY_Y = 53;
const SARIF_X = 95;
const SARIF_Y = 71;
const ERR_AT = crossing(NAME_ROW.y);
const WARN_AT = crossing(MODEL_ROW.y);
const ERR_LEG: Leg = {
   curve: sCurve(
      { x: MARK_X + 4, y: NAME_ROW.y },
      { x: REPORT.x, y: ERR_LINE_Y },
   ),
   from: ERR_AT + 0.01,
   to: ERR_AT + 0.16,
};
const WARN_LEG: Leg = {
   curve: sCurve(
      { x: MARK_X + 4, y: MODEL_ROW.y },
      { x: REPORT.x, y: WARN_LINE_Y },
   ),
   from: WARN_AT + 0.01,
   to: WARN_AT + 0.16,
};
const SARIF_AT = WARN_LEG.to + 0.08;

const ERR_SQUARE = {
   width: MARK,
   height: MARK,
   borderRadius: 1.5,
   background: W80,
   flex: "none",
} as const;
const WARN_RING = {
   width: MARK,
   height: MARK,
   borderRadius: "50%",
   border: `2px solid ${AMBER}`,
   boxSizing: "border-box",
   flex: "none",
} as const;
/* The finding's message text, filling the rest of the report line. */
const MESSAGE = {
   flex: 1,
   minWidth: 0,
   height: 3,
   borderRadius: 1.5,
   background: W18,
} as const;

/* `---` fence: three short dashes. */
const Fence = ({ y }: { y: number }) => (
   <>
      {[0, 4.5, 9].map((dx) => (
         <Bar key={dx} x={KEY_X + dx} y={y} w={3} color={W30} />
      ))}
   </>
);

const SkillCard = ({ tint }: { tint: string }) => (
   <>
      <Panel x={DOC.x} y={DOC.y} w={DOC.w} h={DOC.h} edge={`${tint}40`} />
      <Label x={KEY_X} y={14.5} text="SKILL.MD" color={`${tint}e6`} />
      <Dot x={DOC_RIGHT - 6} y={14.5} color={W18} size={4} />
      <Fence y={FENCE_TOP} />
      {FIELDS.map((f) => (
         <span key={f.y}>
            <Bar x={KEY_X} y={f.y} w={f.key} color={`${tint}88`} />
            <Bar x={KEY_X + f.key + 3} y={f.y} w={f.value} color={W30} />
         </span>
      ))}
      <Fence y={FENCE_BOTTOM} />
      {BODY.map((b) => (
         <Bar key={b.y} x={KEY_X} y={b.y} w={b.w} color={W10} />
      ))}
   </>
);

/* Rule head: a slot-sized box translated down by the fence span. */
const ScanHead = ({ tint }: { tint: string }) => (
   <motion.div
      initial={{ opacity: 0 }}
      animate={{
         y: ["0%", "0%", "0%", SCAN_SPAN, SCAN_SPAN, "0%"],
         opacity: [0, 0, 1, 1, 0, 0],
      }}
      transition={{
         duration: CYCLE,
         repeat: Infinity,
         times: SCAN_TIMES,
         ease: SCAN_EASE,
      }}
      style={FILL}
   >
      <span
         style={{
            ...pin(DOC.x + 1, FENCE_TOP),
            width: px(DOC.w - 2),
            height: 1.5,
            marginTop: -0.75,
            background: `${tint}cc`,
         }}
      />
   </motion.div>
);

interface FindingProps {
   y: number;
   code: string;
   warn?: boolean;
   at: number;
}

/* One report line: a ghost of the last run that lights as its packet lands. */
const Finding = ({ y, code, warn = false, at }: FindingProps) => (
   <motion.div
      initial={{ opacity: GHOST, x: -3 }}
      animate={{ opacity: windowKeys(GHOST, 1), x: windowKeys(-3, 0) }}
      transition={loop(CYCLE, windowTimes(at, HOLD))}
      style={{
         ...pin(ROW_X, y),
         width: px(REPORT_RIGHT - ROW_X - 6),
         height: 10,
         marginTop: -5,
         display: "flex",
         alignItems: "center",
         gap: 6,
      }}
   >
      <span style={warn ? WARN_RING : ERR_SQUARE} />
      <Text text={code} color={warn ? AMBER : W80} />
      <span style={MESSAGE} />
   </motion.div>
);

const Report = ({ tint }: { tint: string }) => (
   <>
      <Panel x={REPORT.x} y={REPORT.y} w={REPORT.w} h={REPORT.h} />
      <Wires>
         <path
            d={`M ${ROW_X - 1} 12.5 L ${ROW_X + 1.5} 14.5 L ${ROW_X - 1} 16.5`}
            {...hair(W50)}
         />
         <path
            d={`M ${REPORT.x} ${HEADER_Y} H ${REPORT_RIGHT}`}
            {...hair(W10)}
         />
         <path d={`M ${REPORT.x} 46 H ${REPORT_RIGHT}`} {...hair(W10)} />
         <path d={cubicD(ERR_LEG.curve)} {...hair(W10)} />
         <path d={cubicD(WARN_LEG.curve)} {...hair(W10)} />
         <path
            d={`M ${SARIF_X} ${REPORT_BOTTOM} V ${SARIF_Y}`}
            {...hair(W10)}
         />
      </Wires>
      <Bar x={ROW_X + 4} y={14.5} w={28} color={`${tint}88`} />
      <Finding y={ERR_LINE_Y} code="SC013" at={ERR_LEG.to} />
      <Finding y={WARN_LINE_Y} code="SC301" warn at={WARN_LEG.to} />
      <Dot x={ROW_X + 2} y={SUMMARY_Y} color={W30} size={4} />
      <Bar x={ROW_X + 6} y={SUMMARY_Y} w={22} color={W18} />
      <Bar x={ROW_X + 31} y={SUMMARY_Y} w={18} color={W10} />
   </>
);

/* SARIF 2.1.0 report written beside the console output. */
const SarifChip = ({ tint }: { tint: string }) => (
   <motion.div
      initial={{ opacity: GHOST + 0.05, y: -3 }}
      animate={{ opacity: windowKeys(GHOST + 0.05, 1), y: windowKeys(-3, 0) }}
      transition={loop(CYCLE, windowTimes(SARIF_AT, HOLD))}
      style={{
         ...pin(ROW_X, SARIF_Y),
         height: 18,
         padding: "0 9px",
         display: "flex",
         alignItems: "center",
         gap: 7,
         borderRadius: 8,
         border: `1px solid ${tint}66`,
         background: `${tint}12`,
      }}
   >
      <span
         style={{
            width: 8,
            height: 10,
            borderRadius: 1.5,
            border: `1px solid ${tint}cc`,
            flex: "none",
         }}
      />
      <Text text="SARIF" color={`${tint}e6`} />
   </motion.div>
);

const LintVariant = ({ tint }: { tint: string }) => (
   <SceneRoot tint={tint} focus="72% 32%" lattice="rules">
      <SkillCard tint={tint} />
      <Wires>
         <path
            d={`M ${DOC.x} ${HEADER_Y} H ${DOC_RIGHT}`}
            {...hair(`${tint}30`)}
         />
      </Wires>
      <ScanHead tint={tint} />
      <Pop
         x={MARK_X}
         y={NAME_ROW.y}
         cycle={CYCLE}
         on={ERR_AT}
         off={HOLD}
         size={MARK}
         style={ERR_SQUARE}
      />
      <Pop
         x={MARK_X}
         y={MODEL_ROW.y}
         cycle={CYCLE}
         on={WARN_AT}
         off={HOLD}
         size={MARK}
         style={WARN_RING}
      />
      <Report tint={tint} />
      <Packet tint={tint} legs={[ERR_LEG]} cycle={CYCLE} />
      <Packet tint={tint} legs={[WARN_LEG]} cycle={CYCLE} />
      <SarifChip tint={tint} />
   </SceneRoot>
);

export default LintVariant;
