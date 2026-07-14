import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

// One full auth cycle: type credentials -> submit -> JWT travels -> shield
// verifies -> pause -> reset. All loops share CYCLE so the story stays synced.
const CYCLE = 5.5;

const label = {
   fontFamily: MONO_FONT,
   fontWeight: 700,
   letterSpacing: 1,
   textTransform: "uppercase",
} as const;

const AuthScene = ({ tint }: CoverSceneProps) => (
   <div
      aria-hidden="true"
      style={{
         position: "absolute",
         inset: 0,
         overflow: "hidden",
         background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
      }}
   >
      {/* faint dot grid for depth */}
      <div
         style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage:
               "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
         }}
      />
      {/* tinted glow behind the action */}
      <div
         style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 42% 46%, ${tint}14, transparent 62%)`,
         }}
      />

      {/* hairline the token travels along */}
      <div
         style={{
            position: "absolute",
            left: "32%",
            top: "48%",
            width: "44%",
            height: 1,
            background: "rgba(255,255,255,0.08)",
         }}
      />

      {/* login form mini card */}
      <div
         style={{
            position: "absolute",
            left: "9%",
            top: "31%",
            width: 92,
            height: 64,
            borderRadius: 6,
            border: "1px solid #60a5fa30",
            background: "#60a5fa06",
            overflow: "hidden",
         }}
      >
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 4,
               height: 14,
               padding: "0 6px",
               borderBottom: "1px solid #60a5fa18",
               background: "#60a5fa0a",
            }}
         >
            <div
               style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#22c55e",
               }}
            />
            <span style={{ ...label, fontSize: 7, color: "#60a5fa" }}>
               login
            </span>
         </div>
         <div style={{ padding: "7px 8px 0" }}>
            {/* filled username field */}
            <div
               style={{
                  width: "62%",
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.14)",
               }}
            />
            {/* password field typing */}
            <motion.div
               animate={{ width: ["0%", "74%", "74%", "0%"] }}
               transition={{
                  duration: CYCLE,
                  repeat: Infinity,
                  times: [0, 0.32, 0.9, 1],
                  ease: "easeInOut",
               }}
               style={{
                  marginTop: 6,
                  height: 4,
                  borderRadius: 2,
                  background: "#60a5fa50",
               }}
            />
            {/* submit bar flashes after typing completes */}
            <motion.div
               animate={{ opacity: [0.35, 0.35, 1, 0.45, 0.35] }}
               transition={{
                  duration: CYCLE,
                  repeat: Infinity,
                  times: [0, 0.36, 0.42, 0.52, 1],
               }}
               style={{
                  marginTop: 8,
                  width: "100%",
                  height: 9,
                  borderRadius: 3,
                  background: "#2563eb",
               }}
            />
         </div>
      </div>

      {/* JWT token pill traveling the hairline */}
      <div
         style={{
            position: "absolute",
            left: "32%",
            top: "48%",
            width: "44%",
            height: 0,
         }}
      >
         <motion.div
            animate={{
               left: ["2%", "2%", "2%", "76%", "76%"],
               opacity: [0, 0, 1, 1, 0],
            }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               times: [0, 0.4, 0.46, 0.72, 0.78],
               ease: "easeInOut",
            }}
            style={{
               position: "absolute",
               top: -8,
               padding: "3px 7px",
               borderRadius: 999,
               border: "1px solid #38bdf880",
               background: "#0b1012",
               lineHeight: 1,
            }}
         >
            <span style={{ ...label, fontSize: 7, color: "#38bdf8" }}>jwt</span>
         </motion.div>
      </div>

      {/* shield that verifies the token */}
      <div
         style={{
            position: "absolute",
            left: "76%",
            top: "37%",
            width: 34,
            height: 38,
         }}
      >
         <div
            style={{
               position: "absolute",
               inset: 0,
               border: "1px solid #60a5fa50",
               background: "#60a5fa08",
               borderRadius: "9px 9px 50% 50%",
            }}
         />
         {/* single pulse when the token lands */}
         <motion.div
            animate={{ opacity: [0, 0, 0.5, 0], scale: [0.9, 0.9, 1.3, 1.45] }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               times: [0, 0.72, 0.82, 0.95],
               ease: "easeOut",
            }}
            style={{
               position: "absolute",
               inset: 0,
               border: `1px solid ${tint}90`,
               borderRadius: "9px 9px 50% 50%",
            }}
         />
         {/* verified check */}
         <motion.div
            animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.4, 0.4, 1, 1, 0.4] }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               times: [0, 0.72, 0.78, 0.94, 1],
               ease: "easeOut",
            }}
            style={{
               position: "absolute",
               left: 11,
               top: 13,
               width: 12,
               height: 6,
               borderLeft: "2px solid #22c55e",
               borderBottom: "2px solid #22c55e",
               rotate: -45,
            }}
         />
      </div>

      {/* padlock, shackle bounces as it locks */}
      <div
         style={{
            position: "absolute",
            left: "79%",
            top: "12%",
            width: 22,
            height: 26,
         }}
      >
         <motion.div
            animate={{ y: [0, -3, 0, 0] }}
            transition={{
               duration: 3.2,
               repeat: Infinity,
               times: [0, 0.25, 0.5, 1],
               ease: "easeInOut",
            }}
            style={{
               position: "absolute",
               top: 0,
               left: 4,
               width: 14,
               height: 12,
               border: "2px solid #60a5fa60",
               borderBottom: "none",
               borderRadius: "7px 7px 0 0",
            }}
         />
         <div
            style={{
               position: "absolute",
               top: 10,
               left: 0,
               width: 22,
               height: 15,
               borderRadius: 4,
               border: `1px solid ${tint}70`,
               background: `${tint}12`,
            }}
         >
            <div
               style={{
                  position: "absolute",
                  left: 9,
                  top: 5,
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: tint,
               }}
            />
         </div>
      </div>

      {/* hash blinking under the form */}
      <motion.span
         animate={{ opacity: [0.25, 0.55, 0.25] }}
         transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
         style={{
            ...label,
            position: "absolute",
            left: "10%",
            bottom: "12%",
            fontSize: 8,
            color: "#f59e0b",
         }}
      >
         bcrypt
      </motion.span>
   </div>
);

export default AuthScene;
