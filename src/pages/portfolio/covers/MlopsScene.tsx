import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
}

/*
 * SageMaker MLOps circuit, read left to right along the top and back along
 * the bottom: an S3 object lands -> three architectures train in parallel ->
 * their outputs converge into one ensemble -> the Clinical Quality Gate fills
 * its bar -> the ensemble registers as pending and a reviewer approves it ->
 * the approved version drops into the live endpoint -> Model Monitor compares
 * the prediction curve against its baseline -> the curve drifts, the alarm
 * flashes, and a retrain edge draws back to S3 exactly as the next batch
 * leaves it. One 6 s loop, 12 animated nodes, transform and opacity only.
 */

const CYCLE = 6;

const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const BASE_DARK = "#0b1012";
const HAIRLINE = "rgba(255,255,255,0.08)";
const PANEL_BORDER = "1px solid rgba(255,255,255,0.12)";
const PANEL_FILL = "rgba(255,255,255,0.03)";
const GLYPH = "rgba(255,255,255,0.35)";
const LABEL_COLOR = "rgba(255,255,255,0.45)";
const LABEL_DIM = "rgba(255,255,255,0.25)";
const LABEL_LIT = "rgba(255,255,255,0.9)";
const APPROVED = "APPROVED";

/* Stage anchors as percentages of the scene. */
const X_S3 = 8;
const X_TRAIN = 26;
const X_ENSEMBLE = 46;
const X_GATE = 64;
const X_REGISTRY = 80;
const X_MONITOR = 56;
const X_DRIFT = 40;
const Y_PIPELINE = 32;
const Y_SERVE = 72;
const TRAIN_ROWS = [18, 32, 46];

const label: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   lineHeight: 1,
   letterSpacing: "0.12em",
   textTransform: "uppercase",
   textAlign: "center",
   whiteSpace: "nowrap",
   color: LABEL_COLOR,
};

/* px box centred on a percent anchor, so shapes keep px sizes at any width. */
const box = (x: number, y: number, w: number, h: number, dy = 0) => ({
   position: "absolute" as const,
   left: `calc(${x}% - ${w / 2}px)`,
   top: `calc(${y}% - ${h / 2 - dy}px)`,
   width: w,
   height: h,
});

/* px rect inside a box. */
const rect = (left: number, top: number, w: number, h: number) => ({
   position: "absolute" as const,
   left,
   top,
   width: w,
   height: h,
});

const dot = (left: number, top: number, size: number, background: string) => ({
   ...rect(left, top, size, size),
   borderRadius: "50%",
   background,
});

/* Label spanning the top edge of its box. */
const caption = (width: number, color = LABEL_COLOR) => ({
   ...label,
   ...rect(0, 0, width, 7),
   color,
});

const panel: CSSProperties = {
   borderRadius: 3,
   border: PANEL_BORDER,
   background: PANEL_FILL,
};

const tinted = (tint: string): CSSProperties => ({
   borderRadius: 4,
   border: `1px solid ${tint}4d`,
   background: `${tint}0f`,
});

const line = { fill: "none", vectorEffect: "non-scaling-stroke" as const };

const loop = (times: number[], delay = 0) => ({
   duration: CYCLE,
   repeat: Infinity,
   delay,
   times,
   ease: "easeInOut" as const,
});

/* Hold-then-move keyframes: every stop is entered twice so it holds. */
const held = (...stops: number[]) => stops.flatMap((s) => [s, s]);

/* Hairline rail between two stages. */
const Rail = ({ from, to, top }: { from: number; to: number; top: number }) => (
   <div
      style={{
         position: "absolute",
         left: `${from}%`,
         width: `${to - from}%`,
         top: `${top}%`,
         height: 1,
         background: HAIRLINE,
      }}
   />
);

/*
 * A 4 px dot travelling between stages. The wrapper is a 1% x 1% anchor, so
 * x/y keyframes written in scene percent become percent-of-self transforms
 * and nothing animates left/top.
 */
const pct = (v: number) => `${v * 100}%`;

interface MoverProps {
   left: number;
   top: number;
   color: string;
   move: { x: number[]; y?: number[]; times: number[] };
   fade: { opacity: number[]; times: number[] };
   delay?: number;
}

