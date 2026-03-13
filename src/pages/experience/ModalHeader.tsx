import { motion } from "motion/react";
import { X, Building2 } from "lucide-react";
import {
   TEXT_PRIMARY,
   TEXT_SECONDARY,
   CYAN,
   MONO_FONT,
} from "@/constants/theme";
import type { ProfessionalExperience } from "@/types";

interface ModalHeaderProps {
   experience: ProfessionalExperience;
   onClose: () => void;
   isMobile: boolean;
}

const ModalHeader = ({ experience, onClose, isMobile }: ModalHeaderProps) => (
   <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
         position: "sticky",
         top: 0,
         zIndex: 10,
         padding: isMobile ? "16px 16px 12px" : "20px 24px 16px",
         background: "rgba(12,12,28,0.9)",
         backdropFilter: "blur(20px)",
         WebkitBackdropFilter: "blur(20px)",
         borderBottom: "1px solid rgba(255,255,255,0.06)",
         borderRadius: "20px 20px 0 0",
      }}
   >
      <div
         style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
         }}
      >
         <Building2
            size={isMobile ? 16 : 18}
            style={{ color: CYAN, flexShrink: 0 }}
         />
         <h3
            style={{
               fontSize: isMobile ? 15 : 18,
               fontWeight: 700,
               color: TEXT_PRIMARY,
               flex: 1,
               minWidth: 0,
               overflow: "hidden",
               textOverflow: "ellipsis",
               whiteSpace: "nowrap",
            }}
         >
            {experience.company}
         </h3>
         <button
            onClick={onClose}
            aria-label="Close"
            style={{
               padding: 8,
               background: "rgba(255,255,255,0.06)",
               border: "1px solid rgba(255,255,255,0.1)",
               borderRadius: 10,
               cursor: "pointer",
               color: TEXT_SECONDARY,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               transition: "background 0.2s",
               flexShrink: 0,
            }}
         >
            <X size={16} />
         </button>
      </div>
      <p
         style={{
            fontSize: isMobile ? 11 : 13,
            color: CYAN,
            fontFamily: MONO_FONT,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
         }}
      >
         {experience.title} | {experience.date}
      </p>
   </motion.div>
);

export default ModalHeader;
