import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { MONO_FONT, GREEN, AMBER } from "@/constants/theme";

interface NeuralNetAnimProps {
   color: string;
}

/*
 * SageMaker MLOps loop at icon size, read clockwise: three architectures
 * train in parallel (top-left stack) -> the ensemble rides the rail into the
 * clinical quality gate and fills its bar past the threshold tick -> it lands
 * in the live endpoint and the LED goes green -> a captured prediction drops
 * to Model Monitor -> the live score curve slides off its baseline -> the
 * drift alarm flashes and a retrain edge draws back up to the trainers. One
 * 5 s loop, 8 animated nodes, transform and opacity only.
 */

const CYCLE = 5;

const HAIRLINE = "rgba(255,255,255,0.10)";
const PANEL_BORDER = "1px solid rgba(255,255,255,0.14)";
const PANEL_FILL = "rgba(255,255,255,0.04)";
const GHOST = "rgba(255,255,255,0.22)";
const TICK = "rgba(255,255,255,0.45)";
const LABEL_COLOR = "rgba(255,255,255,0.5)";

/*
 * Stage anchors in the 80 x 80 canvas. The composition spans y 13..65 so it
 * stays inside the band the phone strip shows (about y 12..68 once the 100 px
 * strip clips the 144 px scaled canvas).
 */
const Y_RAIL = 22;
const STACK = { x: 6, y: 13, w: 20, h: 21 };
const STACK_ROWS = [0, 8, 16];
const CHIP_H = 5;
const STACK_RIGHT = STACK.x + STACK.w;
const X_MOVER = 28;
const GATE = { x: 34, y: 13, w: 24, h: 20 };
const PILL = { x: 60, y: 17, w: 16, h: 10 };
const MONITOR = { x: 40, y: 49, w: 24, h: 12 };
const DRIFT = { x: 14, y: 53, w: 20, h: 12 };
const DRIFT_DOT = { x: 28, y: 55 };
const DROP_END = { x: 52, y: 55 };

const label: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 6,
   fontWeight: 700,
   lineHeight: 1,
   letterSpacing: "0.1em",
   textTransform: "uppercase",
   textAlign: "center",
   whiteSpace: "nowrap",
   color: LABEL_COLOR,
};

/* px rect; border-box so bordered panels keep their storyboard footprint. */
const rect = (left: number, top: number, w: number, h: number) => ({
   position: "absolute" as const,
   boxSizing: "border-box" as const,
   left,
   top,
   width: w,
   height: h,
});

/* px dot centred on (cx, cy). */
const dot = (cx: number, cy: number, size: number, background: string) => ({
   ...rect(cx - size / 2, cy - size / 2, size, size),
   borderRadius: "50%",
   background,
});

/* Label spanning the width of its box, offset from the top edge. */
const caption = (width: number, top: number) => ({
   ...label,
   ...rect(0, top, width, 6),
});

const panel: CSSProperties = {
   border: PANEL_BORDER,
   background: PANEL_FILL,
};

const tinted = (color: string): CSSProperties => ({
   borderRadius: 2,
   border: `1px solid ${color}55`,
   background: `${color}0f`,
});

/*
 * One easing per segment, not one string: Motion hands a single string to
 * WAAPI as the whole-iteration easing, which warps every `times` offset for
 * accelerated values (opacity) while transforms and pathLength stay on the
 * per-segment JS clock. An array keeps both clocks aligned.
 */
const loop = (times: number[]) => ({
   duration: CYCLE,
   repeat: Infinity,
   times,
   ease: times.slice(1).map(() => "easeInOut" as const),
});

/* Hold-then-move keyframes: every stop is entered twice so it holds. */
const held = (...stops: number[]) => stops.flatMap((s) => [s, s]);

/* A 3 px dot travelling between stages; x/y keyframes are px offsets. */
interface MoverProps {
   left: number;
   top: number;
   color: string;
   move: { x: number[]; y?: number[]; times: number[] };
   fade: { opacity: number[]; times: number[] };
}

