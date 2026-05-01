import { Building2 } from "lucide-react";
import ModalHeaderShell from "@components/ui/ModalHeaderShell";
import { TEXT_PRIMARY, CYAN, MONO_FONT } from "@/constants/theme";
import type { ProfessionalExperience } from "@/types";

interface ModalHeaderProps {
   experience: ProfessionalExperience;
   onClose: () => void;
   isMobile: boolean;
}

const ModalHeader = ({ experience, onClose, isMobile }: ModalHeaderProps) => (
   <ModalHeaderShell
      isMobile={isMobile}
      onClose={onClose}
      closeLabel="Close experience details"
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
            id="experience-modal-title"
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
   </ModalHeaderShell>
);

export default ModalHeader;
