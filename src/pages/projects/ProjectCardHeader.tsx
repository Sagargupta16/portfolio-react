import { Pin, Users, Star } from "lucide-react";
import { AMBER } from "@/constants/theme";
import { getEvidence, STATUS_LABEL } from "@utils/projectEvidence";
import { getSectionCopy } from "@data/sections";
import type { Project } from "@/types";
import { filterLabel, type ProjectWithCategory } from "./projectConstants";

const COPY = getSectionCopy("projects").card;

interface ProjectCardHeaderProps {
   data: ProjectWithCategory;
   isFeatured: boolean;
   isCollab: boolean;
   spotlight: boolean;
}

interface EvidenceBadgesProps {
   project: Pick<
      Project,
      "organization" | "live" | "github" | "status" | "version"
   >;
   className?: string;
}

/**
 * Small pills: the project status (Active / Beta / Complete, with its
 * version), then proof (Published on aws-samples / Live / Open source).
 */
export const EvidenceBadges = ({ project, className }: EvidenceBadgesProps) => {
   const badges = getEvidence(project);

   return (
      <ul
         className={
            className ? `evidence-badges ${className}` : "evidence-badges"
         }
         aria-label={COPY.evidence_label}
      >
         <li
            className={`evidence-badge evidence-badge--status-${project.status}`}
         >
            <span className="evidence-dot" aria-hidden="true" />
            {STATUS_LABEL[project.status]}
            {project.version && (
               <>
                  {" "}
                  <span className="evidence-version">v{project.version}</span>
               </>
            )}
         </li>
         {badges.map((b) => (
            <li
               key={b.kind}
               className={`evidence-badge evidence-badge--${b.kind}`}
            >
               <span className="evidence-dot" aria-hidden="true" />
               {b.label}
            </li>
         ))}
      </ul>
   );
};

const ProjectCardHeader = ({
   data,
   isFeatured,
   isCollab,
   spotlight,
}: ProjectCardHeaderProps) => (
   <>
      <div className="project-card-meta">
         <span className="project-card-category">
            {spotlight ? (
               <Pin size={12} aria-hidden="true" />
            ) : (
               isFeatured && <Star size={12} aria-hidden="true" />
            )}
            {spotlight ? COPY.spotlight : filterLabel(data.category)}
         </span>
         <span>{data.date}</span>
      </div>
      <h3 className="project-card-title">{data.title}</h3>
      <EvidenceBadges project={data} className="project-card-evidence" />
      {(isCollab || isFeatured) && data.team && (
         <span className="project-card-team">
            <Users size={14} aria-hidden="true" />
            {data.team}
         </span>
      )}

      {/* Achievement badge for collaborative */}
      {isCollab && data.achievement && (
         <div
            style={{
               display: "inline-flex",
               alignItems: "center",
               gap: 4,
               padding: "4px 8px",
               borderRadius: 6,
               background: "rgb(var(--ch-amber) / 0.08)",
               border: "1px solid rgb(var(--ch-amber) / 0.15)",
               fontSize: 11,
               fontWeight: 600,
               color: AMBER,
               marginBottom: 12,
               alignSelf: "flex-start",
            }}
         >
            {data.achievement}
         </div>
      )}
   </>
);

export default ProjectCardHeader;
