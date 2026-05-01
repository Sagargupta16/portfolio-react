import { useEffect, useCallback } from "react";
import useBreakpoint from "@hooks/useBreakpoint";
import useFocusTrap from "@hooks/useFocusTrap";
import ModalShell from "@components/ui/ModalShell";
import {
   getCategoryColors,
   type ProjectWithCategory,
} from "./portfolioConstants";
import ProjectModalHeader from "./ProjectModalHeader";
import ProjectModalBody from "./ProjectModalBody";

interface ProjectModalProps {
   project: ProjectWithCategory | null;
   onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
   const { isMobile } = useBreakpoint();
   const dialogRef = useFocusTrap<HTMLDivElement>(project !== null);

   const onEsc = useCallback(
      (e: KeyboardEvent) => {
         if (e.key === "Escape") onClose();
      },
      [onClose],
   );

   useEffect(() => {
      if (!project) return;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onEsc);
      return () => {
         document.body.style.overflow = "";
         document.removeEventListener("keydown", onEsc);
      };
   }, [project, onEsc]);

   const colors = project
      ? getCategoryColors(project.category)
      : getCategoryColors("Others");
   const isFeatured = project?.category === "Featured";

   return (
      <ModalShell
         isOpen={Boolean(project)}
         onClose={onClose}
         dialogRef={dialogRef}
         isMobile={isMobile}
         titleId="project-modal-title"
      >
         {project && (
            <>
               {/* Category accent bar */}
               <div
                  style={{
                     height: isFeatured ? 4 : 3,
                     background: colors.gradient,
                     borderRadius: "20px 20px 0 0",
                  }}
               />
               <ProjectModalHeader
                  project={project}
                  colors={colors}
                  isMobile={isMobile}
                  onClose={onClose}
               />
               <ProjectModalBody
                  project={project}
                  colors={colors}
                  isMobile={isMobile}
               />
            </>
         )}
      </ModalShell>
   );
};

export default ProjectModal;
