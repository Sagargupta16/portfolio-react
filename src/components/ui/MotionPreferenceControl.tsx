import { motion } from "motion/react";
import { Accessibility, Sparkles } from "lucide-react";
import {
   DURATION,
   GLASS_BORDER,
   MONO_FONT,
   TEXT_PRIMARY,
} from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import useScrolledPast from "@hooks/useScrolledPast";
import type { MotionPreference } from "@hooks/motionPreferenceContext";
import { getUiCopy } from "@data/ui";
import { fillTemplate } from "@utils/fillTemplate";

// On phones the control would sit on the hero CTAs at the fold, so it waits
// for the first real scroll. Desktop shows it at once.
const PHONE_REVEAL_PX = 120;

const ORDER: MotionPreference[] = ["full", "reduced"];
const COPY = getUiCopy().motion;
const LABELS: Record<MotionPreference, string> = COPY.modes;

const PreferenceIcon = ({ preference }: { preference: MotionPreference }) => {
   if (preference === "reduced") return <Accessibility size={16} />;
   return <Sparkles size={16} />;
};

const MotionPreferenceControl = () => {
   const { isMobile } = useBreakpoint();
   const { preference, setPreference } = useMotionPreference();
   const pastFold = useScrolledPast(PHONE_REVEAL_PX);

   const shown = !isMobile || pastFold;
   const currentIndex = ORDER.indexOf(preference);
   const nextPreference = ORDER[(currentIndex + 1) % ORDER.length];
   const modeNames = {
      mode: LABELS[preference],
      next: LABELS[nextPreference],
   };

   return (
      <motion.button
         type="button"
         onClick={() => setPreference(nextPreference)}
         initial={false}
         animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 12 }}
         transition={{ duration: DURATION.quick }}
         aria-hidden={!shown}
         tabIndex={shown ? 0 : -1}
         whileHover={{ y: -2, scale: 1.02 }}
         whileTap={{ scale: 0.96 }}
         aria-label={fillTemplate(COPY.label, modeNames)}
         title={fillTemplate(COPY.title, modeNames)}
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
            boxShadow: "0 6px 24px rgb(var(--ch-black) / 0.35)",
            color: TEXT_PRIMARY,
            cursor: "pointer",
            fontFamily: MONO_FONT,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
         }}
      >
         <PreferenceIcon preference={preference} />
         {!isMobile && <span>{fillTemplate(COPY.button, modeNames)}</span>}
      </motion.button>
   );
};

export default MotionPreferenceControl;
