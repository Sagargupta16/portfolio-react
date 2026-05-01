import { motion } from "motion/react";
import { X, Calendar, Users, Star, FolderGit2 } from "lucide-react";
import {
   TEXT_PRIMARY,
   TEXT_SECONDARY,
   TEXT_MUTED,
   MONO_FONT,
} from "@/constants/theme";
import type { CategoryColors, ProjectWithCategory } from "./portfolioConstants";

interface ProjectModalHeaderProps {
   project: ProjectWithCategory;
   colors: CategoryColors;
   isMobile: boolean;
   onClose: () => void;
}

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const ProjectModalHeader = ({
   project,
   colors,
   isMobile,
   onClose,
}: ProjectModalHeaderProps) => {
   const isFeatured = project.category === "Featured";
   const IconComponent = isFeatured ? Star : FolderGit2;

   return (
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
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 8,
               marginBottom: 4,
            }}
         >
            <IconComponent
               size={isMobile ? 16 : 18}
               style={{ color: colors.accent, flexShrink: 0 }}
            />
            <h3
               id="project-modal-title"
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
               {project.title}
            </h3>
            <button
               onClick={onClose}
               aria-label="Close project details"
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
                  flexShrink: 0,
               }}
            >
               <X size={16} />
            </button>
         </div>

         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 12,
               flexWrap: "wrap",
            }}
         >
            <span
               style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: isMobile ? 11 : 12,
                  color: colors.accent,
                  fontFamily: MONO_FONT,
               }}
            >
               <Calendar size={11} style={{ flexShrink: 0 }} />
               {project.date}
            </span>
            {project.team && (
               <span
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 4,
                     fontSize: isMobile ? 11 : 12,
                     color: TEXT_MUTED,
                     fontFamily: MONO_FONT,
                  }}
               >
                  <Users size={11} style={{ flexShrink: 0 }} />
                  {project.team}
               </span>
            )}
            <span
               style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: colors.accent,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: `${colors.bgAlpha}0.1)`,
                  border: `1px solid ${colors.borderAlpha}0.2)`,
               }}
            >
               {project.category}
            </span>
         </div>
      </motion.div>
   );
};

export default ProjectModalHeader;
