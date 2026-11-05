import { useEffect, useCallback } from "react";
import type { ProfessionalExperience } from "@/types";
import useBreakpoint from "@hooks/useBreakpoint";
import useFocusTrap from "@hooks/useFocusTrap";
import useScrollLock from "@hooks/useScrollLock";
import ModalShell from "@components/ui/ModalShell";
import { MAX_WIDTH_WIDE } from "@/constants/theme";
import ModalHeader from "./ModalHeader";
import ModalContent from "./ModalContent";

interface Props {
   experience: ProfessionalExperience | null;
   onClose: () => void;
}

const ExperienceModal = ({ experience, onClose }: Props) => {
   const { isMobile } = useBreakpoint();
   const dialogRef = useFocusTrap<HTMLDivElement>(experience !== null);
   useScrollLock(experience !== null);

   // A layer above (palette, open gloss) that handled this Escape already
   // called preventDefault, so one press closes only the topmost layer.
   const onEsc = useCallback(
      (e: KeyboardEvent) => {
         if (e.key !== "Escape" || e.defaultPrevented) return;
         e.preventDefault();
         onClose();
      },
      [onClose],
   );

   useEffect(() => {
      if (!experience) return;
      document.addEventListener("keydown", onEsc);
      return () => document.removeEventListener("keydown", onEsc);
   }, [experience, onEsc]);

   return (
      <ModalShell
         isOpen={Boolean(experience)}
         onClose={onClose}
         dialogRef={dialogRef}
         isMobile={isMobile}
         titleId="experience-modal-title"
         // Wide enough for two engagements side by side (ModalContent).
         maxWidth={MAX_WIDTH_WIDE}
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
