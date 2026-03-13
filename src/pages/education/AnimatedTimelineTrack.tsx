import { useRef } from "react";
import { motion, useInView } from "motion/react";
import useReducedMotion from "@utils/useReducedMotion";

const AnimatedTimelineTrack = () => {
   const ref = useRef<HTMLDivElement>(null);
   const isInView = useInView(ref, {
      once: false,
      margin: "0px 0px -50px 0px",
   });
   const reducedMotion = useReducedMotion();

   return (
      <div
         ref={ref}
         style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
         }}
      >
         {/* Timeline dot */}
         <motion.div
            initial={reducedMotion ? false : { scale: 0 }}
            animate={reducedMotion || isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
               width: 16,
               height: 16,
               borderRadius: "50%",
               border: "2px solid #a855f7",
               backgroundColor: "rgba(6, 6, 16, 0.6)",
               marginTop: 6,
               position: "relative",
               zIndex: 2,
               flexShrink: 0,
            }}
         >
            <div
               className="animate-glow-pulse"
               style={{
                  position: "absolute",
                  inset: 3,
                  borderRadius: "50%",
                  backgroundColor: "#a855f7",
               }}
            />
         </motion.div>

         {/* Timeline line */}
         <motion.div
            initial={reducedMotion ? false : { scaleY: 0 }}
            animate={reducedMotion || isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            style={{
               width: 2,
               flex: 1,
               background:
                  "linear-gradient(to bottom, rgba(168,85,247,0.4), rgba(168,85,247,0.1))",
               borderRadius: 1,
               transformOrigin: "top",
            }}
         />
      </div>
   );
};

export default AnimatedTimelineTrack;
