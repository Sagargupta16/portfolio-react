import { Calendar, Users, Star, FolderGit2 } from "lucide-react";
import { MONO_FONT, TEXT_PRIMARY, TEXT_MUTED, AMBER } from "@/constants/theme";
import type { CategoryColors, ProjectWithCategory } from "./portfolioConstants";

interface ProjectCardHeaderProps {
   data: ProjectWithCategory;
   colors: CategoryColors;
   isFeatured: boolean;
   isCollab: boolean;
}

const ProjectCardHeader = ({
   data,
   colors,
   isFeatured,
   isCollab,
}: ProjectCardHeaderProps) => (
   <>
      {/* Header: icon + title */}
      <div
         style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 12,
         }}
      >
         <div
            style={{
               width: 36,
               height: 36,
               borderRadius: 10,
               background: `${colors.bgAlpha}0.1)`,
               border: `1px solid ${colors.borderAlpha}0.2)`,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
               marginTop: 2,
            }}
         >
            {isFeatured ? (
               <Star size={18} style={{ color: colors.accent }} />
            ) : (
               <FolderGit2 size={18} style={{ color: colors.accent }} />
            )}
         </div>
         <div style={{ minWidth: 0, flex: 1 }}>
            <h3
               style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
                  lineHeight: 1.3,
               }}
            >
               {data.title}
            </h3>
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                  flexWrap: "wrap",
               }}
            >
               <span
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 4,
                     fontSize: 11,
                     color: TEXT_MUTED,
                     fontFamily: MONO_FONT,
                  }}
               >
                  <Calendar size={10} style={{ flexShrink: 0 }} />
                  {data.date}
               </span>
               {(isCollab || (isFeatured && data.team)) && data.team && (
                  <span
                     style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        color: colors.accent,
                        fontFamily: MONO_FONT,
                     }}
                  >
                     <Users size={10} style={{ flexShrink: 0 }} />
                     {data.team}
                  </span>
               )}
            </div>
         </div>
      </div>

      {/* Featured badge */}
      {isFeatured && (
         <div
            style={{
               display: "inline-flex",
               alignItems: "center",
               gap: 4,
               padding: "3px 10px",
               borderRadius: 6,
               background: `${colors.bgAlpha}0.08)`,
               border: `1px solid ${colors.borderAlpha}0.15)`,
               fontSize: 10,
               fontWeight: 700,
               color: colors.accent,
               letterSpacing: "0.05em",
               textTransform: "uppercase",
               marginBottom: 12,
               alignSelf: "flex-start",
            }}
         >
            <Star size={10} />
            Featured
         </div>
      )}

      {/* Achievement badge for collaborative */}
      {isCollab && data.achievement && (
         <div
            style={{
               display: "inline-flex",
               alignItems: "center",
               gap: 6,
               padding: "4px 10px",
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
