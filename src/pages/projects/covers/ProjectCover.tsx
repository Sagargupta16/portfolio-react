import { Suspense, useRef, type CSSProperties, type ReactNode } from "react";
import { useInView } from "motion/react";
import useFreezeAnimations from "@hooks/useFreezeAnimations";
import useMotionPreference from "@hooks/useMotionPreference";
import { getProjectCover } from "./coverRegistry";

interface ProjectCoverProps {
   projectId: number;
   title: string;
   accent: string;
}

// A scene mounts only while its card sits within this distance of the
// viewport, so a 44-card grid never runs more than a few loops at once.
const SCENE_MOUNT_MARGIN = "300px 0px";

// Same base gradient every scene paints first, so a scene mounting over the
// placeholder is seamless.
const SCENE_PLACEHOLDER = "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)";

const FILL: CSSProperties = { position: "absolute", inset: 0 };

/**
 * 16:10 media slot at the top of a project card.
 * Deployed projects show a live screenshot; undeployed ones render an
 * animated scene that is mounted only near the viewport. Both zoom subtly
 * on card hover via the .project-cover-img class.
 */
const ProjectCover = ({ projectId, title, accent }: ProjectCoverProps) => {
   const cover = getProjectCover(projectId, title);
   const frameRef = useRef<HTMLDivElement>(null);
   const nearViewport = useInView(frameRef, { margin: SCENE_MOUNT_MARGIN });
   const { preference } = useMotionPreference();
   useFreezeAnimations(frameRef);
   if (!cover) return null;

   let media: ReactNode;
   if (cover.kind === "image") {
      media = (
         <img
            src={cover.src}
            alt={`${title} screenshot`}
            loading="lazy"
            decoding="async"
            width={960}
            height={600}
            className="project-cover-img"
            style={{
               ...FILL,
               width: "100%",
               height: "100%",
               objectFit: "cover",
               objectPosition: "top",
            }}
         />
      );
   } else if (nearViewport) {
      media = (
         <div
            className="project-cover-img"
            data-cover-scene=""
            aria-hidden="true"
            style={FILL}
         >
            <Suspense fallback={<div className="skeleton" style={FILL} />}>
               <cover.Scene
                  key={preference}
                  tint={accent}
                  variant={cover.variant}
               />
            </Suspense>
         </div>
      );
   } else {
      media = (
         <div
            aria-hidden="true"
            style={{ ...FILL, background: SCENE_PLACEHOLDER }}
         />
      );
   }

   return (
      <div
         ref={frameRef}
         className="project-cover"
         style={{
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "#0c1216",
         }}
      >
         {media}

         {/* Bottom fade so the media melts into the card body */}
         <div
            aria-hidden="true"
            style={{
               ...FILL,
               background:
                  "linear-gradient(180deg, transparent 55%, rgb(14 20 23 / 0.9) 100%)",
               pointerEvents: "none",
            }}
         />
      </div>
   );
};

export default ProjectCover;
