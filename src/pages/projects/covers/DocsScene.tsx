import type { ComponentType } from "react";
import AgentRecipesVariant from "./docs/AgentRecipesVariant";
import ClaudeRecipesVariant from "./docs/ClaudeRecipesVariant";
import LintVariant from "./docs/LintVariant";
import ListVariant from "./docs/ListVariant";
import { SceneRoot } from "./docs/primitives";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/*
 * Docs family: four repos that are markdown on the surface, each shown by its
 * own mechanism (files in covers/docs/, shared kit in docs/kit.ts and
 * docs/primitives.tsx):
 *   lint            skillcheck: rule head over SKILL.md -> SC013 / SC301 -> SARIF
 *   claude-recipes  Claude Code Recipes: cp into .claude/commands -> /refactor
 *   list            Awesome MCP Servers: row -> required checks -> README.md
 *   agent-recipes   Agent Recipes: The Prompt extracted -> any assistant
 * An unknown variant gets the bare backdrop rather than a generic document.
 */
const VARIANTS: Record<string, ComponentType<{ tint: string }>> = {
   lint: LintVariant,
   "claude-recipes": ClaudeRecipesVariant,
   list: ListVariant,
   "agent-recipes": AgentRecipesVariant,
};

const DocsScene = ({ tint, variant }: CoverSceneProps) => {
   const Variant: ComponentType<{ tint: string }> | undefined =
      VARIANTS[variant ?? ""];
   if (!Variant)
      return <SceneRoot tint={tint} focus="50% 40%" lattice="dots" />;
   return <Variant tint={tint} />;
};

export default DocsScene;
