import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle } from "lucide-react";
import { CYAN, TEXT_PRIMARY, TEXT_MUTED } from "@/constants/theme";
import useReducedMotion from "@utils/useReducedMotion";

interface SendConfirmationProps {
   onReset: () => void;
   senderName: string;
}

const SendConfirmation = ({ onReset, senderName }: SendConfirmationProps) => {
   const reducedMotion = useReducedMotion();
   const [stage, setStage] = useState<"typing" | "sent">(
      reducedMotion ? "sent" : "typing",
   );

   useEffect(() => {
      if (reducedMotion) return;
      const typingTimer = setTimeout(() => setStage("sent"), 1500);
      return () => clearTimeout(typingTimer);
   }, [reducedMotion]);

   useEffect(() => {
      const resetTimer = setTimeout(onReset, 4000);
      return () => clearTimeout(resetTimer);
   }, [onReset]);

   return (
      <div
         className="glass-card"
         style={{
            padding: "48px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 280,
            textAlign: "center",
         }}
      >
         <AnimatePresence mode="wait">
            {stage === "typing" ? (
               <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  style={{
                     display: "flex",
                     gap: 8,
                     padding: "16px 28px",
                     borderRadius: 20,
                     background: "rgba(6,182,212,0.06)",
                     border: "1px solid rgba(6,182,212,0.15)",
                  }}
               >
                  {[0, 1, 2].map((i) => (
                     <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                           duration: 0.6,
                           repeat: Infinity,
                           delay: i * 0.15,
                           ease: "easeInOut",
                        }}
                        style={{
                           width: 8,
                           height: 8,
                           borderRadius: "50%",
                           background: CYAN,
                        }}
                     />
                  ))}
               </motion.div>
            ) : (
               <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                     duration: 0.4,
                     ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                     display: "flex",
                     flexDirection: "column",
                     alignItems: "center",
                     gap: 12,
                  }}
               >
                  <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                     }}
                  >
                     <CheckCircle size={48} style={{ color: CYAN }} />
                  </motion.div>
                  <h4
                     style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: TEXT_PRIMARY,
                     }}
                  >
                     Message sent!
                  </h4>
                  {senderName && (
                     <p style={{ fontSize: 14, color: TEXT_MUTED }}>
                        Thanks, {senderName}! I'll get back to you soon.
                     </p>
                  )}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default SendConfirmation;
