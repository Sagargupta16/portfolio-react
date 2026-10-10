import { motion } from "motion/react";
import {
   GREEN,
   LABEL_LIT,
   NON_SCALING,
   WHITE_18,
   boxAt,
   curveH,
   dotStyle,
   label,
   labelAt,
   loop,
   panel,
   pctX,
   pctY,
   sweep,
   tintPanel,
} from "./infra/tokens";
import type { TintProps } from "./infra/tokens";
import { Packet, Stage, StageSvg, Wires } from "./infra/primitives";
import Serving from "./mlops/Serving";
import {
   ALARM,
   CYCLE,
   ENDPOINT,
   ENSEMBLE,
   GATE,
   MONITOR,
   REGISTRY,
   S3,
   TRAIN_ROWS,
   TRAIN_X,
   trainer,
} from "./mlops/layout";

/*
 * SageMaker image classification MLOps, one 6 s loop read clockwise.
 * Top rail: data flows out of the S3 bucket into three trainers
 * (TrainVgg16Model, TrainDenseNet121Model, TrainEfficientNetModel) running in
 * parallel, fans back into CreateEnsembleModel, and waits inside the Clinical
 * Quality Gate while four metrics rise past their thresholds. It registers as
 * PendingManualApproval, holds, and turns APPROVED.
 * Right edge: the auto deploy drops it onto the endpoint, where a canary
 * slice of the new fleet takes traffic before the full shift.
 * Bottom rail: captured predictions reach the hourly PSI drift job, the score
 * curve slides off its baseline, the prediction drift alarm fires, and the
 * drift triggers retraining edge draws back to the bucket, retracting into
 * it as the next run starts. 12 animated nodes.
 */

const FAN_PATHS = TRAIN_ROWS.flatMap((y) => [
   curveH(S3, trainer(y)),
   curveH(trainer(y), ENSEMBLE),
]);
const RAILS = [
   `M ${ENSEMBLE[0]} ${ENSEMBLE[1]} H ${REGISTRY[0]}`,
   `M ${REGISTRY[0]} ${REGISTRY[1]} V ${ENDPOINT[1]}`,
   `M ${ENDPOINT[0]} ${ENDPOINT[1]} H ${ALARM[0]}`,
];
const DROP = ENDPOINT[1] - REGISTRY[1];
const CAPTURE = MONITOR[0] - ENDPOINT[0];
const RETRAIN = `M ${ALARM[0]} ${ALARM[1]} C 30 ${ALARM[1]} ${S3[0]} 64 ${S3[0]} ${S3[1]}`;

/* ---------------- wiring ---------------- */

const FLOW_FADE = {
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.02, 0.06, 0.28, 0.33, 1],
};

/* Draws from the alarm once it fires (0.9 to 0.99), then retracts into the
   bucket while the next run starts; pathOffset + pathLength stays 1 while it
   retracts. */
const RETRAIN_TIMES = [0, 0.08, 0.86, 0.9, 0.99, 1];
const RETRAIN_LENGTH = [1, 0, 0, 0, 1, 1];
const RETRAIN_OFFSET = [0, 1, 1, 0, 0, 0];

const Wiring = ({ tint }: TintProps) => (
   <StageSvg>
      <Wires paths={[...FAN_PATHS, ...RAILS]} />
      <Wires paths={[RETRAIN]} stroke={`${tint}40`} dash="3 4" />
      {/* training data in flight on every fan edge: px dashes, so non-scaling */}
      <motion.path
         d={FAN_PATHS.join(" ")}
         fill="none"
         stroke={tint}
         strokeDasharray="3 7"
         vectorEffect={NON_SCALING}
         initial={{ strokeDashoffset: 0, opacity: 0 }}
         animate={{ strokeDashoffset: [0, -160], opacity: FLOW_FADE.opacity }}
         transition={{
            strokeDashoffset: sweep(CYCLE),
            opacity: loop(CYCLE, FLOW_FADE.times),
         }}
      />
      {/* RetrainingReason=drift_detected: a uniform-stage draw, no vector-effect */}
      <motion.path
         d={RETRAIN}
         fill="none"
         stroke={tint}
         strokeWidth={0.8}
         initial={{ pathLength: 1, pathOffset: 0 }}
         animate={{ pathLength: RETRAIN_LENGTH, pathOffset: RETRAIN_OFFSET }}
         transition={loop(CYCLE, RETRAIN_TIMES)}
      />
   </StageSvg>
);

