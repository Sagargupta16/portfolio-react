import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { staggerContainer } from "@utils/animations";
import { MONO_FONT, TEXT_PRIMARY } from "@/constants/theme";
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
         className="footer-fade"
         style={{
            position: "relative",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
         }}
      >
         <motion.div
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 24,
               padding: "56px 24px 40px",
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
                     borderRadius: 10,
                     background: "rgba(255, 255, 255, 0.08)",
                     border: "1px solid rgba(255, 255, 255, 0.16)",
                     fontFamily: MONO_FONT,
                     fontSize: 12,
                     color: TEXT_PRIMARY,
                     textAlign: "center",
                     alignSelf: "center",
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
