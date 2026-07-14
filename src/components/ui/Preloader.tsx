import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import PreloaderContent from "./PreloaderContent";

const Preloader = () => {
   const [loading, setLoading] = useState<boolean>(true);
   const [progress, setProgress] = useState<number>(0);

   useEffect(() => {
      // Deterministic ease-out progress: predictable, no layout jitter.
      const DURATION_MS = 800;
      const start = performance.now();
      let raf = 0;

      const step = (now: number) => {
         const t = Math.min(1, (now - start) / DURATION_MS);
         // ease-out quadratic -- fast start, smooth finish
         const eased = 1 - (1 - t) * (1 - t);
         setProgress(eased * 100);
         if (t < 1) {
            raf = requestAnimationFrame(step);
         } else {
            setTimeout(() => setLoading(false), 200);
         }
      };

      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
   }, []);

   const displayProgress = Math.min(Math.round(progress), 100);

   return (
      <AnimatePresence>
         {loading && (
            <>
               {/* Top half */}
               <motion.div
                  initial={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{
                     duration: 0.7,
                     ease: [0.76, 0, 0.24, 1],
                     delay: 0.05,
                  }}
                  style={{
                     position: "fixed",
                     top: 0,
                     left: 0,
                     right: 0,
                     height: "50%",
                     zIndex: 201,
                     background: "rgba(6, 6, 16, 0.98)",
                     backdropFilter: "blur(40px)",
                     WebkitBackdropFilter: "blur(40px)",
                     borderBottom: "1px solid rgba(96, 165, 250, 0.1)",
                  }}
               />

               {/* Bottom half */}
               <motion.div
                  initial={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{
                     duration: 0.7,
                     ease: [0.76, 0, 0.24, 1],
                     delay: 0.05,
                  }}
                  style={{
                     position: "fixed",
                     bottom: 0,
                     left: 0,
                     right: 0,
                     height: "50%",
                     zIndex: 201,
                     background: "rgba(6, 6, 16, 0.98)",
                     backdropFilter: "blur(40px)",
                     WebkitBackdropFilter: "blur(40px)",
                     borderTop: "1px solid rgba(96, 165, 250, 0.1)",
                  }}
               />

               {/* Center content (sits on top of both halves) */}
               <PreloaderContent displayProgress={displayProgress} />
            </>
         )}
      </AnimatePresence>
   );
};

export default Preloader;
