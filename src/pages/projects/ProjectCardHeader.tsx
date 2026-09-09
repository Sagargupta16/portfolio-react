import { Users, Star } from "lucide-react";
import { AMBER } from "@/constants/theme";
import type { ProjectWithCategory } from "./projectConstants";

interface ProjectCardHeaderProps {
   data: ProjectWithCategory;
   isFeatured: boolean;
   isCollab: boolean;
}

const ProjectCardHeader = ({
   data,
   isFeatured,
   isCollab,
}: ProjectCardHeaderProps) => (
   <>
      <div className="project-card-meta">
         <span className="project-card-category">
            {isFeatured && <Star size={12} aria-hidden="true" />}
            {data.category}
         </span>
         <span>{data.date}</span>
      </div>
      <h3 className="project-card-title">{data.title}</h3>
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
               background: "rgba(245,158,11,0.08)",
               border: "1px solid rgba(245,158,11,0.15)",
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
