import { useRef } from "react";
import { useInView } from "motion/react";
import type { ServiceKey } from "@/types";
import useFreezeAnimations from "@hooks/useFreezeAnimations";
import useMotionPreference from "@hooks/useMotionPreference";
import usePauseOffscreen from "@hooks/usePauseOffscreen";
import useSceneClock from "@hooks/useSceneClock";
import GovernanceAnim from "./animations/GovernanceAnim";
import PipelineAnim from "./animations/PipelineAnim";
import NetworkAnim from "./animations/NetworkAnim";
import MlopsLoopAnim from "./animations/MlopsLoopAnim";
import AgentToolAnim from "./animations/AgentToolAnim";
import StackAnim from "./animations/StackAnim";
import {
   ART_CANVAS,
   ART_SCALE_COMPACT,
   ART_SCALE_DESKTOP,
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
   "landing-zones": GovernanceAnim,
   "iac-cicd": PipelineAnim,
   "cloud-networking": NetworkAnim,
   "mlops-genai": MlopsLoopAnim,
   "agent-tooling": AgentToolAnim,
   "full-stack": StackAnim,
};

// A canvas mounts only while its card sits within this distance of the
// viewport (as the project covers do), so the six loops stop once the
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

   return (
      <div
         ref={frameRef}
         aria-hidden="true"
         style={{
            transform: `scale(${compact ? ART_SCALE_COMPACT : ART_SCALE_DESKTOP})`,
            transformOrigin: "center",
         }}
      >
         {nearViewport ? (
            <AnimComponent key={preference} color={color} />
         ) : (
            // Same footprint as the canvas, so mounting it shifts nothing.
            <div style={{ width: ART_CANVAS, height: ART_CANVAS }} />
         )}
      </div>
   );
};

export default ServiceAnimation;
