import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
import { ChevronUp } from "lucide-react";
import useBreakpoint from "@hooks/useBreakpoint";
import { CYAN, GLASS_BORDER } from "@/constants/theme";

const SCROLL_THRESHOLD_PX = 500;

const BackToTop = () => {
   const { isMobile } = useBreakpoint();
   const [visible, setVisible] = useState(false);
   const lenis = useLenis();

   const handleScroll = useCallback(() => {
      setVisible(window.scrollY > SCROLL_THRESHOLD_PX);
   }, []);

   useEffect(() => {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
   }, [handleScroll]);

   const scrollToTop = () => {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
   };

   return (
      <AnimatePresence>
         {visible && (
            <motion.button
               onClick={scrollToTop}
               initial={{ opacity: 0, scale: 0.8, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: 20 }}
               whileHover={{
                  y: -2,
                  borderColor: "rgb(var(--ch-cyan) / 0.3)",
                  boxShadow:
                     "0 0 25px rgba(6,182,212,0.15), 0 4px 20px rgba(0,0,0,0.3)",
               }}
               whileTap={{ scale: 0.9 }}
               transition={{ duration: 0.25 }}
               style={{
                  position: "fixed",
                  bottom: isMobile ? 20 : 32,
                  right: isMobile ? 20 : 32,
                  zIndex: 50,
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: `1px solid ${GLASS_BORDER}`,
                  background: "rgb(var(--ch-glass) / 0.5)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  color: CYAN,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
               }}
               aria-label="Back to top"
            >
               <ChevronUp size={20} />
            </motion.button>
         )}
      </AnimatePresence>
   );
};

export default BackToTop;
