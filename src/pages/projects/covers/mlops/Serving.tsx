import { motion } from "motion/react";
import {
   AMBER,
   GREEN,
   WHITE_30,
   boxAt,
   dotStyle,
   labelAt,
   loop,
   panel,
} from "../infra/tokens";
import type { TintProps } from "../infra/tokens";
import { ALARM, CYCLE, ENDPOINT, MONITOR } from "./layout";

/* The serving half of MlopsScene: the live endpoint taking a canary update,
   the hourly PSI drift job, and the prediction drift alarm. */

const CANARY_SCALE = {
   scaleX: [0, 0, 0.14, 0.14, 1, 1],
   times: [0, 0.75, 0.77, 0.81, 0.86, 1],
};
const CANARY_FADE = {
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.74, 0.75, 0.94, 0.98, 1],
};

/* Live endpoint: blue/green update, a canary slice of the new fleet first,
   then the rest of the traffic. */
const Endpoint = ({ tint }: TintProps) => (
   <div style={{ ...boxAt(ENDPOINT, 52, 21), ...panel(8) }}>
      <div
         style={{
            ...dotStyle(4, GREEN),
            position: "absolute",
            left: 8,
            top: 7.5,
         }}
      />
      <div
         style={{
            position: "absolute",
            left: 17,
            top: 7.5,
            width: 27,
            height: 4,
            borderRadius: 2,
            overflow: "hidden",
            background: "rgba(255,255,255,0.15)",
         }}
      >
         <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
               scaleX: CANARY_SCALE.scaleX,
               opacity: CANARY_FADE.opacity,
            }}
            transition={{
               scaleX: loop(CYCLE, CANARY_SCALE.times),
               opacity: loop(CYCLE, CANARY_FADE.times),
            }}
            style={{
               position: "absolute",
               inset: 0,
               background: tint,
               transformOrigin: "left center",
            }}
         />
      </div>
   </div>
);

const CURVE = "M 0 9 C 5 9 8 1 13 1 C 18 1 21 9 26 9";
const DRIFT = { x: [0, 0, 5, 5, 0], times: [0, 0.86, 0.91, 0.96, 1] };

/* prediction_score_psi: the live score distribution slides off its
   baseline. */
const Monitor = ({ tint }: TintProps) => (
   <div style={{ ...boxAt(MONITOR, 44, 23), ...panel(7), overflow: "hidden" }}>
      <svg
         width={34}
         height={13}
         viewBox="0 0 26 10"
         style={{ position: "absolute", left: 4, top: 4, overflow: "visible" }}
      >
         <path
            d={CURVE}
            fill="none"
            stroke={WHITE_30}
            strokeDasharray="1.5 1.5"
         />
         <motion.path
            d={CURVE}
            fill="none"
            stroke={tint}
            strokeWidth={1.2}
            initial={{ x: 0 }}
            animate={{ x: DRIFT.x }}
            transition={loop(CYCLE, DRIFT.times)}
         />
      </svg>
   </div>
);

const ALARM_FLASH = {
   opacity: [0, 0, 1, 0.35, 1, 1, 0],
   times: [0, 0.89, 0.91, 0.93, 0.95, 0.985, 1],
};

/* CloudWatch prediction drift alarm: OK at rest, ALARM in amber. */
const Alarm = () => (
   <>
      <div style={{ ...boxAt(ALARM, 7, 7), ...dotStyle(7, WHITE_30) }} />
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: ALARM_FLASH.opacity }}
         transition={loop(CYCLE, ALARM_FLASH.times)}
         style={{ ...boxAt(ALARM, 7, 7), ...dotStyle(7, AMBER) }}
      />
      <span style={labelAt(ALARM, -17)}>PSI DRIFT</span>
   </>
);

export default function Serving({ tint }: Readonly<TintProps>) {
   return (
      <>
         <Endpoint tint={tint} />
         <Monitor tint={tint} />
         <Alarm />
      </>
   );
}
