import { motion } from "motion/react";

interface PreloaderContentProps {
   displayProgress: number;
}

const PreloaderContent = ({ displayProgress }: PreloaderContentProps) => {
   return (
      <motion.div
         initial={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.3 }}
         style={{
            position: "fixed",
            inset: 0,
            zIndex: 202,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 28,
            pointerEvents: "none",
         }}
      >
         {/* Ambient glow */}
         <div
            style={{
               position: "absolute",
               width: 400,
               height: 400,
               borderRadius: "50%",
               background:
                  "radial-gradient(circle, rgba(6, 182, 212, 0.12), transparent 70%)",
               filter: "blur(50px)",
            }}
         />

         {/* SG Logo */}
         <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
               fontSize: 52,
               fontWeight: 700,
               fontFamily: "JetBrains Mono, ui-monospace, monospace",
               color: "#06b6d4",
               letterSpacing: "0.05em",
               textShadow:
                  "0 0 30px rgba(6,182,212,0.5), 0 0 60px rgba(6,182,212,0.25)",
               position: "relative",
               zIndex: 1,
            }}
         >
            {"<SG />"}
         </motion.div>

         {/* Progress bar */}
         <div
            style={{
               width: 160,
               height: 2,
               background: "rgba(255, 255, 255, 0.04)",
               borderRadius: 2,
               overflow: "hidden",
               position: "relative",
               zIndex: 1,
            }}
         >
            <motion.div
               style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #06b6d4, #a855f7)",
                  borderRadius: 2,
               }}
               initial={{ width: "0%" }}
               animate={{ width: `${displayProgress}%` }}
               transition={{ duration: 0.15, ease: "easeOut" }}
            />
         </div>

         {/* Percentage */}
         <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            style={{
               fontFamily: "JetBrains Mono, ui-monospace, monospace",
               fontSize: 12,
               color: "#6e6e90",
               position: "relative",
               zIndex: 1,
            }}
         >
            {displayProgress}%
         </motion.span>
      </motion.div>
   );
};

export default PreloaderContent;
