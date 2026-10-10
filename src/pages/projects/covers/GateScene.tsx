import GitVariant from "./gate/GitVariant";
import MiddlewareVariant from "./gate/MiddlewareVariant";
import type { TintProps } from "./kit/sceneTokens";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/*
 * Gate family: a call or a commit passes an ordered series of checks; amber
 * marks a rejection, green a pass.
 *   middleware -- MCP Toolkit: a tool call runs the with* onion, CORS / AUTH /
 *                 RATE LIMIT / CACHE around the handler.
 *   git        -- AI Git Hooks: pre-commit review, the AI-written message,
 *                 the commit landing, then the pre-push scan.
 * Variants live in ./gate and draw with the shared stage kit in ./kit.
 */

const VARIANTS: Record<string, React.FC<TintProps>> = {
   middleware: MiddlewareVariant,
   git: GitVariant,
};

const GateScene = ({ tint, variant }: CoverSceneProps) => {
   const Variant = VARIANTS[variant ?? ""] ?? MiddlewareVariant;
   return <Variant tint={tint} />;
};

export default GateScene;
