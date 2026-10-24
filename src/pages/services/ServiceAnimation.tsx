import { Suspense, type CSSProperties } from "react";
import type { FigureModule } from "@/figures/hairline";
import { LazyHairlineFigure } from "@/figures/hairline/HairlineFigure";
import { FRAMES } from "@/figures/hairline/stage";
import {
   ART_CANVAS,
   ART_SCALE_COMPACT,
   ART_SCALE_DESKTOP,
} from "./servicesConstants";

interface ServiceAnimationProps {
   title: string;
   color: string;
   /** Phone layout: the art sits in a strip above the copy. */
   compact?: boolean;
}

/** Hairline figure per service, by exact title in data/services.json. */
const FIGURE_MAP: Record<string, () => Promise<FigureModule>> = {
   "Landing Zones & Cloud Governance": () =>
      import("@/figures/services/governance"),
   "Infrastructure as Code & CI/CD": () =>
      import("@/figures/services/pipeline"),
   "Cloud Networking": () => import("@/figures/services/network"),
   "MLOps & GenAI on AWS": () => import("@/figures/services/mlops"),
   "AI Agents & Developer Tooling": () => import("@/figures/services/agents"),
   "Full-Stack Product Builds": () => import("@/figures/services/fullstack"),
};

/**
 * A square slot sized directly (no CSS scale, so hairlines stay 0.9 px and
 * the read-out stays legible): 144 px beside the copy, 160 px in the phone
 * strip. The kit follows the site's motion preference itself.
 */
const ServiceAnimation = ({
   title,
   color,
   compact = false,
}: Readonly<ServiceAnimationProps>) => {
   const load = FIGURE_MAP[title];
   if (!load) return null;
   const size = ART_CANVAS * (compact ? ART_SCALE_COMPACT : ART_SCALE_DESKTOP);

   return (
      <div
         aria-hidden="true"
         style={
            {
               position: "relative",
               width: size,
               height: size,
               // the stage lets the column's accent light through; plates stay
               // opaque, filled with the card colour lit by that light
               "--hairline-stage": "transparent",
               "--hairline-plate": `color-mix(in srgb, var(--color-bg-card), ${color} 7%)`,
            } as CSSProperties
         }
      >
         <Suspense fallback={null}>
            <LazyHairlineFigure
               load={load}
               frame={FRAMES.service}
               tint={color}
            />
         </Suspense>
      </div>
   );
};

export default ServiceAnimation;
