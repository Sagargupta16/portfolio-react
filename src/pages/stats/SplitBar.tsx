import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { EASING, MONO_FONT, TEXT_MUTED, TEXT_PRIMARY } from "@/constants/theme";
import useMotionPreference from "@hooks/useMotionPreference";
import { CAPTION_STYLE, type SplitSegment } from "./statsTokens";

// The whole bar grows from the left once it is in view, one node for every
// slice. Reduced starts at the end state.
const GROW: Variants = {
   hidden: { scaleX: 0 },
   visible: {
      scaleX: 1,
      transition: { duration: 1.1, ease: EASING.cinematic, delay: 0.15 },
   },
};

interface SplitBarProps {
   heading: string;
   segments: SplitSegment[];
}

/** A stacked share bar with a legend: top languages, solved by difficulty. */
const SplitBar = ({ heading, segments }: Readonly<SplitBarProps>) => {
   const { reducedMotion } = useMotionPreference();

   return (
      <motion.div
         initial={reducedMotion ? "visible" : "hidden"}
         whileInView="visible"
         viewport={{ once: true, amount: 0.6 }}
         style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
         <span style={CAPTION_STYLE}>{heading}</span>
         <div
            aria-hidden="true"
            style={{
               height: 8,
               borderRadius: 4,
               overflow: "hidden",
               background: "rgb(255 255 255 / 0.06)",
            }}
         >
            <motion.div
               variants={GROW}
               style={{
                  display: "flex",
                  gap: 2,
                  height: "100%",
                  transformOrigin: "left center",
               }}
            >
               {segments.map((segment) => (
                  <span
                     key={segment.key}
                     style={{
                        flex: `${segment.weight} 1 0`,
                        background: segment.color,
                     }}
                  />
               ))}
            </motion.div>
         </div>
         <ul
            style={{
               display: "flex",
               flexWrap: "wrap",
               gap: "6px 14px",
               margin: 0,
               padding: 0,
               listStyle: "none",
            }}
         >
            {segments.map((segment) => (
               <li
                  key={segment.key}
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 6,
                     fontFamily: MONO_FONT,
                     fontSize: 11,
                     color: TEXT_MUTED,
                  }}
               >
                  <span
                     aria-hidden="true"
                     style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: segment.color,
                        flexShrink: 0,
                     }}
                  />
                  <span style={{ color: TEXT_PRIMARY }}>{segment.label}</span>
                  {segment.display}
               </li>
            ))}
         </ul>
      </motion.div>
   );
};

export default SplitBar;
