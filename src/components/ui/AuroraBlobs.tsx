import { motion } from "motion/react";
import useReducedMotion from "@utils/useReducedMotion";
import { CYAN, PURPLE, PINK, AMBER } from "@/constants/theme";

const BLOBS = [
   {
      color: CYAN,
      rx: 300,
      ry: 220,
      opacity: 0.08,
      x: [15, 55, 80, 30, 15],
      y: [20, 60, 25, 75, 20],
      duration: 22,
   },
   {
      color: PURPLE,
      rx: 260,
      ry: 300,
      opacity: 0.07,
      x: [75, 30, 60, 85, 75],
      y: [70, 30, 80, 40, 70],
      duration: 18,
   },
   {
      color: PINK,
      rx: 280,
      ry: 240,
      opacity: 0.06,
      x: [50, 80, 20, 65, 50],
      y: [15, 55, 70, 35, 15],
      duration: 25,
   },
   {
      color: AMBER,
      rx: 240,
      ry: 280,
      opacity: 0.09,
      x: [25, 70, 45, 10, 25],
      y: [80, 20, 50, 40, 80],
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
         {BLOBS.map((blob) => (
            <motion.div
               key={blob.color}
               animate={
                  reducedMotion
                     ? { left: `${blob.x[0]}%`, top: `${blob.y[0]}%` }
                     : {
                          left: blob.x.map((v) => `${v}%`),
                          top: blob.y.map((v) => `${v}%`),
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
               style={{
                  position: "absolute",
                  width: blob.rx,
                  height: blob.ry,
                  borderRadius: "50%",
                  background: blob.color,
                  opacity: blob.opacity,
                  filter: "blur(80px)",
                  transform: "translate(-50%, -50%)",
               }}
            />
         ))}
      </div>
   );
};

export default AuroraBlobs;
