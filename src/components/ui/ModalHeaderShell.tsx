import type { ReactNode } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { TEXT_SECONDARY } from "@/constants/theme";

interface ModalHeaderShellProps {
   isMobile: boolean;
   onClose: () => void;
   closeLabel: string;
   children: ReactNode;
}

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Shared sticky header frame used by ExperienceModal and ProjectModal.
 * Provides the animated entrance, sticky positioning, backdrop blur, and the
 * close button in the top-right corner. Callers pass their title/metadata as
 * children and keep control over the inner layout.
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
      transition={{ delay: 0.1, duration: 0.4, ease: EXPO_EASE }}
      style={{
         position: "sticky",
         top: 0,
         zIndex: 10,
         padding: isMobile ? "16px 16px 12px" : "20px 24px 16px",
         background: "rgba(12,12,28,0.9)",
         backdropFilter: "blur(20px)",
         WebkitBackdropFilter: "blur(20px)",
         borderBottom: "1px solid rgba(255,255,255,0.06)",
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
               background: "rgba(255,255,255,0.06)",
               border: "1px solid rgba(255,255,255,0.1)",
               borderRadius: 10,
               cursor: "pointer",
               color: TEXT_SECONDARY,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
            }}
         >
            <X size={16} />
         </button>
         <div style={{ paddingRight: 44 }}>{children}</div>
      </div>
   </motion.div>
);

export default ModalHeaderShell;
