import type { FigureModule } from "@/figures/hairline";
import type { EngagementSceneKey } from "@/types";

type FigureLoader = () => Promise<FigureModule>;

/**
 * Hairline figure per `scene` key in data/experience.json (on a role or an
 * engagement). Lazy, so a figure loads only when its slot nears the viewport.
 * scripts/validate-data.js reads the keys below, one per line, and fails on
 * any key the data names but this map lacks.
 */
export const ENGAGEMENT_SCENES: Record<EngagementSceneKey, FigureLoader> = {
   "landing-zone": () => import("@/figures/experience/landing-zone"),
   "security-controls": () => import("@/figures/experience/security-controls"),
   "tf-modernize": () => import("@/figures/experience/tf-modernize"),
   "mlops-loop": () => import("@/figures/experience/mlops-loop"),
   "consulting-loop": () => import("@/figures/experience/consulting-loop"),
   "aws-intern": () => import("@/figures/experience/aws-intern"),
   "ikarus-devops": () => import("@/figures/experience/ikarus-devops"),
};
