import { motion } from "motion/react";
import {
   CENTER_XY,
   CENTER_Y,
   CYCLE,
   WHITE_35,
   caption,
} from "./automation/sceneTokens";
import type { PipelineProps, StageLabels } from "./automation/sceneTokens";
import CarouselPipeline from "./automation/CarouselPipeline";
import BadgePipeline from "./automation/BadgePipeline";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/* Scheduled automation family: a cron clock fires a left-to-right pipeline
   that writes to a destination. Each variant owns its stages and output. */

type AutomationVariant = "instagram" | "badge";

interface VariantSpec {
   Pipeline: (props: PipelineProps) => React.JSX.Element;
   stages: StageLabels;
}

/* One row per variant, so a pipeline can never exist without its captions. */
const VARIANTS = {
   instagram: {
      Pipeline: CarouselPipeline,
      stages: ["BEDROCK", "CAROUSEL", "COMPOSIO"],
   },
   badge: {
      Pipeline: BadgePipeline,
      stages: ["BADGES.JSON", "CATEGORIZE", "README.MD"],
   },
} satisfies Record<AutomationVariant, VariantSpec>;

const DEFAULT_VARIANT: AutomationVariant = "instagram";

const isVariant = (key: string): key is AutomationVariant =>
   Object.hasOwn(VARIANTS, key);

/* An unknown key is a registry bug: say so in dev rather than silently
   rendering another project's pipeline. */
const resolveVariant = (variant?: string): AutomationVariant => {
   if (variant === undefined) {
      return DEFAULT_VARIANT;
   }
   if (isVariant(variant)) {
      return variant;
   }
   if (import.meta.env.DEV) {
      console.warn(
         `AutomationScene: unknown variant "${variant}", rendering "${DEFAULT_VARIANT}"`,
      );
   }
   return DEFAULT_VARIANT;
};

const HAND_BASE: React.CSSProperties = {
   position: "absolute",
   left: "50%",
   top: "50%",
   width: 2,
   borderRadius: 2,
   transformOrigin: "50% 100%",
   transform: "translate(-50%, -100%)",
};

/* -- left: clock face, minute hand sweeps once per cycle -- */
const ClockFace = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: "8%",
         top: "50%",
         transform: CENTER_Y,
      }}
   >
      <div
         style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: `1px solid ${tint}35`,
            background: `${tint}06`,
            position: "relative",
         }}
      >
         {[0, 90, 180, 270].map((deg) => (
            <div
               key={deg}
               style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 2,
                  height: 5,
                  background: `${tint}40`,
                  transform: `${CENTER_XY} rotate(${deg}deg) translateY(-23px)`,
               }}
            />
         ))}
         <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: CYCLE, repeat: Infinity, ease: "linear" }}
            style={{ position: "absolute", inset: 0 }}
         >
            <div style={{ ...HAND_BASE, height: 19, background: tint }} />
         </motion.div>
         <div
            style={{
               position: "absolute",
               inset: 0,
               transform: "rotate(60deg)",
            }}
         >
            <div style={{ ...HAND_BASE, height: 12, background: WHITE_35 }} />
         </div>
         <div
            style={{
               position: "absolute",
               left: "50%",
               top: "50%",
               width: 4,
               height: 4,
               borderRadius: "50%",
               background: tint,
               transform: CENTER_XY,
            }}
         />
      </div>
      <div style={caption(tint)}>CRON</div>
   </div>
);

const AutomationScene = ({ tint, variant }: CoverSceneProps) => {
   const { Pipeline, stages } = VARIANTS[resolveVariant(variant)];
   return (
      <div
         aria-hidden="true"
         style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
         }}
      >
         {/* tinted glow */}
         <div
            style={{
               position: "absolute",
               inset: 0,
               background: `radial-gradient(circle at 20% 45%, ${tint}14 0%, transparent 55%)`,
            }}
         />
         {/* dot-grid detail layer */}
         <div
            style={{
               position: "absolute",
               inset: 0,
               opacity: 0.06,
               backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
               backgroundSize: "22px 22px",
            }}
         />

         <ClockFace tint={tint} />
         <Pipeline tint={tint} stages={stages} />
      </div>
   );
};

export default AutomationScene;