const Mover = ({ left, top, color, move, fade }: MoverProps) => (
   <motion.div
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
         x: move.x,
         y: move.y ?? move.x.map(() => 0),
         opacity: fade.opacity,
      }}
      transition={{
         x: loop(move.times),
         y: loop(move.times),
         opacity: loop(fade.times),
      }}
      style={dot(left, top, 3, color)}
   />
);

/* Beat 1: the three architectures light up as training starts. */
const STACK_TIMES = [0, 0.07, 0.15, 0.96, 1];
const STACK_OPACITY = [0.4, 1, 0.6, 0.6, 0.4];

const TrainerStack = ({ color }: { color: string }) => (
   <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ opacity: STACK_OPACITY }}
      transition={loop(STACK_TIMES)}
      style={rect(STACK.x, STACK.y, STACK.w, STACK.h)}
   >
      {STACK_ROWS.map((y) => (
         <div
            key={y}
            style={{ ...rect(0, y, STACK.w, CHIP_H), ...tinted(color) }}
         />
      ))}
   </motion.div>
);

/* Beats 1 to 3: the ensemble leaves the stack, clears the gate, lands live. */
const ENSEMBLE_MOVE = {
   x: held(0, GATE.x + GATE.w / 2 - X_MOVER, PILL.x + PILL.w / 2 - X_MOVER),
   times: [0, 0.15, 0.28, 0.4, 0.52, 1],
};
const ENSEMBLE_FADE = {
   opacity: held(0, 1, 0),
   times: [0, 0.04, 0.09, 0.52, 0.56, 1],
};

/* Beat 2: the quality bar fills once the ensemble is inside the gate. */
const BAR_TIMES = [0, 0.28, 0.4, 0.95, 0.96, 0.99, 1];
const BAR_SCALE = [0, 0, 1, 1, 1, 0, 0];
const BAR_OPACITY = [1, 1, 1, 1, 0, 0, 1];

const Gate = ({ color }: { color: string }) => (
   <div style={{ ...rect(GATE.x, GATE.y, GATE.w, GATE.h), ...tinted(color) }}>
      <span style={caption(GATE.w - 2, 2)}>GATE</span>
      {/* every ensemble metric has to clear the tick before registration */}
      <div
         style={{
            ...rect(3, 12, 16, 3),
            borderRadius: 1.5,
            background: HAIRLINE,
         }}
      >
         <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: BAR_SCALE, opacity: BAR_OPACITY }}
            transition={loop(BAR_TIMES)}
            style={{
               position: "absolute",
               inset: 0,
               borderRadius: 1.5,
               background: color,
               transformOrigin: "left center",
            }}
         />
         <div style={{ ...rect(11, -1, 1, 5), background: TICK }} />
      </div>
   </div>
);

/* Beat 3: the LED goes live when the approved model reaches the endpoint. */
const LED_TIMES = [0, 0.52, 0.56, 0.95, 0.98, 1];
const LED_OPACITY = held(0, 1, 0);
const LED = { x: 4, y: 4 };

const Endpoint = () => (
   <div
      style={{
         ...rect(PILL.x, PILL.y, PILL.w, PILL.h),
         ...panel,
         borderRadius: PILL.h / 2,
      }}
   >
      <div style={dot(LED.x, LED.y, 3, GHOST)} />
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: LED_OPACITY }}
         transition={loop(LED_TIMES)}
         style={dot(LED.x, LED.y, 3, GREEN)}
      />
      <div style={{ ...rect(7, 3.5, 5, 1), background: GHOST }} />
   </div>
);

/* Beat 3: a captured prediction drops from the endpoint to Model Monitor. */
const CAPTURE_MOVE = {
   x: held(0, DROP_END.x - (PILL.x + PILL.w / 2)),
   y: held(0, DROP_END.y - (PILL.y + PILL.h)),
   times: [0, 0.56, 0.64, 1],
};
const CAPTURE_FADE = {
   opacity: held(0, 1, 0),
   times: [0, 0.55, 0.57, 0.63, 0.66, 1],
};

