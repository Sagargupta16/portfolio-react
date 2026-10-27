import { useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";
import type { ServiceKey } from "@/types";
import useFreezeAnimations from "@hooks/useFreezeAnimations";
import useMotionPreference from "@hooks/useMotionPreference";
import usePauseOffscreen from "@hooks/usePauseOffscreen";
import useSceneClock from "@hooks/useSceneClock";
import FdeAnim from "./animations/FdeAnim";
import GovernanceAnim from "./animations/GovernanceAnim";
import PipelineAnim from "./animations/PipelineAnim";
import NetworkAnim from "./animations/NetworkAnim";
import MlopsLoopAnim from "./animations/MlopsLoopAnim";
import AgentToolAnim from "./animations/AgentToolAnim";
import StackAnim from "./animations/StackAnim";
import {
   ART_CANVAS,
   ART_CANVAS_WIDE,
   ART_LABEL_PX,
   ART_SCALE_COMPACT,
   ART_SCALE_DESKTOP,
   isWideArt,
} from "./servicesConstants";

interface ServiceAnimationProps {
   /** Stable services.json `key`. */
   serviceKey: ServiceKey;
   color: string;
   /** Phone layout: the art sits in a strip above the copy. */
   compact?: boolean;
}

/**
 * Canvas per services.json `key`. scripts/validate-data.js reads the keys
 * below, one per line, and fails on any service whose key this map lacks.
 */
const ANIM_MAP: Record<ServiceKey, React.FC<{ color: string }>> = {
   "forward-deployed": FdeAnim,
   "landing-zones": GovernanceAnim,
   "iac-cicd": PipelineAnim,
   "cloud-networking": NetworkAnim,
   "mlops-genai": MlopsLoopAnim,
   "agent-tooling": AgentToolAnim,
   "full-stack": StackAnim,
};

// A canvas mounts only while its card sits within this distance of the
// viewport (as the project covers do), so the seven loops stop once the
// section scrolls away instead of running for the rest of the session.
const ART_MOUNT_MARGIN = "300px 0px";

const ServiceAnimation = ({
   serviceKey,
   color,
   compact = false,
}: Readonly<ServiceAnimationProps>) => {
   const AnimComponent = ANIM_MAP[serviceKey];
   const frameRef = useRef<HTMLDivElement>(null);
   const nearViewport = useInView(frameRef, { margin: ART_MOUNT_MARGIN });
   const { preference } = useMotionPreference();
   useFreezeAnimations(frameRef);
   usePauseOffscreen(frameRef);
   useSceneClock(frameRef);

   if (!AnimComponent) return null;

   const scale = compact ? ART_SCALE_COMPACT : ART_SCALE_DESKTOP;
   const width = isWideArt(serviceKey) ? ART_CANVAS_WIDE : ART_CANVAS;

   return (
      <div
         ref={frameRef}
         aria-hidden="true"
         style={
            {
               transform: `scale(${scale})`,
               transformOrigin: "center",
               // canvasKit's LABEL_SIZE: labels stay 8 px at any scale
               "--art-label": `${ART_LABEL_PX / scale}px`,
            } as CSSProperties
         }
      >
         {nearViewport ? (
            <AnimComponent key={preference} color={color} />
         ) : (
            // Same footprint as the canvas, so mounting it shifts nothing.
            <div style={{ width, height: ART_CANVAS }} />
         )}
      </div>
   );
};

export default ServiceAnimation;
