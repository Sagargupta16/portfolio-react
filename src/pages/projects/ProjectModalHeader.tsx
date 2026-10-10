import { useState } from "react";
import { Calendar, Check, Link2, Users, Star, FolderGit2 } from "lucide-react";
import ModalHeaderShell from "@components/ui/ModalHeaderShell";
import { TEXT_PRIMARY, TEXT_MUTED, MONO_FONT } from "@/constants/theme";
import type { CategoryColors, ProjectWithCategory } from "./projectConstants";
import { projectShareUrl, projectSlug } from "@utils/projectLink";
import { EvidenceBadges } from "./ProjectCardHeader";

interface ProjectModalHeaderProps {
   project: ProjectWithCategory;
   colors: CategoryColors;
   isMobile: boolean;
   onClose: () => void;
}

/** Copies a link that reopens exactly this project's details. */
const CopyLinkButton = ({ title }: { title: string }) => {
   const [copied, setCopied] = useState(false);
   const copy = () => {
      void navigator.clipboard
         ?.writeText(projectShareUrl(projectSlug(title)))
         .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
         });
   };
   const Icon = copied ? Check : Link2;
   return (
      <button
         type="button"
         onClick={copy}
         className="project-copy-link"
         aria-live="polite"
      >
         <Icon size={11} aria-hidden="true" />
         {copied ? "Link copied" : "Copy link"}
      </button>
   );
};

const ProjectModalHeader = ({
   project,
   colors,
   isMobile,
   onClose,
}: ProjectModalHeaderProps) => {
   const isFeatured = project.category === "Featured";
   const IconComponent = isFeatured ? Star : FolderGit2;

   return (
      <ModalHeaderShell
         isMobile={isMobile}
         onClose={onClose}
         closeLabel="Close project details"
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
            <h2
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
            </h2>
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
            <EvidenceBadges project={project} />
            <CopyLinkButton title={project.title} />
         </div>
      </ModalHeaderShell>
   );
};

export default ProjectModalHeader;
