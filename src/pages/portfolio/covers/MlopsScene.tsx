import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
}

/*
 * SageMaker MLOps pipeline: S3 event lands -> three architectures train in
 * parallel -> ensemble -> quality gate -> registered. The gate is the point of
 * the project, so it gets the beat: it flashes, then the PASS badge resolves.
 * A drift arc loops back to the trainers to close the retrain circuit.
 */

const CYCLE = 7;

/* Stage x-positions as percentages of the scene width. */
const X_INGEST = 12;
const X_TRAIN = 40;
const X_GATE = 68;
const X_REGISTRY = 90;

/* Three architectures, trained in parallel then ensembled. */
const ARCHES = [
   { label: "VGG16", top: "26%", delay: 0 },
   { label: "DENSE", top: "45%", delay: 0.22 },
   { label: "EFFNET", top: "64%", delay: 0.44 },
];

const label: React.CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: "0.12em",
   textTransform: "uppercase",
};

/* Hairline rail between two stages. */
const Rail = ({ from, to, top }: { from: number; to: number; top: string }) => (
   <div
      style={{
         position: "absolute",
         left: `${from}%`,
         width: `${to - from}%`,
         top,
         height: 1,
         background: "rgba(255,255,255,0.08)",
      }}
   />
);

/* A packet of training data moving along one rail. */
const Packet = ({
   from,
   to,
   top,
   delay,
   color,
}: {
   from: number;
   to: number;
   top: string;
   delay: number;
   color: string;
}) => (
   <motion.div
      animate={{ left: [`${from}%`, `${to}%`], opacity: [0, 1, 1, 0] }}
      transition={{
         duration: CYCLE * 0.3,
         repeat: Infinity,
         repeatDelay: CYCLE * 0.7,
         delay,
         times: [0, 0.12, 0.85, 1],
         ease: "easeInOut",
      }}
      style={{
         position: "absolute",
         top,
         width: 4,
         height: 4,
         marginTop: -2,
         borderRadius: "50%",
         background: color,
      }}
   />
);