/* ---------------- packets ---------------- */

const Packets = ({ tint }: TintProps) => (
   <>
      {/* ensemble -> gate (held out of sight inside it) -> registry */}
      <Packet
         from={ENSEMBLE}
         color={tint}
         dir="right"
         cycle={CYCLE}
         track={{
            x: [
               0,
               0,
               GATE[0] - ENSEMBLE[0],
               GATE[0] - ENSEMBLE[0],
               REGISTRY[0] - ENSEMBLE[0],
               REGISTRY[0] - ENSEMBLE[0],
            ],
            times: [0, 0.3, 0.4, 0.52, 0.62, 1],
         }}
         fade={{
            opacity: [0, 0, 1, 1, 0, 0],
            times: [0, 0.3, 0.32, 0.61, 0.63, 1],
         }}
      />
      {/* approved package -> endpoint */}
      <Packet
         from={REGISTRY}
         color={tint}
         dir="down"
         cycle={CYCLE}
         track={{ y: [0, 0, DROP, DROP], times: [0, 0.68, 0.75, 1] }}
         fade={{
            opacity: [0, 0, 1, 1, 0, 0],
            times: [0, 0.68, 0.7, 0.74, 0.76, 1],
         }}
      />
      {/* data capture -> drift job */}
      <Packet
         from={ENDPOINT}
         color={tint}
         dir="left"
         cycle={CYCLE}
         track={{ x: [0, 0, CAPTURE, CAPTURE], times: [0, 0.79, 0.86, 1] }}
         fade={{
            opacity: [0, 0, 1, 1, 0, 0],
            times: [0, 0.78, 0.8, 0.85, 0.87, 1],
         }}
      />
   </>
);

/* ---------------- top rail ---------------- */

const Bucket = ({ tint }: TintProps) => (
   <div style={{ ...boxAt(S3, 29, 23), ...tintPanel(tint, 6) }}>
      <svg
         width={29}
         height={23}
         viewBox="0 0 22 18"
         style={{ position: "absolute", left: -1, top: -1 }}
      >
         <ellipse
            cx={11}
            cy={5.5}
            rx={6}
            ry={1.8}
            fill="none"
            stroke={`${tint}cc`}
         />
         <path
            d="M 5 5.5 L 6.5 12.5 Q 11 14.6 15.5 12.5 L 17 5.5"
            fill="none"
            stroke={`${tint}88`}
         />
      </svg>
   </div>
);

const TRAIN_SCALE = { scaleX: [0, 0, 1, 1], times: [0, 0.05, 0.3, 1] };
const TRAIN_FADE = { opacity: [0, 1, 1, 0, 0], times: [0, 0.05, 0.9, 0.94, 1] };

/* Three parallel training jobs; one node fills all three progress bars. */
const Trainers = ({ tint }: TintProps) => (
   <>
      {TRAIN_ROWS.map((y) => (
         <div key={y} style={{ ...boxAt(trainer(y), 29, 10), ...panel(5) }} />
      ))}
      <motion.div
         initial={{ scaleX: 0, opacity: 0 }}
         animate={{ scaleX: TRAIN_SCALE.scaleX, opacity: TRAIN_FADE.opacity }}
         transition={{
            scaleX: loop(CYCLE, TRAIN_SCALE.times),
            opacity: loop(CYCLE, TRAIN_FADE.times),
         }}
         style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `calc(${pctX(TRAIN_X)} - 9.5px)`,
            width: 19,
            transformOrigin: "left center",
         }}
      >
         {TRAIN_ROWS.map((y) => (
            <div
               key={y}
               style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `calc(${pctY(y)} - 1.5px)`,
                  height: 3,
                  borderRadius: 1.5,
                  background: tint,
               }}
            />
         ))}
      </motion.div>
   </>
);

const Ensemble = ({ tint }: TintProps) => (
   <div
      style={{
         ...boxAt(ENSEMBLE, 16, 16),
         ...tintPanel(tint, 8),
         display: "grid",
         placeItems: "center",
      }}
   >
      <div style={dotStyle(7, tint)} />
   </div>
);

