import { motion } from "motion/react";
import { MONO_FONT, BLUE, TEXT_MUTED } from "@/constants/theme";

interface PreloaderContentProps {
   displayProgress: number;
}

const PreloaderContent = ({ displayProgress }: PreloaderContentProps) => {
   return (
      <motion.div
         initial={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.4 }}
         style={{
            position: "fixed",
            inset: 0,
            zIndex: 202,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 24,
            pointerEvents: "none",
         }}
      >
         {/* SG logo tile */}
         <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
               width: 72,
               height: 72,
               borderRadius: 18,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               fontSize: 28,
               fontWeight: 800,
               fontFamily: MONO_FONT,
               color: "#0b1012",
               background: "#67e8f9",
               position: "relative",
               zIndex: 1,
            }}
         >
            SG
         </motion.div>

         {/* Progress bar */}
         <div
            style={{
               width: 160,
               height: 2,
               background: "rgba(255, 255, 255, 0.06)",
               borderRadius: 4,
               overflow: "hidden",
               position: "relative",
               zIndex: 1,
            }}
         >
            <motion.div
               style={{
                  height: "100%",
                  background: BLUE,
                  borderRadius: 4,
               }}
               initial={{ width: "0%" }}
               animate={{ width: `${displayProgress}%` }}
               transition={{ duration: 0.25, ease: "easeOut" }}
            />
         </div>

         {/* Percentage */}
         <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            style={{
               fontFamily: MONO_FONT,
               fontSize: 12,
               color: TEXT_MUTED,
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