const MlopsScene = ({ tint }: CoverSceneProps) => (
   <div
      aria-hidden="true"
      style={{
         position: "absolute",
         inset: 0,
         overflow: "hidden",
         background: `radial-gradient(ellipse at 68% 12%, ${tint}14 0%, transparent 58%), linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)`,
      }}
   >
      {/* dot grid for depth */}
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

      {/* terraform hexagon: every resource here is declared, not clicked */}
      <motion.div
         animate={{ opacity: [0.45, 0.8, 0.45] }}
         transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
         style={{
            position: "absolute",
            left: "5%",
            bottom: "8%",
            width: 22,
            height: 25,
            background: `${tint}14`,
            clipPath:
               "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
         }}
      />
      <div
         style={{
            ...label,
            position: "absolute",
            left: "13%",
            bottom: "10%",
            fontSize: 6.5,
            color: "rgba(255,255,255,0.32)",
         }}
      >
         89 tf / 14 modules
      </div>

      {/* S3 ingest bucket, pulses when a new object lands */}
      <motion.div
         animate={{ borderColor: [`${tint}35`, `${tint}80`, `${tint}35`] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            times: [0, 0.06, 0.2],
         }}
         style={{
            position: "absolute",
            left: `${X_INGEST}%`,
            top: "45%",
            marginLeft: -17,
            marginTop: -13,
            width: 34,
            height: 26,
            borderRadius: 5,
            border: `1px solid ${tint}35`,
            background: `${tint}08`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         <span style={{ ...label, fontSize: 7.5, color: `${tint}cc` }}>S3</span>
      </motion.div>

      {/* fan-out rails: ingest -> each trainer, then trainer -> gate */}
      {ARCHES.map((a) => (
         <Rail key={`in-${a.label}`} from={X_INGEST} to={X_TRAIN} top={a.top} />
      ))}
      {ARCHES.map((a) => (
         <Rail key={`out-${a.label}`} from={X_TRAIN} to={X_GATE} top={a.top} />
      ))}
      <Rail from={X_GATE} to={X_REGISTRY} top="45%" />

      {/* data flowing in, then predictions flowing out to the gate */}
      {ARCHES.map((a) => (
         <Packet
            key={`p-in-${a.label}`}
            from={X_INGEST}
            to={X_TRAIN}
            top={a.top}
            delay={a.delay}
            color="#60a5fa"
         />
      ))}
      {ARCHES.map((a) => (
         <Packet
            key={`p-out-${a.label}`}
            from={X_TRAIN}
            to={X_GATE}
            top={a.top}
            delay={CYCLE * 0.34 + a.delay}
            color="#38bdf8"
         />
      ))}

      {/* the three architectures, each training on its own beat */}
      {ARCHES.map((a) => (
         <motion.div
            key={a.label}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               delay: a.delay,
               times: [0, 0.22, 0.55],
            }}
            style={{
               position: "absolute",
               left: `${X_TRAIN}%`,
               top: a.top,
               marginLeft: -21,
               marginTop: -8,
               width: 42,
               height: 16,
               borderRadius: 4,
               border: `1px solid ${tint}30`,
               background: `${tint}0a`,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
            }}
         >
            <span
               style={{
                  ...label,
                  fontSize: 6,
                  color: "rgba(255,255,255,0.52)",
               }}
            >
               {a.label}
            </span>
         </motion.div>
      ))}

      {/* quality gate: the hard condition every model has to clear */}
      <motion.div
         animate={{
            borderColor: [`${tint}30`, "#22c55e70", `${tint}30`],
         }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            times: [0, 0.62, 0.8],
         }}
         style={{
            position: "absolute",
            left: `${X_GATE}%`,
            top: "45%",
            marginLeft: -18,
            marginTop: -18,
            width: 36,
            height: 36,
            borderRadius: 6,
            border: `1px solid ${tint}30`,
            background: `${tint}08`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
         }}
      >
         <span style={{ ...label, fontSize: 5.5, color: `${tint}aa` }}>
            GATE
         </span>
         <span
            style={{
               fontFamily: MONO_FONT,
               fontSize: 6,
               fontWeight: 700,
               color: "rgba(255,255,255,0.42)",
            }}
         >
            .95
         </span>
      </motion.div>

      {/* recall threshold, the strictest of the four gates */}
      <div
         style={{
            ...label,
            position: "absolute",
            left: `${X_GATE}%`,
            top: "72%",
            marginLeft: -26,
            width: 52,
            textAlign: "center",
            fontSize: 5.5,
            color: "rgba(255,255,255,0.3)",
         }}
      >
         recall gate
      </div>

      {/* registry: only reached once the gate passes */}
      <motion.div
         animate={{ opacity: [0.3, 0.3, 1, 1, 0.3], scale: [1, 1, 1.1, 1, 1] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            times: [0, 0.66, 0.74, 0.94, 1],
         }}
         style={{
            position: "absolute",
            left: `${X_REGISTRY}%`,
            top: "45%",
            marginLeft: -9,
            marginTop: -9,
            width: 18,
            height: 18,
            borderRadius: 4,
            border: "1px solid #22c55e60",
            background: "#22c55e12",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         {/* checkmark */}
         <div
            style={{
               width: 7,
               height: 4,
               borderLeft: "1.5px solid #22c55e",
               borderBottom: "1.5px solid #22c55e",
               transform: "rotate(-45deg) translateY(-1px)",
            }}
         />
      </motion.div>

      {/* drift arc looping registry -> trainers: Model Monitor restarts training */}
      <svg
         viewBox="0 0 100 60"
         preserveAspectRatio="none"
         style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
         }}
      >
         <path
            d={`M ${X_REGISTRY} 12 C ${X_REGISTRY} 3, ${X_TRAIN} 3, ${X_TRAIN} 14`}
            fill="none"
            stroke={`${tint}28`}
            strokeWidth={1}
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
         />
         <motion.path
            d={`M ${X_REGISTRY} 12 C ${X_REGISTRY} 3, ${X_TRAIN} 3, ${X_TRAIN} 14`}
            fill="none"
            stroke={tint}
            strokeWidth={1.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 1, 1, 0] }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               times: [0, 0.8, 0.94, 1],
               ease: "easeInOut",
            }}
         />
      </svg>
      <div
         style={{
            ...label,
            position: "absolute",
            right: "8%",
            top: "6%",
            fontSize: 5.5,
            color: "rgba(255,255,255,0.3)",
         }}
      >
         drift retrain
      </div>
   </div>
);

export default MlopsScene;
