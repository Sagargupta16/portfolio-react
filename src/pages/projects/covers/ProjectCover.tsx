import { Suspense, useRef, type CSSProperties, type ReactNode } from "react";
import { useInView } from "motion/react";
import ErrorBoundary from "@components/common/ErrorBoundary";
import useFreezeAnimations from "@hooks/useFreezeAnimations";
import useMotionPreference from "@hooks/useMotionPreference";
import usePauseOffscreen from "@hooks/usePauseOffscreen";
import useSceneClock from "@hooks/useSceneClock";
import { getProjectCover } from "./coverRegistry";
import { BASE_GRADIENT } from "./kit/sceneTokens";

interface ProjectCoverProps {
   projectId: number;
   accent: string;
}

// A scene mounts only while its card sits within this distance of the
// viewport, so a 44-card grid never runs more than a few loops at once. Its
// loops wait for the card itself to be in view (usePauseOffscreen).
const SCENE_MOUNT_MARGIN = "300px 0px";

// Same base gradient every scene paints first, so a scene mounting over the
// placeholder is seamless.
const SCENE_PLACEHOLDER = BASE_GRADIENT;

const FILL: CSSProperties = { position: "absolute", inset: 0 };

// A failed scene chunk keeps the slot's placeholder, so the card neither
// shifts nor takes the whole Projects section down with it.
const SCENE_FAILED = <div style={{ ...FILL, background: SCENE_PLACEHOLDER }} />;

/**
 * 16:10 media slot at the top of a project card.
 * Every project renders an animated scene that is mounted only near the
 * viewport. It zooms subtly on card hover via the .project-cover-img class.
 */
const ProjectCover = ({ projectId, accent }: ProjectCoverProps) => {
   const cover = getProjectCover(projectId);
   const frameRef = useRef<HTMLDivElement>(null);
   const nearViewport = useInView(frameRef, { margin: SCENE_MOUNT_MARGIN });
   const { preference } = useMotionPreference();
   useFreezeAnimations(frameRef);
   usePauseOffscreen(frameRef);
   useSceneClock(frameRef);
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
            <ErrorBoundary fallback={SCENE_FAILED}>
               <Suspense fallback={<div className="skeleton" style={FILL} />}>
                  <cover.Scene
                     key={preference}
                     tint={accent}
                     variant={cover.variant}
                  />
               </Suspense>
            </ErrorBoundary>
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
                  "linear-gradient(180deg, transparent 72%, rgb(14 20 23 / 0.85) 100%)",
               pointerEvents: "none",
            }}
         />
      </div>
   );
};

export default ProjectCover;
