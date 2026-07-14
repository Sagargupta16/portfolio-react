import { Suspense } from "react";
import { getProjectCover } from "./coverRegistry";

interface ProjectCoverProps {
   projectId: number;
   title: string;
   accent: string;
}

/**
 * 16:10 media slot at the top of a project card.
 * Deployed projects show a live screenshot (zooms subtly on card hover via
 * the .project-cover-img class); undeployed ones render an animated scene.
 */
const ProjectCover = ({ projectId, title, accent }: ProjectCoverProps) => {
   const cover = getProjectCover(projectId, title);
   if (!cover) return null;

   return (
      <div
         style={{
            position: "relative",
            aspectRatio: "16 / 10",
            overflow: "hidden",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "#0c1216",
         }}
      >
         {cover.kind === "image" ? (
            <img
               src={cover.src}
               alt={`${title} screenshot`}
               loading="lazy"
               decoding="async"
               width={960}
               height={600}
               className="project-cover-img"
               style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top",
               }}
            />
         ) : (
            <Suspense
               fallback={
                  <div
                     className="skeleton"
                     style={{ position: "absolute", inset: 0 }}
                  />
               }
            >
               <cover.Scene tint={accent} variant={cover.variant} />
            </Suspense>
         )}

         {/* Bottom fade so the media melts into the card body */}
         <div
            aria-hidden="true"
            style={{
               position: "absolute",
               inset: 0,
               background:
                  "linear-gradient(180deg, transparent 55%, rgb(14 20 23 / 0.9) 100%)",
               pointerEvents: "none",
            }}
         />
      </div>
   );
};

export default ProjectCover;