/* accuracy, recall, precision, AUC: final bar height and its threshold tick */
const METRICS = [
   { key: "accuracy", bar: 20, tick: 16 },
   { key: "recall", bar: 25, tick: 22 },
   { key: "precision", bar: 17, tick: 13 },
   { key: "auc", bar: 22, tick: 18 },
];
const METRIC_ROW = {
   position: "absolute" as const,
   left: 0,
   right: 0,
   bottom: 8,
   height: 26,
   display: "flex",
   justifyContent: "center",
   alignItems: "flex-end",
   gap: 4,
};
const BARS = { scaleY: [0, 0, 1, 1, 0], times: [0, 0.4, 0.5, 0.93, 1] };
const PASS = {
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.5, 0.53, 0.9, 0.94, 1],
};

/* Clinical Quality Gate: every metric has to clear its tick, or Fail. */
const Gate = ({ tint }: TintProps) => (
   <div style={{ ...boxAt(GATE, 40, 44), ...tintPanel(tint, 8) }}>
      <motion.div
         initial={{ scaleY: 0 }}
         animate={{ scaleY: BARS.scaleY }}
         transition={loop(CYCLE, BARS.times)}
         style={{ ...METRIC_ROW, transformOrigin: "bottom center" }}
      >
         {METRICS.map(({ key, bar }) => (
            <div
               key={key}
               style={{
                  width: 4,
                  height: bar,
                  borderRadius: 1.5,
                  background: `${tint}cc`,
               }}
            />
         ))}
      </motion.div>
      <div style={METRIC_ROW}>
         {METRICS.map(({ key, tick }) => (
            <div
               key={key}
               style={{ position: "relative", width: 4, height: 26 }}
            >
               <div
                  style={{
                     position: "absolute",
                     left: -1.5,
                     bottom: tick,
                     width: 7,
                     height: 1,
                     background: "rgba(255,255,255,0.55)",
                  }}
               />
            </div>
         ))}
      </div>
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: PASS.opacity }}
         transition={loop(CYCLE, PASS.times)}
         style={{
            position: "absolute",
            inset: -1,
            borderRadius: 8,
            border: `1px solid ${GREEN}b3`,
         }}
      >
         <div
            style={{
               ...dotStyle(5, GREEN),
               position: "absolute",
               top: 5,
               right: 5,
            }}
         />
      </motion.div>
   </div>
);

const APPROVED = "APPROVED";
const APPROVE = {
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.65, 0.68, 0.9, 0.94, 1],
};
const CARD_LINE = {
   position: "absolute" as const,
   height: 1,
   background: WHITE_18,
};

/* Model Registry: two package versions; the newest waits as
   PendingManualApproval until a reviewer approves it. */
const Registry = ({ tint }: TintProps) => (
   <>
      <div
         style={{
            ...boxAt(REGISTRY, 29, 20),
            ...panel(5),
            transform: "translate(4px, -4px)",
            opacity: 0.55,
         }}
      />
      <div style={{ ...boxAt(REGISTRY, 29, 20), ...panel(5) }}>
         <div
            style={{
               ...dotStyle(4, `${tint}66`),
               position: "absolute",
               left: 5,
               top: 7,
            }}
         />
         <div style={{ ...CARD_LINE, left: 13, top: 6, width: 10 }} />
         <div style={{ ...CARD_LINE, left: 13, top: 11, width: 7 }} />
      </div>
      <span style={labelAt(REGISTRY, -26)}>{APPROVED}</span>
      {/* one node lights the status LED and the label together */}
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: APPROVE.opacity }}
         transition={loop(CYCLE, APPROVE.times)}
         style={boxAt(REGISTRY, 29, 20)}
      >
         <div
            style={{
               ...dotStyle(4, GREEN),
               position: "absolute",
               left: 6,
               top: 8,
            }}
         />
         <span
            style={{
               ...label,
               position: "absolute",
               left: "50%",
               top: -16,
               transform: "translateX(-50%)",
               color: LABEL_LIT,
            }}
         >
            {APPROVED}
         </span>
      </motion.div>
   </>
);

const MlopsScene = ({ tint }: TintProps) => (
   <Stage tint={tint} focus={GATE} backdrop="dots">
      <Wiring tint={tint} />
      <Packets tint={tint} />
      <Bucket tint={tint} />
      <Trainers tint={tint} />
      <Ensemble tint={tint} />
      <span style={labelAt(ENSEMBLE, 12)}>ENSEMBLE</span>
      <Gate tint={tint} />
      <span style={labelAt(GATE, -36)}>QUALITY GATE</span>
      <Registry tint={tint} />
      <Serving tint={tint} />
   </Stage>
);

export default MlopsScene;
