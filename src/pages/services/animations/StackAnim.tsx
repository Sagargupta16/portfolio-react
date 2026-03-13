import { motion } from "motion/react";
import { MONO_FONT, PURPLE, GREEN } from "@/constants/theme";

interface StackAnimProps {
   color: string;
}

const StackAnim = ({ color }: StackAnimProps) => (
   <div style={{ width: 80, height: 80, position: "relative" }}>
      {/* Browser frame (top-left) */}
      <div
         style={{
            position: "absolute",
            top: 2,
            left: 2,
            width: 36,
            height: 22,
            borderRadius: 4,
            border: "1px solid #06b6d430",
            background: "#06b6d406",
            overflow: "hidden",
         }}
      >
         <div
            style={{
               height: 7,
               background: "#06b6d40a",
               borderBottom: "1px solid #06b6d418",
            }}
         />
         <div
            style={{
               padding: "3px 4px",
               display: "flex",
               flexDirection: "column",
               gap: 2,
            }}
         >
            <motion.div
               animate={{ width: ["0%", "80%", "80%", "0%"] }}
               transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  times: [0, 0.2, 0.8, 1],
               }}
               style={{ height: 2, borderRadius: 1, background: "#06b6d440" }}
            />
            <motion.div
               animate={{ width: ["0%", "55%", "55%", "0%"] }}
               transition={{
                  duration: 3.5,
                  delay: 0.15,
                  repeat: Infinity,
                  times: [0, 0.2, 0.8, 1],
               }}
               style={{ height: 2, borderRadius: 1, background: "#06b6d425" }}
            />
         </div>
      </div>

      {/* API box (center) */}
      <div
         style={{
            position: "absolute",
            top: 30,
            left: 22,
            width: 36,
            height: 16,
            borderRadius: 4,
            border: "1px solid #a855f730",
            background: "#a855f706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         <span
            style={{
               fontSize: 6,
               fontFamily: MONO_FONT,
               fontWeight: 700,
               color: PURPLE,
            }}
         >
            {"{ API }"}
         </span>
      </div>

      {/* Database (bottom-right) */}
      <div
         style={{
            position: "absolute",
            top: 54,
            left: 38,
            width: 32,
            height: 18,
            borderRadius: "4px 4px 10px 10px",
            border: "1px solid #22c55e30",
            background: "#22c55e06",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         <span
            style={{
               fontSize: 6,
               fontFamily: MONO_FONT,
               fontWeight: 700,
               color: GREEN,
            }}
         >
            DB
         </span>
      </div>

      {/* Request: Browser -> API */}
      <motion.div
         animate={{ left: [18, 28], top: [18, 32] }}
         transition={{
            duration: 0.6,
            delay: 0.3,
            repeat: Infinity,
            repeatDelay: 2.9,
            ease: "easeInOut",
         }}
         style={{
            position: "absolute",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}`,
         }}
      />

      {/* Request: API -> DB */}
      <motion.div
         animate={{ left: [38, 50], top: [42, 56] }}
         transition={{
            duration: 0.6,
            delay: 1.1,
            repeat: Infinity,
            repeatDelay: 2.9,
            ease: "easeInOut",
         }}
         style={{
            position: "absolute",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: PURPLE,
            boxShadow: "0 0 6px #a855f780",
         }}
      />

      {/* Response: DB -> Browser */}
      <motion.div
         animate={{ left: [54, 40, 12], top: [58, 38, 14] }}
         transition={{
            duration: 1,
            delay: 2,
            repeat: Infinity,
            repeatDelay: 2.5,
            ease: "easeInOut",
         }}
         style={{
            position: "absolute",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: GREEN,
            boxShadow: "0 0 6px #22c55e80",
         }}
      />

      {/* 200 OK flash */}
      <motion.div
         animate={{ opacity: [0, 0, 0, 1, 0], scale: [0.5, 0.5, 0.5, 1, 0.5] }}
         transition={{
            duration: 3.5,
            repeat: Infinity,
            times: [0, 0.7, 0.8, 0.88, 1],
         }}
         style={{
            position: "absolute",
            top: 4,
            left: 28,
            fontSize: 8,
            color: GREEN,
            fontWeight: 800,
            fontFamily: MONO_FONT,
         }}
      >
         200
      </motion.div>
   </div>
);

export default StackAnim;
