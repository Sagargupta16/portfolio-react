import { useEffect, useRef, useState, type CSSProperties } from "react";
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
   const [stripWidth, setStripWidth] = useState(0);
   useFreezeAnimations(frameRef);
   usePauseOffscreen(frameRef);
   useSceneClock(frameRef);

   // Fit the canvas to the card's art strip (phones) or column (desktop),
   // never past its design scale: the lead canvas at 2x is 320 px, wider
   // than the phone strip on a screen under 354 px.
   useEffect(() => {
      const strip = frameRef.current?.parentElement;
      if (!strip) return;
      // ResizeObserver reports the first size on observe, so no read at mount.
      const observer = new ResizeObserver(([entry]) =>
         setStripWidth(entry.contentBoxSize[0].inlineSize),
      );
      observer.observe(strip);
      return () => observer.disconnect();
   }, []);

   const width = isWideArt(serviceKey) ? ART_CANVAS_WIDE : ART_CANVAS;
   const design = compact ? ART_SCALE_COMPACT : ART_SCALE_DESKTOP;
   const scale = stripWidth ? Math.min(design, stripWidth / width) : design;

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
