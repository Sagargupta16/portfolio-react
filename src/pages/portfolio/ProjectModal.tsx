import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import useBreakpoint from "@hooks/useBreakpoint";
import useFocusTrap from "@hooks/useFocusTrap";
import { EASING } from "@/constants/theme";
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

   return createPortal(
      <AnimatePresence>
         {project && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.25 }}
               onClick={onClose}
               style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 1000,
                  display: "flex",
                  alignItems: isMobile ? "flex-end" : "center",
                  justifyContent: "center",
                  padding: isMobile ? 0 : 20,
                  background: "rgba(0,0,0,0.3)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  overscrollBehavior: "contain",
               }}
            >
               <motion.div
                  ref={dialogRef}
                  initial={{
                     opacity: 0,
                     y: isMobile ? 100 : 50,
                     scale: 0.95,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                     opacity: 0,
                     y: isMobile ? 100 : 30,
                     scale: 0.97,
                  }}
                  transition={{ duration: 0.4, ease: EASING.cinematic }}
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="project-modal-title"
                  tabIndex={-1}
                  style={{
                     position: "relative",
                     width: "100%",
                     maxWidth: isMobile ? "100%" : 720,
                     maxHeight: isMobile ? "92vh" : "85vh",
                     overflowY: "auto",
                     borderRadius: isMobile ? "20px 20px 0 0" : 20,
                     border: "1px solid rgba(255,255,255,0.1)",
                     background:
                        "linear-gradient(180deg, rgba(15,15,30,0.98) 0%, rgba(8,8,20,0.99) 100%)",
                     boxShadow:
                        "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(6,182,212,0.04)",
                  }}
               >
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
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>,
      document.body,
   );
};

export default ProjectModal;
