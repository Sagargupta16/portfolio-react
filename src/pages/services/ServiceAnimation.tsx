import { useRef } from "react";
import useFreezeAnimations from "@hooks/useFreezeAnimations";
import useMotionPreference from "@hooks/useMotionPreference";
import GovernanceAnim from "./animations/GovernanceAnim";
import PipelineAnim from "./animations/PipelineAnim";
import NetworkAnim from "./animations/NetworkAnim";
import MlopsLoopAnim from "./animations/MlopsLoopAnim";
import AgentToolAnim from "./animations/AgentToolAnim";
import StackAnim from "./animations/StackAnim";
import { ART_SCALE_COMPACT, ART_SCALE_DESKTOP } from "./servicesConstants";

interface ServiceAnimationProps {
   title: string;
   color: string;
   /** Phone layout: the art sits in a strip above the copy. */
   compact?: boolean;
}

const ANIM_MAP: Record<string, React.FC<{ color: string }>> = {
   "Landing Zones & Cloud Governance": GovernanceAnim,
   "Infrastructure as Code & CI/CD": PipelineAnim,
   "Cloud Networking": NetworkAnim,
   "MLOps & GenAI on AWS": MlopsLoopAnim,
   "AI Agents & Developer Tooling": AgentToolAnim,
   "Full-Stack Product Builds": StackAnim,
};

const ServiceAnimation = ({
   title,
   color,
   compact = false,
}: Readonly<ServiceAnimationProps>) => {
   const AnimComponent = ANIM_MAP[title];
   const frameRef = useRef<HTMLDivElement>(null);
   const { preference } = useMotionPreference();
   useFreezeAnimations(frameRef);

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
         <AnimComponent key={preference} color={color} />
      </div>
   );
};

export default ServiceAnimation;
