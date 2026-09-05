import { motion } from "motion/react";
import { Accessibility, Monitor, Sparkles } from "lucide-react";
import { MONO_FONT, TEXT_PRIMARY } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import type { MotionPreference } from "@hooks/motionPreferenceContext";

const ORDER: MotionPreference[] = ["full", "system", "reduced"];
const LABELS: Record<MotionPreference, string> = {
   full: "Full",
   system: "System",
   reduced: "Reduced",
};

const PreferenceIcon = ({ preference }: { preference: MotionPreference }) => {
   if (preference === "system") return <Monitor size={16} />;
   if (preference === "reduced") return <Accessibility size={16} />;
   return <Sparkles size={16} />;
};

const MotionPreferenceControl = () => {
   const { isMobile } = useBreakpoint();
   const { preference, setPreference } = useMotionPreference();
   const currentIndex = ORDER.indexOf(preference);
   const nextPreference = ORDER[(currentIndex + 1) % ORDER.length];

   return (
      <motion.button
         type="button"
         onClick={() => setPreference(nextPreference)}
         whileHover={{ y: -2, scale: 1.02 }}
         whileTap={{ scale: 0.96 }}
         aria-label={`Motion mode: ${LABELS[preference]}. Switch to ${LABELS[nextPreference]}`}
         title={`Motion: ${LABELS[preference]} (click for ${LABELS[nextPreference]})`}
         style={{
            position: "fixed",
            left: isMobile ? 20 : 32,
            bottom: isMobile ? 20 : 32,
            zIndex: 60,
            minWidth: 44,
            height: 44,
            padding: isMobile ? 0 : "0 14px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 12,
            border: "1px solid rgb(var(--ch-white) / 0.12)",
            background: "rgb(var(--ch-glass) / 0.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
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
