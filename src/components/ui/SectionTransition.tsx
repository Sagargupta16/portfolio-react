import { useRef } from "react";
import { useScroll } from "motion/react";
import useReducedMotion from "@utils/useReducedMotion";
import {
   GradientSweep,
   GlowPulse,
   GeometricScatter,
   Beam,
} from "./transitionVariants";

const VARIANTS = {
   "gradient-sweep": GradientSweep,
   "glow-pulse": GlowPulse,
   "geometric-scatter": GeometricScatter,
   beam: Beam,
};

interface SectionTransitionProps {
   variant?: "gradient-sweep" | "glow-pulse" | "geometric-scatter" | "beam";
}

const SectionTransition = ({
   variant = "gradient-sweep",
}: SectionTransitionProps) => {
   const ref = useRef<HTMLDivElement>(null);
   const reducedMotion = useReducedMotion();

   const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"],
   });

   if (reducedMotion) {
      return <div className="section-divider" />;
   }

   const VariantRenderer = VARIANTS[variant] || VARIANTS["gradient-sweep"];

   return (
      <div
         ref={ref}
         style={{
            position: "relative",
            height: 80,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            pointerEvents: "none",
         }}
         aria-hidden="true"
      >
         <div style={{ width: "100%", position: "relative" }}>
            <VariantRenderer progress={scrollYProgress} />
         </div>
      </div>
   );
};

export default SectionTransition;
