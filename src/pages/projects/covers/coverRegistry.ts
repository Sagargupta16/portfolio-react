import type { ComponentType } from "react";
import { lazy } from "react";

interface SceneCoverProps {
   tint: string;
   variant?: string;
}

type SceneComponent = ComponentType<SceneCoverProps>;

// Animated SVG scenes -- lazy so the Projects chunk stays lean; a scene mounts
// (and its chunk loads) when its card comes within 300 px of the viewport.
const InfraScene = lazy(() => import("./InfraScene"));
const McpScene = lazy(() => import("./McpScene"));
const MlScene = lazy(() => import("./MlScene"));
const MlopsScene = lazy(() => import("./MlopsScene"));
const GraphScene = lazy(() => import("./GraphScene"));
const GameScene = lazy(() => import("./GameScene"));
const DocsScene = lazy(() => import("./DocsScene"));
const AutomationScene = lazy(() => import("./AutomationScene"));
const WebAppScene = lazy(() => import("./WebAppScene"));
const GateScene = lazy(() => import("./GateScene"));
const TaxScene = lazy(() => import("./TaxScene"));
const PluginScene = lazy(() => import("./PluginScene"));
const GuideScene = lazy(() => import("./GuideScene"));
const GovernanceScene = lazy(() => import("./GovernanceScene"));
const AgentCoreScene = lazy(() => import("./AgentCoreScene"));
const DiagramScene = lazy(() => import("./DiagramScene"));
const ForgeScene = lazy(() => import("./ForgeScene"));
const BrainScene = lazy(() => import("./BrainScene"));
const WorkflowScene = lazy(() => import("./WorkflowScene"));
const GalleryScene = lazy(() => import("./GalleryScene"));
const ExtensionScene = lazy(() => import("./ExtensionScene"));
const LedgerScene = lazy(() => import("./LedgerScene"));
const PredictorScene = lazy(() => import("./PredictorScene"));
const LeaderboardScene = lazy(() => import("./LeaderboardScene"));
const PortfolioScene = lazy(() => import("./PortfolioScene"));
const ArenaScene = lazy(() => import("./ArenaScene"));
const AmongUsScene = lazy(() => import("./AmongUsScene"));
const StudyHubScene = lazy(() => import("./StudyHubScene"));
const LibraryScene = lazy(() => import("./LibraryScene"));
const CostScene = lazy(() => import("./CostScene"));

type ProjectCover = {
   Scene: SceneComponent;
   variant?: string;
};

/**
 * Cover per project id (ids from data/projects.json).
 * Every project gets an animated scene of its real mechanism.
 */
const COVER_BY_ID: Record<number, ProjectCover> = {
   // Featured
   49: { Scene: MlopsScene }, // SageMaker Image Classification MLOps
   52: { Scene: GovernanceScene }, // AWS Organizations Governance on Control Tower
   61: { Scene: AgentCoreScene }, // AgentCore Harness Agent with Governed MCP Tools
   50: { Scene: GraphScene }, // Kinfolk (family DAG)
   44: { Scene: GalleryScene }, // Kalchar (kalchar.co.in)
   37: { Scene: ExtensionScene }, // GitScope (extension injecting into a GitHub profile)
   15: { Scene: LedgerScene }, // Ledger Sync
   2: { Scene: PredictorScene }, // LeetCode Rating Predictor
   13: { Scene: InfraScene }, // Blue Green AWS Terraform
   20: { Scene: LeaderboardScene }, // Instagram Likes Leaderboard
   3: { Scene: PortfolioScene }, // Personal Portfolio (this site)
   22: { Scene: McpScene, variant: "memory" }, // SelfHub

   // Collaborative
   39: { Scene: ArenaScene }, // Code Arena
   21: { Scene: WebAppScene, variant: "placement" }, // Placemento
   1: { Scene: WebAppScene, variant: "language" }, // Lingua Connect
   4: { Scene: AmongUsScene }, // LeetCode Among Us (collab id 4)
   23: { Scene: WebAppScene, variant: "directory" }, // MCA NITW Website
   27: { Scene: StudyHubScene }, // Noobathon (Study HUB)

   // Others
   51: { Scene: WebAppScene, variant: "contacts" }, // Orbit (personal CRM)
   46: { Scene: LibraryScene }, // Sagas (sagargupta.online/sagas)
   40: { Scene: AutomationScene, variant: "instagram" }, // Instagram Autopilot
   7: { Scene: InfraScene, variant: "pipeline" }, // AWS DevOps Infrastructure (GitHub Actions -> ECR -> ECS)
   14: { Scene: MlScene }, // Stock Market Prediction
   11: { Scene: WebAppScene, variant: "social" }, // Brainstorm Verse
   5: { Scene: WebAppScene, variant: "travel" }, // Tour Vibes
   12: { Scene: GameScene, variant: "pacman" },
   16: { Scene: GameScene, variant: "minesweeper" },
   17: { Scene: GameScene, variant: "snake" },
   18: { Scene: GameScene, variant: "flappy" },

   // Community
   57: { Scene: DiagramScene }, // orrery
   58: { Scene: ForgeScene }, // svg-forge
   59: { Scene: BrainScene }, // agent-brain
   60: { Scene: WorkflowScene }, // Shared Workflows
   45: { Scene: DocsScene, variant: "lint" }, // skillcheck (npm CLI)
   47: { Scene: TaxScene }, // ITR Agent
   38: { Scene: PluginScene }, // Claude Skills
   36: { Scene: CostScene }, // Claude Cost Optimizer
   43: { Scene: McpScene, variant: "bedrock" }, // Bedrock Multi-Model MCP
   30: { Scene: GateScene, variant: "middleware" }, // MCP Toolkit
   35: { Scene: DocsScene, variant: "claude-recipes" }, // Claude Code Recipes
   31: { Scene: DocsScene, variant: "list" }, // Awesome MCP Servers
   32: { Scene: GuideScene }, // Deploy Guide
   33: { Scene: DocsScene, variant: "agent-recipes" }, // Agent Recipes
   34: { Scene: GateScene, variant: "git" }, // AI Git Hooks
   42: { Scene: AutomationScene, variant: "badge" }, // Credly Badge Action
   53: { Scene: AutomationScene, variant: "card-github" }, // GitHub Stats Card Action
   54: { Scene: AutomationScene, variant: "card-leetcode" }, // LeetCode Card Action
   55: { Scene: AutomationScene, variant: "card-oss" }, // OSS Contributions Card Action
   56: { Scene: AutomationScene, variant: "kit" }, // readme-kit
};

export const getProjectCover = (id: number): ProjectCover | undefined =>
   COVER_BY_ID[id];
