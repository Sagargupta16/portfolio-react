import { Suspense, useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";
import useFreezeAnimations from "@hooks/useFreezeAnimations";
import useMotionPreference from "@hooks/useMotionPreference";
import type { EngagementSceneKey } from "@/types";
import { BASE_GRADIENT } from "./sceneParts";
import { ENGAGEMENT_SCENES } from "./sceneRegistry";

interface EngagementSceneProps {
   scene: EngagementSceneKey;
   tint: string;
   /** Slot box: size, aspect ratio, radius, margins. */
   style: CSSProperties;
   /** Melt the bottom edge into the card body below a banner. */
   fade?: boolean;
}

// Same idea as ProjectCover: a scene mounts only while its slot sits within
// this distance of the viewport, so a long modal never runs every loop.
const MOUNT_MARGIN = "300px 0px";

const BOTTOM_FADE: CSSProperties = {
   position: "absolute",
   inset: 0,
   pointerEvents: "none",
   background:
      "linear-gradient(180deg, transparent 72%, rgb(14 20 23 / 0.85) 100%)",
};

/**
 * Decorative slot for an engagement scene: lazy, mounted near the viewport,
 * frozen on its rest frame in Reduced mode and restarted when Full returns.
 */
const EngagementScene = ({
   scene,
   tint,
   style,
   fade = false,
}: Readonly<EngagementSceneProps>) => {
   const slotRef = useRef<HTMLDivElement>(null);
   const nearViewport = useInView(slotRef, { margin: MOUNT_MARGIN });
   const { preference } = useMotionPreference();
   useFreezeAnimations(slotRef);
   const Scene = ENGAGEMENT_SCENES[scene];

   return (
      <div
         ref={slotRef}
         aria-hidden="true"
         data-engagement-scene={scene}
         style={{
            position: "relative",
            overflow: "hidden",
            // the scene's own base, so mounting is seamless
            background: BASE_GRADIENT,
            ...style,
         }}
      >
         {nearViewport && (
            <Suspense fallback={null}>
               <Scene key={preference} tint={tint} />
            </Suspense>
         )}
         {fade && <div style={BOTTOM_FADE} />}
      </div>
   );
};

export default EngagementScene;
