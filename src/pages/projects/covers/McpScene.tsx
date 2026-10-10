import BedrockVariant from "./mcp/BedrockVariant";
import MemoryVariant from "./mcp/MemoryVariant";
import type { TintProps } from "./kit/sceneTokens";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/*
 * MCP server family.
 *   memory  -- SelfHub: CLAUDE stores a document in the MongoDB `memories`
 *              collection through the stdio server; VS CODE searches it back.
 *   bedrock -- Bedrock Multi-Model MCP: bedrock_compare fans one prompt out
 *              to three models over Converse and merges the answers.
 * Variants live in ./mcp and draw with the shared stage kit in ./kit.
 * An unknown variant falls back to memory, never to an idle box.
 */

const VARIANTS: Record<string, React.FC<TintProps>> = {
   memory: MemoryVariant,
   bedrock: BedrockVariant,
};

const McpScene = ({ tint, variant }: CoverSceneProps) => {
   const Variant = VARIANTS[variant ?? ""] ?? MemoryVariant;
   return <Variant tint={tint} />;
};

export default McpScene;
