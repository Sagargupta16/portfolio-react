import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
  tint: string;
  variant?: string;
}

/* Blue-green AWS deployment on Terraform -- ALB shifts traffic BLUE -> GREEN, zero downtime. */

const CYCLE = 6;
const DOT_TIMES = [0, 0.08, 0.26, 0.4, 1];
const bluePhase = { opacity: [1, 1, 0.25, 0.25, 1] };
const greenPhase = { opacity: [0.25, 0.25, 1, 1, 0.25] };
const phaseTransition = {
  duration: CYCLE,
  repeat: Infinity,
  times: [0, 0.42, 0.52, 0.92, 1],
};

const label: React.CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 7,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase",
};

const EnvBox = ({
  name,
  border,
  marginLeft,
  phase,
}: {
  name: string;
  border: string;
  marginLeft: number;
  phase: { opacity: number[] };
}) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "12%",
      marginLeft,
      marginTop: 54,
      width: 84,
      height: 56,
      borderRadius: 6,
      border: `1px solid ${border}45`,
      background: `${border}06`,
      overflow: "hidden",
    }}
  >
    <motion.div
      animate={phase}
      transition={phaseTransition}
      style={{ position: "absolute", inset: 0, background: `${border}0a` }}
    />
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 8px 4px",
      }}
    >
      <motion.span
        animate={{ ...phase, scale: [1, 1.4, 1] }}
        transition={{ ...phaseTransition, scale: { duration: 2, repeat: Infinity } }}
        style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e" }}
      />
      <span style={{ ...label, color: `${border}cc` }}>{name}</span>
    </div>
    {[46, 30].map((w, i) => (
      <motion.div
        key={w}
        animate={{ width: [w, w * 0.55, w] }}
        transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8 }}
        style={{
          height: 2,
          borderRadius: 2,
          background: `${border}38`,
          margin: "5px 8px 0",
        }}
      />
    ))}
  </div>
);

const TrafficDot = ({
  dir,
  color,
  delay,
}: {
  dir: 1 | -1;
  color: string;
  delay: number;
}) => (
  <motion.div
    animate={{
      x: [0, 0, 90 * dir, 90 * dir, 90 * dir],
      y: [0, 18, 18, 40, 40],
      opacity: [0, 1, 1, 0, 0],
    }}
    transition={{ duration: CYCLE, repeat: Infinity, delay, times: DOT_TIMES, ease: "linear" }}
    style={{
      position: "absolute",
      left: "50%",
      top: "12%",
      marginLeft: -2,
      marginTop: 22,
      width: 4,
      height: 4,
      borderRadius: "50%",
      background: color,
    }}
  />
);

const InfraScene = ({ tint }: CoverSceneProps) => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background: `radial-gradient(ellipse at 50% 0%, ${tint}14 0%, transparent 60%), linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)`,
    }}
  >
    {/* hairline dot grid */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.05,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    />

    {/* ALB node */}
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "12%",
        marginLeft: -32,
        width: 64,
        height: 24,
        borderRadius: 6,
        border: "1px solid #60a5fa40",
        background: "#60a5fa08",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
      }}
    >
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: 3, height: 3, borderRadius: "50%", background: "#38bdf8" }}
      />
      <span style={{ ...label, fontSize: 8, color: "#60a5fa" }}>ALB</span>
    </div>

    {/* rails: stem, horizontal split, two drops */}
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "12%",
        marginTop: 24,
        width: 1,
        height: 16,
        background: "rgba(255,255,255,0.10)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "12%",
        marginLeft: -90,
        marginTop: 40,
        width: 180,
        height: 1,
        background: "rgba(255,255,255,0.08)",
      }}
    />
    {[-90, 89].map((ml) => (
      <div
        key={ml}
        style={{
          position: "absolute",
          left: "50%",
          top: "12%",
          marginLeft: ml,
          marginTop: 40,
          width: 1,
          height: 14,
          background: "rgba(255,255,255,0.08)",
        }}
      />
    ))}

    {/* traffic: streams to BLUE first, then cuts over to GREEN */}
    {[0, 1, 2].map((i) => (
      <TrafficDot key={`b${i}`} dir={-1} color="#60a5fa" delay={i * 0.55} />
    ))}
    {[0, 1, 2].map((i) => (
      <TrafficDot key={`g${i}`} dir={1} color="#22c55e" delay={CYCLE / 2 + i * 0.55} />
    ))}

    <EnvBox name="blue" border="#60a5fa" marginLeft={-132} phase={bluePhase} />
    <EnvBox name="green" border="#22c55e" marginLeft={48} phase={greenPhase} />

    {/* terraform apply prompt */}
    <div
      style={{
        position: "absolute",
        left: "6%",
        bottom: "9%",
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontFamily: MONO_FONT,
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      <span style={{ color: `${tint}cc`, marginRight: 4 }}>$</span>
      <span style={{ color: "rgba(255,255,255,0.4)" }}>terraform apply</span>
      <motion.span
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        style={{ width: 4, height: 9, marginLeft: 3, background: "#60a5fa" }}
      />
    </div>

    {/* terraform hexagon hint */}
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 5, repeat: Infinity }}
      style={{
        position: "absolute",
        right: "7%",
        bottom: "10%",
        width: 30,
        height: 34,
        background: `${tint}12`,
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      }}
    />
  </div>
);

export default InfraScene;
