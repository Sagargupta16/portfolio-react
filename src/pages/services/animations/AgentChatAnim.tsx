import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface AgentChatAnimProps {
   color: string;
}

const BUBBLE: React.CSSProperties = {
   padding: "4px 10px",
   borderRadius: 8,
   fontSize: 9,
   fontFamily: MONO_FONT,
   fontWeight: 600,
   maxWidth: 56,
   lineHeight: 1.3,
};

const AgentChatAnim = ({ color }: AgentChatAnimProps) => (
   <div
      style={{
         width: 80,
         height: 80,
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         gap: 5,
         padding: "0 4px",
      }}
   >
      {/* User message */}
      <motion.div
         animate={{
            x: [-20, 0, 0, 0],
            opacity: [0.2, 1, 1, 0.2],
         }}
         transition={{
            duration: 4.5,
            repeat: Infinity,
            times: [0, 0.08, 0.65, 0.8],
            ease: "easeOut",
         }}
         style={{
            ...BUBBLE,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.6)",
            alignSelf: "flex-start",
         }}
      >
         build this
      </motion.div>

      {/* Agent response */}
      <motion.div
         animate={{
            x: [15, 0, 0, 0],
            opacity: [0.1, 0.1, 1, 0.2],
         }}
         transition={{
            duration: 4.5,
            repeat: Infinity,
            times: [0, 0.2, 0.3, 0.8],
            ease: "easeOut",
         }}
         style={{
            ...BUBBLE,
            background: `${color}10`,
            border: `1px solid ${color}25`,
            color,
            alignSelf: "flex-end",
            display: "flex",
            alignItems: "center",
            gap: 3,
         }}
      >
         <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
         >
            on it
         </motion.span>
         <span style={{ fontSize: 7 }}>&#x2713;</span>
      </motion.div>

      {/* Code output */}
      <motion.div
         animate={{
            y: [8, 0, 0, 0],
            opacity: [0.1, 0.1, 1, 0.2],
         }}
         transition={{
            duration: 4.5,
            repeat: Infinity,
            times: [0, 0.4, 0.5, 0.8],
            ease: "easeOut",
         }}
         style={{
            ...BUBBLE,
            background: `${color}08`,
            border: `1px solid ${color}15`,
            color: `${color}cc`,
            alignSelf: "flex-end",
            fontSize: 8,
         }}
      >
         {"{ done }"}
      </motion.div>
   </div>
);

export default AgentChatAnim;
