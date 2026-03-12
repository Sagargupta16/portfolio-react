import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import PreloaderContent from "./PreloaderContent";

const Preloader = () => {
   const [loading, setLoading] = useState<boolean>(true);
   const [progress, setProgress] = useState<number>(0);

   useEffect(() => {
      // Simulate loading progress
      const interval = setInterval(() => {
         setProgress((prev) => {
            if (prev >= 100) {
               clearInterval(interval);
               return 100;
            }
            const buf = new Uint32Array(1);
            globalThis.crypto.getRandomValues(buf);
            return prev + (buf[0] / 0xffffffff) * 25 + 15;
         });
      }, 60);

      const timer = setTimeout(() => {
         setProgress(100);
         setTimeout(() => setLoading(false), 200);
      }, 800);

      return () => {
         clearTimeout(timer);
         clearInterval(interval);
      };
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
                     borderBottom: "1px solid rgba(6, 182, 212, 0.1)",
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
                     borderTop: "1px solid rgba(6, 182, 212, 0.1)",
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