/* Beat 4: the live score distribution slides off its baseline. */
const CURVE = "M 0 11.5 C 6 11.5 8.5 0.5 12 0.5 C 15.5 0.5 18 11.5 24 11.5";
const CURVE_TIMES = [0, 0.66, 0.8, 0.95, 1];
const CURVE_X = [0, 0, 6, 6, 0];

const Monitor = ({ color }: { color: string }) => (
   <svg
      viewBox={`0 0 ${MONITOR.w} ${MONITOR.h}`}
      style={{
         ...rect(MONITOR.x, MONITOR.y, MONITOR.w, MONITOR.h),
         overflow: "visible",
      }}
   >
      <path d={CURVE} fill="none" stroke={GHOST} />
      <motion.path
         d={CURVE}
         fill="none"
         stroke={color}
         strokeWidth={1.2}
         initial={{ x: 0 }}
         animate={{ x: CURVE_X }}
         transition={loop(CURVE_TIMES)}
      />
   </svg>
);

/* Beat 5: the CloudWatch drift alarm flashes twice. */
const DRIFT_TIMES = [0, 0.82, 0.845, 0.87, 0.895, 0.93, 1];
const DRIFT_OPACITY = [0, 0, 1, 0.3, 1, 0, 0];

const DriftAlarm = () => (
   <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: DRIFT_OPACITY }}
      transition={loop(DRIFT_TIMES)}
      style={rect(DRIFT.x, DRIFT.y, DRIFT.w, DRIFT.h)}
   >
      <div
         style={dot(DRIFT_DOT.x - DRIFT.x, DRIFT_DOT.y - DRIFT.y, 4, AMBER)}
      />
      <span style={caption(DRIFT.w, 6)}>DRIFT</span>
   </motion.div>
);

/* Beat 5: the retrain edge draws from the alarm back up to the trainers. */
const ARC_PATH = "M 28 55 L 13 55 Q 10 55 10 52 L 10 37 L 16 34";
const ARC_TIMES = [0, 0.84, 0.94, 0.98, 1];
const ARC_LENGTH = [0, 0, 1, 1, 0];
const ARC_FADE_TIMES = [0, 0.84, 0.85, 0.95, 0.98, 1];
const ARC_OPACITY = held(0, 1, 0);

const RetrainArc = ({ color }: { color: string }) => (
   <svg
      viewBox="0 0 80 80"
      style={{ ...rect(0, 0, 80, 80), overflow: "visible" }}
   >
      <path
         d={ARC_PATH}
         fill="none"
         stroke={`${color}40`}
         strokeDasharray="2 2"
      />
      <motion.path
         d={ARC_PATH}
         fill="none"
         stroke={color}
         strokeWidth={1.2}
         initial={{ pathLength: 0, opacity: 0 }}
         animate={{ pathLength: ARC_LENGTH, opacity: ARC_OPACITY }}
         transition={{
            pathLength: loop(ARC_TIMES),
            opacity: loop(ARC_FADE_TIMES),
         }}
      />
   </svg>
);

const NeuralNetAnim = ({ color }: NeuralNetAnimProps) => (
   <div style={{ width: 80, height: 80, position: "relative" }}>
      {/* rail from the trainer stack to the endpoint */}
      <div
         style={{
            ...rect(STACK_RIGHT, Y_RAIL, PILL.x - STACK_RIGHT, 1),
            background: HAIRLINE,
         }}
      />
      <RetrainArc color={color} />
      <TrainerStack color={color} />
      <Gate color={color} />
      <Endpoint />
      <Mover
         left={X_MOVER}
         top={Y_RAIL}
         color={color}
         move={ENSEMBLE_MOVE}
         fade={ENSEMBLE_FADE}
      />
      <Mover
         left={PILL.x + PILL.w / 2}
         top={PILL.y + PILL.h}
         color={color}
         move={CAPTURE_MOVE}
         fade={CAPTURE_FADE}
      />
      <Monitor color={color} />
      <DriftAlarm />
   </div>
);

export default NeuralNetAnim;
