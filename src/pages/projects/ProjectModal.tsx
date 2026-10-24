import { useEffect, useCallback } from "react";
import useBreakpoint from "@hooks/useBreakpoint";
import useFocusTrap from "@hooks/useFocusTrap";
import useScrollLock from "@hooks/useScrollLock";
import ModalShell from "@components/ui/ModalShell";
import {
   getCategoryColors,
   type ProjectWithCategory,
} from "./projectConstants";
import ProjectModalHeader from "./ProjectModalHeader";
import ProjectModalBody from "./ProjectModalBody";
import ProjectCover from "./covers/ProjectCover";

interface ProjectModalProps {
   project: ProjectWithCategory | null;
   onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
   const { isMobile } = useBreakpoint();
   const dialogRef = useFocusTrap<HTMLDivElement>(project !== null);
   useScrollLock(project !== null);

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
      if (!project) return;
      document.addEventListener("keydown", onEsc);
      return () => document.removeEventListener("keydown", onEsc);
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
               {/* Same animated cover scene as the card */}
               <ProjectCover projectId={project.id} accent={colors.accent} />
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
