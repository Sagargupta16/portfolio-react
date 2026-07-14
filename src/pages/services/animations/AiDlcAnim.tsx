import { motion } from "motion/react";
import { MONO_FONT, GREEN } from "@/constants/theme";

interface AiDlcAnimProps {
   color: string;
}

/* AI-driven development lifecycle: a spec card fans out to three agent dots
   working in parallel, which converge into a shipped check. Loops forever. */

const CYCLE = 5;

const label: React.CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 6,
   fontWeight: 700,
   letterSpacing: 0.6,
};

const AGENT_LANES = [16, 36, 56];

const AiDlcAnim = ({ color }: AiDlcAnimProps) => (
   <div style={{ width: 80, height: 80, position: "relative" }}>
      {/* Spec card (top-left) */}
      <div
         style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: 30,
            height: 22,
            borderRadius: 4,
            border: `1px solid ${color}35`,
            background: `${color}06`,
            padding: "4px 4px 0",
         }}
      >
         <span style={{ ...label, color: `${color}cc` }}>SPEC</span>
         <motion.div
            animate={{ width: ["0%", "85%", "85%", "0%"] }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               times: [0, 0.18, 0.85, 1],
            }}
            style={{
               height: 2,
               marginTop: 2,
               borderRadius: 2,
               background: `${color}50`,
            }}
         />
      </div>

      {/* Fan-out lines to agents */}
      {AGENT_LANES.map((y, i) => (
         <motion.span
            key={`pulse-${y}`}
            animate={{
               x: [0, 26],
               y: [0, y - 14],
               opacity: [0, 1, 0],
            }}
            transition={{
               duration: CYCLE * 0.3,
               repeat: Infinity,
               repeatDelay: CYCLE * 0.7,
               delay: CYCLE * 0.18 + i * 0.15,
               ease: "easeOut",
            }}
            style={{
               position: "absolute",
               left: 32,
               top: 14,
               width: 3,
               height: 3,
               borderRadius: "50%",
               background: color,
            }}
         />
      ))}

      {/* Agent dots (middle column) doing staggered "work" pulses */}
      {AGENT_LANES.map((y, i) => (
         <motion.div
            key={`agent-${y}`}
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
               duration: 1.1,
               repeat: Infinity,
               delay: i * 0.35,
            }}
            style={{
               position: "absolute",
               left: 56,
               top: y - 3,
               width: 9,
               height: 9,
               borderRadius: 3,
               border: `1px solid ${color}60`,
               background: `${color}15`,
            }}
         />
      ))}
      <span
         style={{
            ...label,
            position: "absolute",
            left: 50,
            top: 62,
            color: `${color}90`,
         }}
      >
         AGENTS
      </span>

      {/* Converge lines into ship check (bottom-left) */}
      {AGENT_LANES.map((y, i) => (
         <motion.span
            key={`ship-${y}`}
            animate={{
               x: [0, -34],
               y: [0, 62 - y],
               opacity: [0, 1, 0],
            }}
            transition={{
               duration: CYCLE * 0.25,
               repeat: Infinity,
               repeatDelay: CYCLE * 0.75,
               delay: CYCLE * 0.6 + i * 0.12,
               ease: "easeIn",
            }}
            style={{
               position: "absolute",
               left: 58,
               top: y,
               width: 3,
               height: 3,
               borderRadius: "50%",
               background: GREEN,
            }}
         />
      ))}

      {/* Shipped check */}
      <motion.div
         animate={{ opacity: [0.35, 0.35, 1, 1, 0.35], scale: [1, 1, 1.15, 1, 1] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            times: [0, 0.72, 0.78, 0.9, 1],
         }}
         style={{
            position: "absolute",
            left: 6,
            top: 56,
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: "2px 5px",
            borderRadius: 4,
            border: `1px solid ${GREEN}40`,
            background: `${GREEN}0a`,
         }}
      >
         <span style={{ ...label, color: GREEN }}>{"✓ SHIP"}</span>
      </motion.div>
   </div>
);

export default AiDlcAnim;
