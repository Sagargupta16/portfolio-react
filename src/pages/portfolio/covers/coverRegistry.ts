import type { ComponentType } from "react";
import { lazy } from "react";

// Screenshot covers (deployed projects) -- 960x600 webp captured from the live sites
import gitscope from "@assets/projects/gitscope.webp";
import ledgerSync from "@assets/projects/ledger-sync.webp";
import leetcodeRatingPredictor from "@assets/projects/leetcode-rating-predictor.webp";
import instagramLikesLeaderboard from "@assets/projects/instagram-likes-leaderboard.webp";
import portfolioReact from "@assets/projects/portfolio-react.webp";
import codeArena from "@assets/projects/code-arena.webp";
import leetcodeAmongUs from "@assets/projects/leetcode-among-us.webp";
import noobathon from "@assets/projects/noobathon.webp";
import financialDashboard from "@assets/projects/financial-dashboard.webp";
import aiCodeTranslator from "@assets/projects/ai-code-translator.webp";
import contactManager from "@assets/projects/contact-manager.webp";
import musicWebApp from "@assets/projects/music-web-app.webp";
import claudeCostOptimizer from "@assets/projects/claude-cost-optimizer.webp";
import kalchar from "@assets/projects/kalchar.webp";
import sagas from "@assets/projects/sagas.webp";

export interface SceneCoverProps {
   tint: string;
   variant?: string;
}

type SceneComponent = ComponentType<SceneCoverProps>;

// Animated SVG scenes (undeployed projects) -- lazy so the Projects chunk
// stays lean; they only load when the section renders.
const InfraScene = lazy(() => import("./InfraScene"));
const McpScene = lazy(() => import("./McpScene"));
const MlScene = lazy(() => import("./MlScene"));
const GameScene = lazy(() => import("./GameScene"));
const DocsScene = lazy(() => import("./DocsScene"));
const AutomationScene = lazy(() => import("./AutomationScene"));
const AuthScene = lazy(() => import("./AuthScene"));
const WebAppScene = lazy(() => import("./WebAppScene"));

export type ProjectCover =
   | { kind: "image"; src: string }
   | { kind: "scene"; Scene: SceneComponent; variant?: string };

/**
 * Cover per project id (ids from data/projects.json).
 * Deployed -> live screenshot. Not deployed -> themed animated scene.
 */
const COVER_BY_ID: Record<number, ProjectCover> = {
   // Featured
   44: { kind: "image", src: kalchar }, // Kalchar (kalchar.co.in)
   37: { kind: "image", src: gitscope }, // GitScope (Chrome Web Store shot)
   15: { kind: "image", src: ledgerSync },
   2: { kind: "image", src: leetcodeRatingPredictor },
   13: { kind: "scene", Scene: InfraScene }, // Blue Green AWS Terraform
   20: { kind: "image", src: instagramLikesLeaderboard },
   3: { kind: "image", src: portfolioReact },
   22: { kind: "scene", Scene: McpScene, variant: "memory" }, // SelfHub

   // Collaborative
   39: { kind: "image", src: codeArena },
   21: { kind: "scene", Scene: WebAppScene, variant: "placement" }, // Placemento
   1: { kind: "scene", Scene: WebAppScene, variant: "language" }, // Lingua Connect
   4: { kind: "image", src: leetcodeAmongUs }, // LeetCode Among Us (collab id 4)
   23: { kind: "scene", Scene: WebAppScene }, // MCA NITW Website
   27: { kind: "image", src: noobathon },

   // Others
   46: { kind: "image", src: sagas }, // Sagas (sagargupta.online/sagas)
   40: { kind: "scene", Scene: AutomationScene, variant: "instagram" }, // Instagram Autopilot
   19: { kind: "image", src: financialDashboard },
   7: { kind: "scene", Scene: InfraScene }, // AWS DevOps Infrastructure
   24: { kind: "image", src: aiCodeTranslator },
   14: { kind: "scene", Scene: MlScene }, // Stock Market Prediction
   11: { kind: "scene", Scene: WebAppScene, variant: "social" }, // Brainstorm Verse
   26: { kind: "scene", Scene: AuthScene }, // Authentication System
   5: { kind: "scene", Scene: WebAppScene, variant: "travel" }, // Tour Vibes
   12: { kind: "scene", Scene: GameScene, variant: "pacman" },
   16: { kind: "scene", Scene: GameScene, variant: "minesweeper" },
   17: { kind: "scene", Scene: GameScene, variant: "snake" },
   18: { kind: "scene", Scene: GameScene, variant: "flappy" },
   6: { kind: "image", src: musicWebApp },

   // Community
   45: { kind: "scene", Scene: DocsScene, variant: "skills" }, // skillcheck (npm CLI)
   47: { kind: "scene", Scene: McpScene }, // ITR MCP
   38: { kind: "scene", Scene: DocsScene, variant: "skills" }, // Claude Skills
   36: { kind: "image", src: claudeCostOptimizer },
   43: { kind: "scene", Scene: McpScene, variant: "bedrock" }, // Bedrock Multi-Model MCP
   30: { kind: "scene", Scene: McpScene, variant: "toolkit" }, // MCP Toolkit
   35: { kind: "scene", Scene: DocsScene, variant: "recipes" }, // Claude Code Recipes
   31: { kind: "scene", Scene: DocsScene, variant: "list" }, // Awesome MCP Servers
   32: { kind: "scene", Scene: DocsScene, variant: "deploy" }, // Deploy Guide
   33: { kind: "scene", Scene: DocsScene, variant: "recipes" }, // Agent Recipes
   34: { kind: "scene", Scene: AutomationScene, variant: "git" }, // AI Git Hooks
   42: { kind: "scene", Scene: AutomationScene, variant: "badge" }, // Credly Badge Action
};

// "Others" list has a second project with id 4 (Contact Manager) colliding with
// LeetCode Among Us in collaborative. Disambiguate by title at lookup time.
const COVER_BY_TITLE: Record<string, ProjectCover> = {
   "Contact Manager": { kind: "image", src: contactManager },
};

export const getProjectCover = (
   id: number,
   title: string,
): ProjectCover | undefined => COVER_BY_TITLE[title] ?? COVER_BY_ID[id];