const Mover = ({ left, top, color, move, fade, delay = 0 }: MoverProps) => (
   <motion.div
      initial={{ x: "0%", y: "0%", opacity: 0 }}
      animate={{
         x: move.x.map(pct),
         y: (move.y ?? move.x.map(() => 0)).map(pct),
         opacity: fade.opacity,
      }}
      transition={{
         x: loop(move.times, delay),
         y: loop(move.times, delay),
         opacity: loop(fade.times, delay),
      }}
      style={{
         position: "absolute",
         left: `${left}%`,
         top: `${top}%`,
         width: "1%",
         height: "1%",
      }}
   >
      <div style={dot(-2, -2, 4, color)} />
   </motion.div>
);

/* Beats 1 and 2: S3 -> trainer chip -> ensemble, one dot per architecture. */
const INGEST_MOVE = {
   x: held(0, X_TRAIN - X_S3, X_ENSEMBLE - X_S3),
   times: [0, 0.02, 0.16, 0.22, 0.31, 1],
};
const INGEST_FADE = {
   opacity: held(0, 1, 0),
   times: [0, 0.03, 0.06, 0.32, 0.35, 1],
};
const INGEST_STAGGER = 0.12;

/* Beats 3 and 4: ensemble -> gate -> registry, one continuous dot. */
const THROUGH_MOVE = {
   x: held(0, X_GATE - X_ENSEMBLE, X_REGISTRY - X_ENSEMBLE),
   times: [0, 0.36, 0.44, 0.54, 0.6, 1],
};
const THROUGH_FADE = {
   opacity: held(0, 1, 0, 1, 0),
   times: [0, 0.36, 0.38, 0.42, 0.44, 0.54, 0.56, 0.58, 0.6, 1],
};

/* Beat 4: the approved version drops into the endpoint. */
const DEPLOY_MOVE = {
   x: held(0, 0),
   y: held(0, Y_SERVE - Y_PIPELINE),
   times: [0, 0.68, 0.75, 1],
};
const DEPLOY_FADE = {
   opacity: held(0, 1, 0),
   times: [0, 0.68, 0.7, 0.74, 0.76, 1],
};

/* Beat 5: a captured prediction leaves the endpoint for Model Monitor. */
const PREDICT_MOVE = {
   x: held(0, X_MONITOR - X_REGISTRY),
   times: [0, 0.76, 0.84, 1],
};
const PREDICT_FADE = {
   opacity: held(0, 1, 0),
   times: [0, 0.76, 0.78, 0.81, 0.83, 1],
};

/* Fan-out from S3 to the trainers, fan-in from the trainers to the ensemble. */
const FAN_PATHS = TRAIN_ROWS.flatMap((row) => [
   `M ${X_S3} ${Y_PIPELINE} L ${X_TRAIN} ${row}`,
   `M ${X_TRAIN} ${row} L ${X_ENSEMBLE} ${Y_PIPELINE}`,
]);

/*
 * Beat 6: drift alarm -> StartPipelineExecution, back at the S3 tile. The
 * arc stops at the tile's bottom edge: half its 18 px height as a percent of
 * the 212.5 px desktop slot. On phones the overrun hides under the tile.
 */
const S3_EDGE = 4.2;
const ARC_PATH = `M ${X_DRIFT} ${Y_SERVE} L ${X_S3 + 6} ${Y_SERVE} Q ${X_S3} ${Y_SERVE} ${X_S3} ${Y_SERVE - 6} L ${X_S3} ${Y_PIPELINE + S3_EDGE}`;
const RETRAIN_TIMES = [0, 0.02, 0.12, 0.13, 0.86, 0.87, 1];
const RETRAIN_LENGTH = [1, 1, 1, 0, 0, 0, 1];
const RETRAIN_OPACITY = [1, 1, 0, 0, 0, 1, 1];

const Wiring = ({ tint }: { tint: string }) => (
   <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
   >
      {FAN_PATHS.map((d) => (
         <path key={d} d={d} {...line} stroke={HAIRLINE} />
      ))}
      <path d={ARC_PATH} {...line} stroke={`${tint}40`} strokeDasharray="2 2" />
      <motion.path
         d={ARC_PATH}
         {...line}
         stroke={tint}
         strokeWidth={1.5}
         strokeLinecap="round"
         initial={{ pathLength: 1, opacity: 1 }}
         animate={{ pathLength: RETRAIN_LENGTH, opacity: RETRAIN_OPACITY }}
         transition={loop(RETRAIN_TIMES)}
      />
   </svg>
);

