import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Accessibility, Sparkles } from "lucide-react";
import { GLASS_BORDER, MONO_FONT, TEXT_PRIMARY } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import type { MotionPreference } from "@hooks/motionPreferenceContext";

// On phones the control would sit on the hero CTAs at the fold, so it waits
// for the first real scroll (same threshold as BackToTop). Desktop shows it at once.
const PHONE_REVEAL_PX = 120;

const ORDER: MotionPreference[] = ["full", "reduced"];
const LABELS: Record<MotionPreference, string> = {
   full: "Full",
   reduced: "Reduced",
};

const PreferenceIcon = ({ preference }: { preference: MotionPreference }) => {
   if (preference === "reduced") return <Accessibility size={16} />;
   return <Sparkles size={16} />;
};

const MotionPreferenceControl = () => {
   const { isMobile } = useBreakpoint();
   const { preference, setPreference } = useMotionPreference();
   const [pastFold, setPastFold] = useState(
      () => globalThis.window != null && window.scrollY > PHONE_REVEAL_PX,
   );

   useEffect(() => {
      const onScroll = () => setPastFold(window.scrollY > PHONE_REVEAL_PX);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
   }, []);

   const shown = !isMobile || pastFold;
   const currentIndex = ORDER.indexOf(preference);
   const nextPreference = ORDER[(currentIndex + 1) % ORDER.length];

   return (
      <motion.button
         type="button"
         onClick={() => setPreference(nextPreference)}
         initial={false}
         animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 12 }}
         transition={{ duration: 0.25 }}
         aria-hidden={!shown}
         tabIndex={shown ? 0 : -1}
         whileHover={{ y: -2, scale: 1.02 }}
         whileTap={{ scale: 0.96 }}
         aria-label={`Motion mode: ${LABELS[preference]}. Switch to ${LABELS[nextPreference]}`}
         title={`Motion: ${LABELS[preference]} (click for ${LABELS[nextPreference]})`}
         style={{
            position: "fixed",
            pointerEvents: shown ? "auto" : "none",
            left: isMobile ? 20 : 32,
            bottom: isMobile ? 20 : 32,
            zIndex: 30,
            minWidth: 44,
            height: 44,
            padding: isMobile ? 0 : "0 14px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 12,
            border: `1px solid ${GLASS_BORDER}`,
            background: "var(--color-bg-card)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
            color: TEXT_PRIMARY,
            cursor: "pointer",
            fontFamily: MONO_FONT,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
         }}
      >
         <PreferenceIcon preference={preference} />
         {!isMobile && <span>{LABELS[preference]} motion</span>}
      </motion.button>
   );
};

export default MotionPreferenceControl;
