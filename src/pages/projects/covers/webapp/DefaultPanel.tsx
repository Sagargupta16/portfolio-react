import { motion } from "motion/react";
import { Backdrop } from "./StageParts";
import { EASE, WHITE_03, WHITE_10, span, type PanelProps } from "./shared";

/* Fallback for an unknown variant: one panel, three skeleton rows breathing. */

const ROWS = [0, 1, 2];

const DefaultPanel = ({ tint }: PanelProps) => (
   <>
      <Backdrop tint={tint} focus={{ x: 50, y: 44 }} texture="dots" />
      <div style={span(30, 70, 44)}>
         <div
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 4,
               padding: 6,
            }}
         >
            {ROWS.map((row) => (
               <motion.span
                  key={row}
                  initial={{ opacity: 0.25 }}
                  animate={{ opacity: [0.25, 0.7, 0.25] }}
                  transition={{
                     duration: 2.6,
                     repeat: Infinity,
                     delay: row * 0.4,
                     ease: [EASE, EASE],
                  }}
                  style={{
                     display: "block",
                     height: 8,
                     borderRadius: 3,
                     border: `1px solid ${WHITE_10}`,
                     background: row === 0 ? `${tint}0c` : WHITE_03,
                  }}
               />
            ))}
         </div>
      </div>
   </>
);

export default DefaultPanel;
