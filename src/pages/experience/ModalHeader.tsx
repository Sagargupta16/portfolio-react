import { Building2 } from "lucide-react";
import ModalHeaderShell from "@components/ui/ModalHeaderShell";
import { getSectionCopy } from "@data/sections";
import { TEXT_PRIMARY, BLUE_LIGHT, MONO_FONT } from "@/constants/theme";
import { getOrgLogo } from "@utils/orgLogos";
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
      closeLabel={getSectionCopy("experience").modal.close}
   >
      <div
         style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
         }}
      >
         <span style={{ flexShrink: 0, display: "inline-flex" }}>
            {getOrgLogo(experience.company ?? "", isMobile ? 16 : 18) ?? (
               <Building2
                  size={isMobile ? 16 : 18}
                  style={{ color: BLUE_LIGHT }}
               />
            )}
         </span>
         <h2
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
         </h2>
      </div>
      <p
         style={{
            fontSize: isMobile ? 11 : 13,
            color: BLUE_LIGHT,
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
