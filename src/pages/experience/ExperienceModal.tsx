import { useEffect, useCallback } from "react";
import type { ProfessionalExperience } from "@/types";
import useBreakpoint from "@hooks/useBreakpoint";
import useFocusTrap from "@hooks/useFocusTrap";
import ModalShell from "@components/ui/ModalShell";
import ModalHeader from "./ModalHeader";
import ModalContent from "./ModalContent";

interface Props {
   experience: ProfessionalExperience | null;
   onClose: () => void;
}

const ExperienceModal = ({ experience, onClose }: Props) => {
   const { isMobile } = useBreakpoint();
   const dialogRef = useFocusTrap<HTMLDivElement>(experience !== null);

   const onEsc = useCallback(
      (e: KeyboardEvent) => {
         if (e.key === "Escape") onClose();
      },
      [onClose],
   );

   useEffect(() => {
      if (!experience) return;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onEsc);
      return () => {
         document.body.style.overflow = "";
         document.removeEventListener("keydown", onEsc);
      };
   }, [experience, onEsc]);

   return (
      <ModalShell
         isOpen={Boolean(experience)}
         onClose={onClose}
         dialogRef={dialogRef}
         isMobile={isMobile}
         titleId="experience-modal-title"
      >
         {experience && (
            <>
               <ModalHeader
                  experience={experience}
                  onClose={onClose}
                  isMobile={isMobile}
               />
               <ModalContent experience={experience} isMobile={isMobile} />
            </>
         )}
      </ModalShell>
   );
};

export default ExperienceModal;
