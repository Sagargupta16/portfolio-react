import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import type { EngagementSceneKey } from "@/types";
import type { TintProps } from "@pages/projects/covers/kit/sceneTokens";

type EngagementScene = LazyExoticComponent<ComponentType<TintProps>>;

/**
 * Animated scene per `scene` key in data/experience.json (on a role or an
 * engagement). Lazy, so a scene
 * loads only when its slot nears the viewport. scripts/validate-data.js reads
 * the keys below, one per line, and fails on any key the data names but this
 * map lacks.
 */
export const ENGAGEMENT_SCENES: Record<EngagementSceneKey, EngagementScene> = {
   "landing-zone": lazy(() => import("./LandingZoneScene")),
   "security-controls": lazy(() => import("./SecurityControlsScene")),
   "tf-modernize": lazy(() => import("./TfModernizeScene")),
   "mlops-loop": lazy(() => import("./MlopsLoopScene")),
   "consulting-loop": lazy(() => import("./ConsultingLoopScene")),
   "aws-intern": lazy(() => import("./AwsInternScene")),
   "ikarus-devops": lazy(() => import("./IkarusDevopsScene")),
};
