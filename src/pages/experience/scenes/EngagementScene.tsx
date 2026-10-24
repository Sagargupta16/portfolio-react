import { Suspense, useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";
import { LazyHairlineFigure } from "@/figures/hairline/HairlineFigure";
import { FRAMES } from "@/figures/hairline/stage";
import type { EngagementSceneKey } from "@/types";
import { ENGAGEMENT_SCENES } from "./sceneRegistry";

// The figure's plate colour, so mounting is seamless.
const PLATE = "#0c1216";

interface EngagementSceneProps {
   scene: EngagementSceneKey;
   tint: string;
   /** Slot box: size, aspect ratio, radius, margins. */
   style: CSSProperties;
   /** Melt the bottom edge into the card body below a banner. */
   fade?: boolean;
}

// Same idea as ProjectCover: a figure mounts only while its slot sits within
// this distance of the viewport, so a long modal never runs every figure.
const MOUNT_MARGIN = "300px 0px";

const BOTTOM_FADE: CSSProperties = {
   position: "absolute",
   inset: 0,
   pointerEvents: "none",
   background:
      "linear-gradient(180deg, transparent 72%, rgb(14 20 23 / 0.85) 100%)",
};

/**
 * Decorative slot for an engagement figure: lazy and mounted near the
 * viewport. The kit reads the motion preference itself (Reduced lands every
 * move at once and stops the tour), so nothing here remounts on it.
 */
const EngagementScene = ({
   scene,
   tint,
   style,
   fade = false,
}: Readonly<EngagementSceneProps>) => {
   const slotRef = useRef<HTMLDivElement>(null);
   const nearViewport = useInView(slotRef, { margin: MOUNT_MARGIN });
   const load = ENGAGEMENT_SCENES[scene];

   return (
      <div
         ref={slotRef}
         aria-hidden="true"
         data-engagement-scene={scene}
         style={{
            position: "relative",
            overflow: "hidden",
            background: PLATE,
            ...style,
         }}
      >
         {nearViewport && (
            <Suspense fallback={null}>
               <LazyHairlineFigure
                  load={load}
                  frame={FRAMES.banner}
                  tint={tint}
               />
            </Suspense>
         )}
         {fade && <div style={BOTTOM_FADE} />}
      </div>
   );
};

export default EngagementScene;