const Ingest = ({ tint }: { tint: string }) => (
   <>
      {/* S3 bucket: the .batch_complete object that starts the pipeline;
          opaque so the wiring underneath ends at its edges */}
      <div
         style={{
            ...box(X_S3, Y_PIPELINE, 24, 18),
            borderRadius: 4,
            border: `1px solid ${tint}55`,
            background: `linear-gradient(${tint}14, ${tint}14), ${BASE_DARK}`,
         }}
      >
         <div style={{ ...rect(3, 4, 18, 1), background: `${tint}66` }} />
      </div>
      {/* three architectures training in parallel */}
      {TRAIN_ROWS.map((row) => (
         <div
            key={row}
            style={{
               ...box(X_TRAIN, row, 30, 12),
               ...tinted(tint),
               borderRadius: 3,
            }}
         />
      ))}
      {TRAIN_ROWS.map((row, i) => (
         <Mover
            key={row}
            left={X_S3}
            top={Y_PIPELINE}
            color={tint}
            move={{ ...INGEST_MOVE, y: held(0, row - Y_PIPELINE, 0) }}
            fade={INGEST_FADE}
            delay={i * INGEST_STAGGER}
         />
      ))}
   </>
);

const ENSEMBLE_TIMES = [0, 0.32, 0.35, 0.38, 1];
const ENSEMBLE_SCALE = [1, 1, 1.3, 1, 1];

const Ensemble = ({ tint }: { tint: string }) => (
   <>
      {/* CreateEnsembleModel: three outputs become one weighted model */}
      <motion.div
         animate={{ scale: ENSEMBLE_SCALE }}
         transition={loop(ENSEMBLE_TIMES)}
         style={{
            ...box(X_ENSEMBLE, Y_PIPELINE, 10, 10),
            borderRadius: "50%",
            background: tint,
         }}
      />
      {/* untracked and lowered so it clears the gate and the third chip on phones */}
      <span
         style={{
            ...label,
            letterSpacing: 0,
            ...box(X_ENSEMBLE, Y_PIPELINE, 48, 7, 15),
         }}
      >
         ENSEMBLE
      </span>
   </>
);

const GAUGE_TIMES = [0, 0.44, 0.54, 0.88, 0.9, 0.91, 1];
const GAUGE_SCALE = [0, 0, 1, 1, 1, 0, 0];
const GAUGE_OPACITY = [1, 1, 1, 1, 0, 0, 1];

const Gate = ({ tint }: { tint: string }) => (
   <div style={{ ...box(X_GATE, Y_PIPELINE, 28, 22), ...tinted(tint) }}>
      <span style={{ ...caption(26), top: 4 }}>GATE</span>
      {/* the bar every ensemble metric has to clear; the tick is the threshold */}
      <div
         style={{
            ...rect(4, 14, 18, 3),
            borderRadius: 1.5,
            background: "rgba(255,255,255,0.10)",
         }}
      >
         <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: GAUGE_SCALE, opacity: GAUGE_OPACITY }}
            transition={loop(GAUGE_TIMES)}
            style={{
               position: "absolute",
               inset: 0,
               borderRadius: 1.5,
               background: GREEN,
               transformOrigin: "left center",
            }}
         />
         <div
            style={{
               ...rect(16, -1, 1, 5),
               background: "rgba(255,255,255,0.4)",
            }}
         />
      </div>
   </div>
);

/* The dot lands at 0.60; the gap before 0.65 is PendingManualApproval. */
const APPROVE_TIMES = [0, 0.65, 0.68, 0.9, 0.94, 1];
const APPROVE_OPACITY = [0, 0, 1, 1, 0, 0];

const Registry = ({ tint }: { tint: string }) => (
   <div style={box(X_REGISTRY, Y_PIPELINE, 52, 52)}>
      {/* stacked model package versions; the front one is PendingManualApproval */}
      <div style={{ ...rect(19, 16.5, 20, 13), ...panel, opacity: 0.5 }} />
      <div style={{ ...rect(16, 19.5, 20, 13), ...panel }} />
      <div style={{ ...dot(20, 24.5, 3, tint), opacity: 0.35 }} />
      {/* the clinical reviewer who flips the status to Approved */}
      <div style={dot(42, 22, 3, GLYPH)} />
      <div
         style={{
            ...rect(40, 26.5, 7, 3.5),
            borderRadius: "3.5px 3.5px 0 0",
            background: GLYPH,
         }}
      />
      <span style={caption(52, LABEL_DIM)}>{APPROVED}</span>
      {/* one animated node lights the LED and the label together */}
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: APPROVE_OPACITY }}
         transition={loop(APPROVE_TIMES)}
         style={{ position: "absolute", inset: 0 }}
      >
         <div style={dot(20, 24.5, 3, GREEN)} />
         <span style={caption(52, LABEL_LIT)}>{APPROVED}</span>
      </motion.div>
   </div>
);

