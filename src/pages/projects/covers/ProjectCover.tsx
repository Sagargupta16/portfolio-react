import { Suspense, useRef, type CSSProperties, type ReactNode } from "react";
import { useInView } from "motion/react";
import { LazyHairlineFigure } from "@/figures/hairline/HairlineFigure";
import { FRAMES } from "@/figures/hairline/stage";
import { getProjectCover } from "./coverRegistry";

interface ProjectCoverProps {
   projectId: number;
   title: string;
   accent: string;
}

// A figure mounts only while its card sits within this distance of the
// viewport, so a 49-card grid never runs more than a few at once.
const MOUNT_MARGIN = "300px 0px";

// The figure's plate colour, so a figure mounting over the placeholder is seamless.
const PLATE = "#0c1216";

const FILL: CSSProperties = { position: "absolute", inset: 0 };

/**
 * 16:10 media slot at the top of a project card.
 * Every project renders a hairline figure of its mechanism, mounted only near
 * the viewport. It zooms subtly on card hover via the .project-cover-img class.
 */
const ProjectCover = ({ projectId, title, accent }: ProjectCoverProps) => {
   const cover = getProjectCover(projectId, title);
   const frameRef = useRef<HTMLDivElement>(null);
   const nearViewport = useInView(frameRef, { margin: MOUNT_MARGIN });
   if (!cover) return null;

   let media: ReactNode;
   if (nearViewport) {
      media = (
         <div
            className="project-cover-img"
            data-cover-scene=""
            aria-hidden="true"
            style={FILL}
         >
            <Suspense fallback={<div className="skeleton" style={FILL} />}>
               <LazyHairlineFigure
                  load={cover.load}
                  frame={FRAMES.cover}
                  tint={accent}
               />
            </Suspense>
         </div>
      );
   } else {
      media = <div aria-hidden="true" style={{ ...FILL, background: PLATE }} />;
   }

   return (
      <div
         ref={frameRef}
         className="project-cover"
         style={{
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: PLATE,
         }}
      >
         {media}

         {/* Bottom fade so the media melts into the card body */}
         <div
            aria-hidden="true"
            style={{
               ...FILL,
               background:
                  "linear-gradient(180deg, transparent 72%, rgb(14 20 23 / 0.85) 100%)",
               pointerEvents: "none",
            }}
         />
      </div>
   );
};

export default ProjectCover;
