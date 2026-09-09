import type { Easing } from "motion/react";
import { motion } from "motion/react";
import { PANEL, WHITE_03, WHITE_08, type PanelProps } from "./shared";

/* Fallback for an unknown variant: three skeleton rows breathing. */

const ROWS = [0, 1, 2];

/* One ease per keyframe segment, so the WAAPI opacity track breathes on the
   same curve the JS track would. */
const EASE: Easing = "easeInOut";

const DefaultPanel = ({ tint }: PanelProps) => (
   <div style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 4 }}>
      {ROWS.map((row) => (
         <motion.div
            key={row}
            animate={{ opacity: [0.25, 0.7, 0.25] }}
            transition={{
               duration: 2.6,
               repeat: Infinity,
               delay: row * 0.4,
               ease: [EASE, EASE],
            }}
            style={{
               height: 8,
               borderRadius: 3,
               border: `1px solid ${WHITE_08}`,
               background: row === 0 ? `${tint}0c` : WHITE_03,
               flexShrink: 0,
            }}
         />
      ))}
   </div>
);

export default DefaultPanel;
