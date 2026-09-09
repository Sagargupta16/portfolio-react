import GitVariant from "./gate/GitVariant";
import MiddlewareVariant from "./gate/MiddlewareVariant";
import type { TintProps } from "./gate/sceneTokens";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/*
 * Gate family: a request enters an ordered gate chain and passes, is rejected
 * (amber) or short-circuits, with a green verdict at the end.
 *   middleware -- MCP Toolkit: client -> CORS / AUTH / RATE / CACHE -> handler.
 *   git        -- AI Git Hooks: staged diff -> AI review -> shield -> commit,
 *                 plus an always-on pre-push secret scan footer.
 * Each variant and the shared stage/signal primitives live in ./gate.
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
