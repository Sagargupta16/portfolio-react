import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { staggerContainer } from "@utils/animations";
import { MONO_FONT, TEXT_PRIMARY } from "@/constants/theme";
import { getUiCopy } from "@data/ui";
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
].map((key) => key.toLowerCase());
const KONAMI_CODE = KONAMI.join(" ");
// Pressed on their own for a capital B or A; they are not part of the code.
const MODIFIER_KEYS = new Set(["shift", "capslock"]);

const Footer = () => {
   const [easterEgg, setEasterEgg] = useState(false);

   // Matches the last ten keys rather than stepping an index, so a near miss
   // such as a third ArrowUp still completes, and B/A match in any case.
   useEffect(() => {
      let recent: string[] = [];
      const handleKey = (e: KeyboardEvent) => {
         // Autofill dispatches keydown without a key.
         const key = e.key?.toLowerCase();
         if (!key || MODIFIER_KEYS.has(key)) return;
         recent = [...recent, key].slice(-KONAMI.length);
         if (recent.join(" ") === KONAMI_CODE) {
            setEasterEgg(true);
            recent = [];
         }
      };
      globalThis.addEventListener("keydown", handleKey);
      return () => globalThis.removeEventListener("keydown", handleKey);
   }, []);

   return (
      <footer
         className="footer-fade"
         style={{
            position: "relative",
            borderTop: "1px solid rgb(var(--ch-white) / 0.06)",
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
            viewport={{ once: true }}
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
                     background: "rgb(var(--ch-white) / 0.08)",
                     border: "1px solid rgb(var(--ch-white) / 0.16)",
                     fontFamily: MONO_FONT,
                     fontSize: 12,
                     color: TEXT_PRIMARY,
                     textAlign: "center",
                     alignSelf: "center",
                  }}
               >
                  {getUiCopy().footer.easter_egg}
               </motion.div>
            )}
         </motion.div>
      </footer>
   );
};

export default Footer;