const Endpoint = () => (
   <div
      style={{ ...box(X_REGISTRY, Y_SERVE, 34, 14), ...panel, borderRadius: 7 }}
   >
      {/* live endpoint: updated in place by auto deploy, never torn down */}
      <div style={dot(5, 4.5, 3, GREEN)} />
      <div
         style={{
            ...rect(12, 5.5, 14, 1),
            background: "rgba(255,255,255,0.18)",
         }}
      />
   </div>
);

const CURVE = "M 0 11.5 C 6 11.5 8.5 0.5 12 0.5 C 15.5 0.5 18 11.5 24 11.5";
const CURVE_TIMES = [0, 0.77, 0.88, 0.97, 1];
const CURVE_X = [0, 0, 6, 6, 0];

const Monitor = ({ tint }: { tint: string }) => (
   <svg
      viewBox="0 0 24 12"
      style={{ ...box(X_MONITOR, Y_SERVE, 24, 12, -5.5), overflow: "visible" }}
   >
      <path d={CURVE} fill="none" stroke="rgba(255,255,255,0.2)" />
      {/* live prediction score distribution sliding off its baseline */}
      <motion.path
         d={CURVE}
         fill="none"
         stroke={tint}
         strokeWidth={1.2}
         initial={{ x: 0 }}
         animate={{ x: CURVE_X }}
         transition={loop(CURVE_TIMES)}
      />
   </svg>
);

const DRIFT_TIMES = [0, 0.85, 0.87, 0.89, 0.91, 0.94, 1];
const DRIFT_OPACITY = [0, 0, 1, 0.3, 1, 0, 0];

const DriftAlarm = () => (
   <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: DRIFT_OPACITY }}
      transition={loop(DRIFT_TIMES)}
      style={box(X_DRIFT, Y_SERVE, 40, 28)}
   >
      {/* CloudWatch prediction_drift alarm entering ALARM */}
      <span style={caption(40)}>DRIFT</span>
      <div style={dot(18, 12, 4, AMBER)} />
   </motion.div>
);

const MlopsScene = ({ tint }: CoverSceneProps) => (
   <div
      aria-hidden="true"
      style={{
         position: "absolute",
         inset: 0,
         overflow: "hidden",
         background: `radial-gradient(ellipse at ${X_GATE}% ${Y_PIPELINE}%, ${tint}14 0%, transparent 55%), linear-gradient(160deg, #0e1a24 0%, ${BASE_DARK} 60%)`,
      }}
   >
      {/* dot lattice for depth */}
      <div
         style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage:
               "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "19px 19px",
         }}
      />
      {/* terraform hexagon: every resource in the loop is declared */}
      <div
         style={{
            position: "absolute",
            left: "4%",
            bottom: "6%",
            width: 22,
            height: 25,
            background: `${tint}14`,
            clipPath:
               "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
         }}
      />

      <Wiring tint={tint} />
      <Rail from={X_ENSEMBLE} to={X_REGISTRY} top={Y_PIPELINE} />
      <Rail from={X_DRIFT} to={X_REGISTRY} top={Y_SERVE} />
      {/* registry -> endpoint, from the package's bottom edge to the pill's top */}
      <div
         style={{
            position: "absolute",
            left: `calc(${X_REGISTRY}% - 0.5px)`,
            top: `calc(${Y_PIPELINE}% + 7px)`,
            height: `calc(${Y_SERVE - Y_PIPELINE}% - 14px)`,
            width: 1,
            background: HAIRLINE,
         }}
      />

      <Ingest tint={tint} />
      <Ensemble tint={tint} />
      <Mover
         left={X_ENSEMBLE}
         top={Y_PIPELINE}
         color={tint}
         move={THROUGH_MOVE}
         fade={THROUGH_FADE}
      />
      <Gate tint={tint} />
      <Registry tint={tint} />
      <Mover
         left={X_REGISTRY}
         top={Y_PIPELINE}
         color={GREEN}
         move={DEPLOY_MOVE}
         fade={DEPLOY_FADE}
      />
      <Endpoint />
      <Mover
         left={X_REGISTRY}
         top={Y_SERVE}
         color={tint}
         move={PREDICT_MOVE}
         fade={PREDICT_FADE}
      />
      <Monitor tint={tint} />
      <DriftAlarm />
   </div>
);

export default MlopsScene;
