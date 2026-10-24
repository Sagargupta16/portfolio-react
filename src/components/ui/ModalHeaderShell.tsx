import type { ReactNode } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import {
   TEXT_SECONDARY,
   GLASS_BORDER,
   DURATION,
   EASING,
} from "@/constants/theme";

interface ModalHeaderShellProps {
   isMobile: boolean;
   onClose: () => void;
   closeLabel: string;
   children: ReactNode;
}

// Grows the close button's hit area to 44px (34px drawn) without changing how
// it looks: inset counts from the 32px padding box, which the button's own
// absolute position makes the containing block.
const CLOSE_HIT_AREA: React.CSSProperties = { position: "absolute", inset: -6 };

/**
 * Shared sticky header frame used by ExperienceModal and ProjectModal.
 * Provides the animated entrance, sticky positioning, an opaque fill (the
 * dialog's own colour, so nothing needs re-blurring on every scroll frame),
 * and the close button in the top-right corner. Callers pass their
 * title/metadata as children and keep control over the inner layout.
 */
const ModalHeaderShell = ({
   isMobile,
   onClose,
   closeLabel,
   children,
}: ModalHeaderShellProps) => (
   <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
         delay: 0.1,
         duration: DURATION.default,
         ease: EASING.cinematic,
      }}
      style={{
         position: "sticky",
         top: 0,
         zIndex: 10,
         padding: isMobile ? "16px 16px 12px" : "20px 24px 16px",
         background: "var(--color-bg-card)",
         borderBottom: `1px solid ${GLASS_BORDER}`,
      }}
   >
      <div style={{ position: "relative" }}>
         <button
            onClick={onClose}
            aria-label={closeLabel}
            style={{
               position: "absolute",
               top: 0,
               right: 0,
               padding: 8,
               background: "rgb(var(--ch-white) / 0.06)",
               border: "1px solid rgb(var(--ch-white) / 0.1)",
               borderRadius: 10,
               cursor: "pointer",
               color: TEXT_SECONDARY,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
            }}
         >
            <span aria-hidden="true" style={CLOSE_HIT_AREA} />
            <X size={16} />
         </button>
         <div style={{ paddingRight: 44 }}>{children}</div>
      </div>
   </motion.div>
);

export default ModalHeaderShell;
