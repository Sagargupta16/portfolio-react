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

   const isImage = cover.kind === "image";
   let media: ReactNode;
   if (isImage) {
      // Screenshot framed like a device window on the accent gradient panel;
      // it grows from its top edge on card hover (.project-cover-img--framed).
      media = (
         <img
            src={cover.src}
            alt={`${title} screenshot`}
            loading="lazy"
            decoding="async"
            width={960}
            height={600}
            className="project-cover-img project-cover-img--framed"
            style={{
               position: "absolute",
               top: "9%",
               left: "7%",
               width: "86%",
               height: "91%",
               objectFit: "cover",
               objectPosition: "top",
               borderRadius: "10px 10px 0 0",
               border: "1px solid rgb(255 255 255 / 0.1)",
               borderBottom: "none",
               boxShadow: "0 12px 32px rgb(0 0 0 / 0.35)",
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
            // Gradient panel only behind framed screenshots; scenes paint their own.
            background: isImage
               ? `linear-gradient(150deg, color-mix(in srgb, ${accent} 34%, #0c1216) 0%, #0c1216 78%)`
               : "#0c1216",
         }}
      >
         {media}

         {/* Bottom fade so the media melts into the card body */}
         <div
            aria-hidden="true"
            style={{
               ...FILL,
               background: isImage
                  ? "linear-gradient(180deg, transparent 75%, rgb(14 20 23 / 0.75) 100%)"
                  : "linear-gradient(180deg, transparent 55%, rgb(14 20 23 / 0.9) 100%)",
               pointerEvents: "none",
            }}
         />
      </div>
   );
};

export default ProjectCover;
