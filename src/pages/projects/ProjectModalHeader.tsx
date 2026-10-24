import { useEffect, useRef, useState } from "react";
import {
   Calendar,
   Check,
   CircleAlert,
   Link2,
   Users,
   Star,
   FolderGit2,
} from "lucide-react";
import ModalHeaderShell from "@components/ui/ModalHeaderShell";
import useMediaQuery from "@hooks/useMediaQuery";
import {
   TEXT_PRIMARY,
   TEXT_MUTED,
   MEDIA_QUERIES,
   MONO_FONT,
} from "@/constants/theme";
import { getSectionCopy } from "@data/sections";
import {
   filterLabel,
   type CategoryColors,
   type ProjectWithCategory,
} from "./projectConstants";
import { projectShareUrl, projectSlug } from "@utils/projectLink";
import { EvidenceBadges } from "./ProjectCardHeader";

interface ProjectModalHeaderProps {
   project: ProjectWithCategory;
   colors: CategoryColors;
   isMobile: boolean;
   onClose: () => void;
}

const COPY = getSectionCopy("projects").modal;

type CopyState = "idle" | "copied" | "failed";
const COPY_FEEDBACK = {
   idle: { Icon: Link2, text: COPY.copy_link },
   copied: { Icon: Check, text: COPY.link_copied },
   failed: { Icon: CircleAlert, text: COPY.copy_failed },
} as const;

// On touch, grows the 24px button's hit area to 44px without changing how it
// looks (as ModalHeaderShell does for close): inset counts from the 22px
// padding box, which the button's relative position makes the containing block.
const COPY_HIT_AREA: React.CSSProperties = {
   position: "absolute",
   inset: "-11px 0",
};

/** Copies a link that reopens exactly this project's details. */
const CopyLinkButton = ({ title }: { title: string }) => {
   const coarsePointer = useMediaQuery(MEDIA_QUERIES.coarse);
   const [state, setState] = useState<CopyState>("idle");
   const resetRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
   );
   useEffect(() => () => clearTimeout(resetRef.current), []);

   const copy = async () => {
      let next: CopyState = "copied";
      try {
         await navigator.clipboard.writeText(
            projectShareUrl(projectSlug(title)),
         );
      } catch {
         // Permission refused, or no clipboard outside a secure context.
         next = "failed";
      }
      setState(next);
      clearTimeout(resetRef.current);
      resetRef.current = setTimeout(() => setState("idle"), 1600);
   };
   const { Icon, text } = COPY_FEEDBACK[state];
   return (
      <button
         type="button"
         onClick={() => void copy()}
         className="project-copy-link"
         style={{ position: "relative" }}
         aria-live="polite"
      >
         {coarsePointer && <span aria-hidden="true" style={COPY_HIT_AREA} />}
         <Icon size={11} aria-hidden="true" />
         {text}
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
         closeLabel={COPY.close}
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
                  fontSize: 11,
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
               {filterLabel(project.category)}
            </span>
            <EvidenceBadges project={project} />
            <CopyLinkButton title={project.title} />
         </div>
      </ModalHeaderShell>
   );
};

export default ProjectModalHeader;
