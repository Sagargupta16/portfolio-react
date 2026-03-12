import { motion } from "motion/react";
import useReducedMotion from "@utils/useReducedMotion";
import { CYAN, PURPLE, PINK, AMBER } from "@/constants/theme";

const BLOBS = [
   {
      color: CYAN,
      rx: 300,
      ry: 220,
      opacity: 0.08,
      cx: [15, 55, 80, 30, 15],
      cy: [20, 60, 25, 75, 20],
      duration: 22,
   },
   {
      color: PURPLE,
      rx: 260,
      ry: 300,
      opacity: 0.07,
      cx: [75, 30, 60, 85, 75],
      cy: [70, 30, 80, 40, 70],
      duration: 18,
   },
   {
      color: PINK,
      rx: 280,
      ry: 240,
      opacity: 0.06,
      cx: [50, 80, 20, 65, 50],
      cy: [15, 55, 70, 35, 15],
      duration: 25,
   },
   {
      color: AMBER,
      rx: 240,
      ry: 280,
      opacity: 0.09,
      cx: [25, 70, 45, 10, 25],
      cy: [80, 20, 50, 40, 80],
      duration: 20,
   },
] as const;

const AuroraBlobs = () => {
   const reducedMotion = useReducedMotion();

   return (
      <div
         aria-hidden="true"
         style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            overflow: "hidden",
         }}
      >
         <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
         >
            <g style={{ filter: "blur(18px)" }}>
               {BLOBS.map((blob, i) => (
                  <motion.ellipse
                     key={i}
                     rx={blob.rx / 10}
                     ry={blob.ry / 10}
                     fill={blob.color}
                     opacity={blob.opacity}
                     animate={
                        reducedMotion
                           ? { cx: blob.cx[0], cy: blob.cy[0] }
                           : {
                                cx: blob.cx.map(String),
                                cy: blob.cy.map(String),
                             }
                     }
                     transition={
                        reducedMotion
                           ? undefined
                           : {
                                duration: blob.duration,
                                repeat: Infinity,
                                ease: "easeInOut",
                             }
                     }
                  />
               ))}
            </g>
         </svg>
      </div>
   );
};

export default AuroraBlobs;
