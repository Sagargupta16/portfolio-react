import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface PipelineAnimProps {
   color: string;
}

const LOOP = 5;

const LINES = [
   { text: "$ git push", delay: 0, color: "rgba(255,255,255,0.5)" },
   { text: "  building...", delay: 0.8, color: "#f59e0b" },
   { text: "  testing...", delay: 1.8, color: "#a855f7" },
   { text: "  deployed", delay: 2.8, color: "#22c55e" },
];

const PipelineAnim = ({ color }: PipelineAnimProps) => (
   <div
      style={{
         width: 80,
         height: 80,
         borderRadius: 6,
         border: `1px solid ${color}20`,
         background: `${color}04`,
         overflow: "hidden",
         display: "flex",
         flexDirection: "column",
      }}
   >
      {/* Terminal chrome */}
      <div
         style={{
            height: 10,
            background: `${color}08`,
            borderBottom: `1px solid ${color}15`,
            display: "flex",
            alignItems: "center",
            gap: 3,
            paddingLeft: 5,
         }}
      >
         {[0, 1, 2].map((d) => (
            <div
               key={d}
               style={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: `${color}30`,
               }}
            />
         ))}
         <span
            style={{
               marginLeft: 6,
               fontSize: 5,
               fontFamily: MONO_FONT,
               fontWeight: 600,
               color: `${color}50`,
            }}
         >
            terminal
         </span>
      </div>

      {/* Terminal content */}
      <div
         style={{
            flex: 1,
            padding: "6px 6px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            justifyContent: "center",
         }}
      >
         {LINES.map((line) => (
            <motion.div
               key={line.text}
               animate={{
                  opacity: [0, 0, 1, 1, 0],
               }}
               transition={{
                  duration: LOOP,
                  repeat: Infinity,
                  times: [
                     0,
                     line.delay / LOOP,
                     (line.delay + 0.3) / LOOP,
                     0.85,
                     0.95,
                  ],
               }}
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
               }}
            >
               {line.text.includes("deployed") && (
                  <span style={{ fontSize: 7, color: "#22c55e" }}>
                     &#x2713;
                  </span>
               )}
               <span
                  style={{
                     fontSize: 7,
                     fontFamily: MONO_FONT,
                     fontWeight: 600,
                     color: line.color,
                  }}
               >
                  {line.text}
               </span>
            </motion.div>
         ))}

         {/* Blinking cursor */}
         <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
               width: 5,
               height: 8,
               background: `${color}60`,
               borderRadius: 1,
               marginTop: 2,
            }}
         />
      </div>
   </div>
);

export default PipelineAnim;
