import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { staggerContainer } from "@utils/animations";
import FooterContent from "./FooterContent";

const KONAMI: string[] = [
   "ArrowUp",
   "ArrowUp",
   "ArrowDown",
   "ArrowDown",
   "ArrowLeft",
   "ArrowRight",
   "ArrowLeft",
   "ArrowRight",
   "b",
   "a",
];

const Footer = () => {
   const [easterEgg, setEasterEgg] = useState(false);
   const [konamiIdx, setKonamiIdx] = useState(0);

   const handleKey = useCallback(
      (e: KeyboardEvent) => {
         if (e.key === KONAMI[konamiIdx]) {
            const next = konamiIdx + 1;
            if (next === KONAMI.length) {
               setEasterEgg(true);
               setKonamiIdx(0);
            } else {
               setKonamiIdx(next);
            }
         } else {
            setKonamiIdx(0);
         }
      },
      [konamiIdx],
   );

   useEffect(() => {
      globalThis.addEventListener("keydown", handleKey);
      return () => globalThis.removeEventListener("keydown", handleKey);
   }, [handleKey]);

   return (
      <footer
         style={{
            position: "relative",
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
         }}
      >
         {/* Gradient line at top */}
         <div
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               height: 1,
               background:
                  "linear-gradient(to right, transparent, rgba(6,182,212,0.25), transparent)",
            }}
         />

         <motion.div
            style={{
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               gap: 20,
               padding: "40px 24px",
               maxWidth: 1280,
               margin: "0 auto",
            }}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{}}
         >
            <FooterContent />

            {/* Easter egg */}
            {easterEgg && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  style={{
                     padding: "8px 16px",
                     borderRadius: 8,
                     background:
                        "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(168,85,247,0.15))",
                     border: "1px solid rgba(6,182,212,0.3)",
                     fontFamily: "JetBrains Mono, ui-monospace, monospace",
                     fontSize: 12,
                     color: "#06b6d4",
                     textAlign: "center",
                  }}
               >
                  You found the secret! Thanks for exploring.
               </motion.div>
            )}
         </motion.div>
      </footer>
   );
};

export default Footer;
