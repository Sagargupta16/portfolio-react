import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";
import {
   BASE_GRADIENT,
   CELL,
   CELL_FIRST,
   CELL_Y,
   CHART_BOTTOM,
   CHART_TOP,
   CLEAR,
   CLEARED,
   CLOSE_D,
   CLOSE_POINTS,
   CLOSE_ROW,
   DAY,
   dayX,
   FEATURE_PITCH,
   FEATURE_TOP,
   FEATURES,
   FIRST_DAY,
   GRID_Y,
   H_FADE_TIMES,
   H_OPACITY,
   H_TIMES,
   H_X,
   landAt,
   LINE_LENGTH,
   LINE_TIMES,
   LINEAR_R,
   loop,
   NEXT_X,
   NON_SCALING,
   NONE,
   OUT_FADE_TIMES,
   OUT_OPACITY,
   OUT_TIMES,
   OUT_Y,
   PREDICTED_D,
   PREDICTIONS,
   RIG_FADE_TIMES,
   RIG_OPACITY,
   RIG_TIMES,
   RIG_X,
   ROUND,
   SCALED,
   SCAN_FADE_TIMES,
   SCAN_OPACITY,
   SCAN_X,
   SEQ_DAYS,
   SEQ_LENGTH,
   SMA_D,
   t,
   WHITE_03,
   WHITE_04,
   WHITE_05,
   WHITE_10,
   WHITE_12,
   WHITE_20,
   WHITE_35,
   WHITE_45,
   WHITE_55,
} from "./ml/lstmWindow";

interface CoverSceneProps {
   tint: string;
}

/*
 * Stock Market Prediction (SMP.ipynb). fetch_preprocess keeps Open, High,
 * Low, Close, Volume and Average and runs them through MinMaxScaler;
 * create_inout_sequences cuts windows of seq_length = 5 days whose label is
 * the next day's Close. The rig below is that window: five columns of six
 * scaled features feed the unrolled nn.LSTM one step at a time, the last
 * hidden state goes through nn.Linear, and the output lands as the
 * predicted Close beside the actual one. Three windows slide one day each,
 * building the Predicted line evaluate_model plots against Actual.
 */

const hairline = {
   fill: NONE,
   strokeWidth: 1,
   vectorEffect: NON_SCALING,
} as const;

const Chart = () => (
   <>
      {GRID_Y.map((y) => (
         <line
            key={y}
            x1={dayX(0) - 3}
            y1={y}
            x2={147.2}
            y2={y}
            stroke={WHITE_04}
            {...hairline}
         />
      ))}
      <line
         x1={dayX(0) - 3}
         y1={CHART_BOTTOM}
         x2={147.2}
         y2={CHART_BOTTOM}
         stroke={WHITE_10}
         {...hairline}
      />
      <line
         x1={dayX(0) - 3}
         y1={CELL_Y}
         x2={147.2}
         y2={CELL_Y}
         stroke={WHITE_05}
         {...hairline}
      />
      <path d={SMA_D} stroke={WHITE_12} strokeLinejoin={ROUND} {...hairline} />
      <path
         d={CLOSE_D}
         stroke={WHITE_55}
         strokeLinejoin={ROUND}
         strokeLinecap={ROUND}
         {...hairline}
      />
      {CLOSE_POINTS.map((p) => (
         <circle key={p.x} cx={p.x} cy={p.y} r={0.55} fill={WHITE_45} />
      ))}
   </>
);

/* Window bracket, label column, scaled features and the unrolled cells. */
const RigFrame = ({ tint }: { tint: string }) => {
   const left = dayX(FIRST_DAY) - DAY / 2 + 0.4;
   const width = DAY * SEQ_LENGTH - 0.8;
   return (
      <>
         <rect
            x={left}
            y={CHART_TOP}
            width={width}
            height={CHART_BOTTOM - CHART_TOP}
            rx={2}
            fill={`${tint}10`}
            stroke={`${tint}66`}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
         <line
            x1={NEXT_X}
            y1={CHART_TOP}
            x2={NEXT_X}
            y2={CELL_Y - LINEAR_R}
            stroke={`${tint}55`}
            strokeDasharray="2 3"
            {...hairline}
         />
         {SEQ_DAYS.map((day, i) => (
            <g key={day}>
               <line
                  x1={dayX(day)}
                  y1={CHART_BOTTOM}
                  x2={dayX(day)}
                  y2={FEATURE_TOP - 1.2}
                  stroke={WHITE_10}
                  {...hairline}
               />
               <line
                  x1={dayX(day)}
                  y1={FEATURE_TOP + FEATURE_PITCH * 5 + 1.2}
                  x2={dayX(day)}
                  y2={CELL_Y - CELL / 2}
                  stroke={WHITE_10}
                  {...hairline}
               />
               {FEATURES.map((feature, j) => (
                  <circle
                     key={feature}
                     cx={dayX(day)}
                     cy={FEATURE_TOP + FEATURE_PITCH * j}
                     r={0.48}
                     fill={j === CLOSE_ROW ? tint : "#fff"}
                     opacity={0.15 + 0.7 * SCALED[i][j]}
                  />
               ))}
               <rect
                  x={dayX(day) - CELL / 2}
                  y={CELL_Y - CELL / 2}
                  width={CELL}
                  height={CELL}
                  rx={1}
                  fill={WHITE_03}
                  stroke={WHITE_20}
                  strokeWidth={1}
                  vectorEffect={NON_SCALING}
               />
            </g>
         ))}
         <path
            d={`M${CELL_FIRST + CELL / 2} ${CELL_Y}H${NEXT_X - LINEAR_R}`}
            stroke={WHITE_20}
            {...hairline}
         />
         <circle
            cx={NEXT_X}
            cy={CELL_Y}
            r={LINEAR_R}
            fill={WHITE_03}
            stroke={`${tint}99`}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
      </>
   );
};

