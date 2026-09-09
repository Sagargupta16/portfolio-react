import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp } from "lucide-react";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import useSectionNavigation from "@hooks/useSectionNavigation";
import { CYAN, DURATION, EASING, GLASS_BORDER } from "@/constants/theme";

const SCROLL_THRESHOLD_PX = 500;

/* Lift plus border tint; the black depth shadow below stays static. */
const HOVER_LIFT = { y: -2, borderColor: "rgb(var(--ch-cyan) / 0.3)" };

const BackToTop = () => {
   const { isMobile } = useBreakpoint();
   const [visible, setVisible] = useState(false);
   const { navigateToSection } = useSectionNavigation();
   const { reducedMotion } = useMotionPreference();
   const lift = reducedMotion ? undefined : HOVER_LIFT;

   const handleScroll = useCallback(() => {
      setVisible(window.scrollY > SCROLL_THRESHOLD_PX);
   }, []);

   useEffect(() => {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
   }, [handleScroll]);

   return (
      <AnimatePresence>
         {visible && (
            <motion.button
               onClick={() => navigateToSection("hero")}
               initial={{ opacity: 0, scale: 0.8, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: 20 }}
               whileHover={lift}
               whileFocus={lift}
               whileTap={{ scale: 0.9 }}
               transition={{ duration: DURATION.quick, ease: EASING.brisk }}
               style={{
                  position: "fixed",
                  bottom: isMobile ? 20 : 32,
                  right: isMobile ? 20 : 32,
                  zIndex: 30,
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: `1px solid ${GLASS_BORDER}`,
                  background: "rgb(var(--ch-glass) / 0.5)",
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
