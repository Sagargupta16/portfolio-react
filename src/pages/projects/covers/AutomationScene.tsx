import type { PipelineProps } from "./automation/sceneTokens";
import CarouselPipeline from "./automation/CarouselPipeline";
import BadgePipeline from "./automation/BadgePipeline";
import GithubCardPipeline from "./automation/GithubCardPipeline";
import LeetcodeCardPipeline from "./automation/LeetcodeCardPipeline";
import OssCardPipeline from "./automation/OssCardPipeline";
import KitPipeline from "./automation/KitPipeline";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/* Automation family: GitHub Actions that fetch, render and publish on their
   own. Every variant reads left to right (source, processing, the artifact
   that lands) in one shared viewBox; each owns its trigger, so the cron
   dial shows only on the scheduled ones and readme-kit runs on a push. */

type AutomationVariant =
   "instagram" | "badge" | "card-github" | "card-leetcode" | "card-oss" | "kit";

interface VariantSpec {
   Pipeline: (props: PipelineProps) => React.JSX.Element;
   /** Focal point of the one tint wash, where the artifact lands. */
   focus: string;
}

const VARIANTS = {
   instagram: { Pipeline: CarouselPipeline, focus: "74% 44%" },
   badge: { Pipeline: BadgePipeline, focus: "72% 44%" },
   "card-github": { Pipeline: GithubCardPipeline, focus: "60% 45%" },
   "card-leetcode": { Pipeline: LeetcodeCardPipeline, focus: "56% 44%" },
   "card-oss": { Pipeline: OssCardPipeline, focus: "62% 42%" },
   kit: { Pipeline: KitPipeline, focus: "70% 44%" },
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

const FILL: React.CSSProperties = { position: "absolute", inset: 0 };

const AutomationScene = ({ tint, variant }: CoverSceneProps) => {
   const { Pipeline, focus } = VARIANTS[resolveVariant(variant)];
   return (
      <div
         aria-hidden="true"
         style={{
            ...FILL,
            overflow: "hidden",
            background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
         }}
      >
         {/* light: one faint wash where the artifact lands */}
         <div
            style={{
               ...FILL,
               background: `radial-gradient(circle at ${focus}, ${tint}1f 0%, transparent 60%)`,
            }}
         />
         {/* back layer: a static dot lattice at 5% white */}
         <div
            style={{
               ...FILL,
               opacity: 0.05,
               backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
               backgroundSize: "20px 20px",
            }}
         />
         <Pipeline tint={tint} />
      </div>
   );
};

export default AutomationScene;