const Rig = ({ tint }: { tint: string }) => (
   <motion.g
      initial={{ x: 0, opacity: 1 }}
      animate={{ x: RIG_X, opacity: RIG_OPACITY }}
      transition={{ x: loop(RIG_TIMES), opacity: loop(RIG_FADE_TIMES) }}
   >
      <motion.rect
         y={FEATURE_TOP - 1.1}
         width={2.6}
         height={FEATURE_PITCH * 5 + 2.2}
         rx={1.2}
         fill={`${tint}26`}
         initial={{ x: SCAN_X[0] - 1.3, opacity: 0 }}
         animate={{ x: SCAN_X.map((x) => x - 1.3), opacity: SCAN_OPACITY }}
         transition={{
            x: loop(H_TIMES, "linear"),
            opacity: loop(SCAN_FADE_TIMES),
         }}
      />
      <RigFrame tint={tint} />
      <motion.circle
         cx={0}
         cy={CELL_Y}
         r={1.1}
         fill={tint}
         initial={{ x: CELL_FIRST, opacity: 0 }}
         animate={{ x: H_X, opacity: H_OPACITY }}
         transition={{
            x: loop(H_TIMES, "linear"),
            opacity: loop(H_FADE_TIMES),
         }}
      />
      <motion.circle
         cx={NEXT_X}
         cy={0}
         r={1.1}
         fill={tint}
         initial={{ y: OUT_Y[0], opacity: 0 }}
         animate={{ y: OUT_Y, opacity: OUT_OPACITY }}
         transition={{ y: loop(OUT_TIMES), opacity: loop(OUT_FADE_TIMES) }}
      />
   </motion.g>
);

const Prediction = ({
   p,
   tint,
}: {
   p: (typeof PREDICTIONS)[number];
   tint: string;
}) => {
   const times = [
      0,
      t(landAt(p.k) - 0.03),
      t(landAt(p.k) + 0.1),
      t(CLEAR),
      t(CLEARED),
      1,
   ];
   return (
      <motion.g
         initial={{ opacity: 0, scale: 0.4 }}
         animate={{
            opacity: [0, 0, 1, 1, 0, 0],
            scale: [0.4, 0.4, 1, 1, 1, 0.4],
         }}
         transition={loop(times)}
      >
         <line
            x1={p.x}
            y1={p.y}
            x2={p.x}
            y2={p.actual}
            stroke={`${tint}80`}
            {...hairline}
         />
         <circle cx={p.x} cy={p.y} r={1.05} fill={tint} />
      </motion.g>
   );
};

const PredictedLine = ({ tint }: { tint: string }) => (
   <motion.path
      d={PREDICTED_D}
      fill={NONE}
      stroke={tint}
      strokeWidth={0.55}
      strokeLinejoin={ROUND}
      initial={{ pathLength: 0, opacity: 1 }}
      animate={{ pathLength: LINE_LENGTH, opacity: RIG_OPACITY }}
      transition={{
         pathLength: loop(LINE_TIMES),
         opacity: loop(RIG_FADE_TIMES),
      }}
   />
);

const label: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 0.8,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
   color: WHITE_35,
};
const legend = (side: "left" | "right"): CSSProperties => ({
   position: "absolute",
   [side]: "8%",
   top: "8%",
   display: "flex",
   alignItems: "center",
   gap: 5,
});
const rowLabel = (top: string): CSSProperties => ({
   ...label,
   position: "absolute",
   left: "8%",
   top,
   transform: "translateY(-50%)",
});

const Labels = ({ tint }: { tint: string }) => (
   <>
      <div style={legend("left")}>
         <span
            style={{
               display: "block",
               width: 9,
               height: 1,
               background: WHITE_55,
            }}
         />
         <span style={label}>CLOSE</span>
      </div>
      <div style={legend("right")}>
         <span
            style={{
               display: "block",
               width: 9,
               height: 1.5,
               background: tint,
            }}
         />
         <span style={label}>PREDICTED</span>
      </div>
      <span style={rowLabel(`${FEATURE_TOP + FEATURE_PITCH * 2.5}%`)}>
         MINMAXSCALER
      </span>
      <span style={rowLabel(`${CELL_Y}%`)}>LSTM</span>
   </>
);

const MlScene = ({ tint }: CoverSceneProps) => (
   <div
      aria-hidden="true"
      style={{
         position: "absolute",
         inset: 0,
         overflow: "hidden",
         background: BASE_GRADIENT,
      }}
   >
      <div
         style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 70% 42%, ${tint}1f, transparent 60%)`,
         }}
      />
      <svg
         viewBox="0 0 160 100"
         preserveAspectRatio="xMidYMid meet"
         style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
         }}
      >
         <Chart />
         <Rig tint={tint} />
         <PredictedLine tint={tint} />
         {PREDICTIONS.map((p) => (
            <Prediction key={p.id} p={p} tint={tint} />
         ))}
      </svg>
      <Labels tint={tint} />
   </div>
);

export default MlScene;
