import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/* MCP server hub -- clients around a central node, request/response pulses. */

const label: React.CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 1,
   textTransform: "uppercase",
};

interface ClientSpec {
   name: string;
   left: string;
   top: string;
}

const CLIENTS: ClientSpec[] = [
   { name: "CLAUDE", left: "12%", top: "18%" },
   { name: "IDE", left: "12%", top: "68%" },
   { name: "CLI", left: "78%", top: "18%" },
   { name: "AGENT", left: "78%", top: "68%" },
];

const VARIANT_CHIPS: Record<string, string[]> = {
   memory: ["STORE"],
   bedrock: ["LLAMA", "NOVA", "SD3.5"],
   toolkit: ["AUTH", "CACHE", "RATE"],
};

const McpScene = ({ tint, variant }: CoverSceneProps) => {
   const chips = VARIANT_CHIPS[variant ?? ""] ?? [];

   return (
      <div
         aria-hidden="true"
         style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
         }}
      >
         {/* Faint center glow */}
         <div
            style={{
               position: "absolute",
               left: "30%",
               top: "20%",
               width: "40%",
               height: "60%",
               borderRadius: "50%",
               background: `radial-gradient(ellipse at center, ${tint}14, transparent 70%)`,
            }}
         />

         {/* Connection hairlines (SVG so they track percentages) */}
         <svg
            viewBox="0 0 100 62"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
         >
            {[
               "M20,16 L44,29",
               "M20,46 L44,33",
               "M80,16 L56,29",
               "M80,46 L56,33",
            ].map((d) => (
               <path
                  key={d}
                  d={d}
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth="0.35"
                  fill="none"
               />
            ))}
         </svg>

         {/* Request pulses: client -> center, then response back */}
         {CLIENTS.map((c, i) => {
            const fromLeft = c.left === "12%";
            const dx = fromLeft ? 110 : -110;
            const fromTop = c.top === "18%";
            const dy = fromTop ? 52 : -52;
            return (
               <motion.span
                  key={`pulse-${c.name}`}
                  animate={{
                     x: [0, dx, dx, 0],
                     y: [0, dy, dy, 0],
                     opacity: [0, 1, 0.3, 0],
                  }}
                  transition={{
                     duration: 3.6,
                     repeat: Infinity,
                     delay: i * 0.9,
                     times: [0, 0.45, 0.55, 1],
                     ease: "easeInOut",
                  }}
                  style={{
                     position: "absolute",
                     left: `calc(${c.left} + 26px)`,
                     top: `calc(${c.top} + 12px)`,
                     width: 4,
                     height: 4,
                     borderRadius: "50%",
                     background: tint,
                  }}
               />
            );
         })}

         {/* Client nodes */}
         {CLIENTS.map((c) => (
            <div
               key={c.name}
               style={{
                  position: "absolute",
                  left: c.left,
                  top: c.top,
                  width: 54,
                  height: 24,
                  borderRadius: 5,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <span style={{ ...label, color: "rgba(255,255,255,0.55)" }}>
                  {c.name}
               </span>
            </div>
         ))}

         {/* Central MCP node */}
         <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
               position: "absolute",
               left: "50%",
               top: "50%",
               transform: "translate(-50%, -50%)",
               width: 64,
               height: 44,
               marginLeft: -32,
               marginTop: -22,
               borderRadius: 8,
               border: `1px solid ${tint}55`,
               background: `${tint}0a`,
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               justifyContent: "center",
               gap: 3,
            }}
         >
            <span style={{ ...label, fontSize: 9, color: tint }}>MCP</span>
            <div style={{ display: "flex", gap: 3 }}>
               {[0, 1, 2].map((i) => (
                  <motion.span
                     key={i}
                     animate={{ opacity: [0.2, 1, 0.2] }}
                     transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }}
                     style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "#22c55e",
                     }}
                  />
               ))}
            </div>
         </motion.div>

         {/* tools/list request label */}
         <motion.span
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, delay: 1.2 }}
            style={{
               ...label,
               position: "absolute",
               left: "28%",
               top: "36%",
               color: "rgba(255,255,255,0.4)",
               textTransform: "none",
            }}
         >
            tools/list
         </motion.span>

         {/* Variant chips under the hub */}
         {chips.length > 0 && (
            <div
               style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  bottom: "9%",
                  display: "flex",
                  gap: 6,
               }}
            >
               {chips.map((chip, i) => (
                  <motion.span
                     key={chip}
                     animate={
                        chips.length > 1
                           ? { opacity: [0.3, 1, 0.3] }
                           : { opacity: [0.5, 1, 0.5] }
                     }
                     transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        delay: i * 0.8,
                     }}
                     style={{
                        ...label,
                        padding: "3px 7px",
                        borderRadius: 4,
                        border: `1px solid ${tint}35`,
                        background: `${tint}08`,
                        color: `${tint}cc`,
                     }}
                  >
                     {chip}
                  </motion.span>
               ))}
            </div>
         )}
      </div>
   );
};

export default McpScene;
