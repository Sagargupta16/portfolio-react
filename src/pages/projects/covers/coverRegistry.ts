import type { ComponentType } from "react";
import { lazy } from "react";

interface SceneCoverProps {
   tint: string;
   variant?: string;
}

type SceneComponent = ComponentType<SceneCoverProps>;

// Animated SVG scenes -- lazy so the Projects chunk stays lean; they only
// load when the section renders.
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
   kind: "scene";
   Scene: SceneComponent;
   variant?: string;
};

/**
 * Cover per project id (ids from data/projects.json).
 * Every project gets an animated scene of its real mechanism.
 */
const COVER_BY_ID: Record<number, ProjectCover> = {
   // Featured
   49: { kind: "scene", Scene: MlopsScene }, // SageMaker Image Classification MLOps
   52: { kind: "scene", Scene: GovernanceScene }, // AWS Organizations Governance on Control Tower
   61: { kind: "scene", Scene: AgentCoreScene }, // AgentCore Harness Agent with Governed MCP Tools
   50: { kind: "scene", Scene: GraphScene }, // Kinfolk (family DAG)
   44: { kind: "scene", Scene: GalleryScene }, // Kalchar (kalchar.co.in)
   37: { kind: "scene", Scene: ExtensionScene }, // GitScope (extension injecting into a GitHub profile)
   15: { kind: "scene", Scene: LedgerScene }, // Ledger Sync
   2: { kind: "scene", Scene: PredictorScene }, // LeetCode Rating Predictor
   13: { kind: "scene", Scene: InfraScene }, // Blue Green AWS Terraform
   20: { kind: "scene", Scene: LeaderboardScene }, // Instagram Likes Leaderboard
   3: { kind: "scene", Scene: PortfolioScene }, // Personal Portfolio (this site)
   22: { kind: "scene", Scene: McpScene, variant: "memory" }, // SelfHub

   // Collaborative
   39: { kind: "scene", Scene: ArenaScene }, // Code Arena
   21: { kind: "scene", Scene: WebAppScene, variant: "placement" }, // Placemento
   1: { kind: "scene", Scene: WebAppScene, variant: "language" }, // Lingua Connect
   4: { kind: "scene", Scene: AmongUsScene }, // LeetCode Among Us (collab id 4)
   23: { kind: "scene", Scene: WebAppScene, variant: "directory" }, // MCA NITW Website
   27: { kind: "scene", Scene: StudyHubScene }, // Noobathon (Study HUB)

   // Others
   51: { kind: "scene", Scene: WebAppScene, variant: "contacts" }, // Orbit (personal CRM)
   46: { kind: "scene", Scene: LibraryScene }, // Sagas (sagargupta.online/sagas)
   40: { kind: "scene", Scene: AutomationScene, variant: "instagram" }, // Instagram Autopilot
   7: { kind: "scene", Scene: InfraScene, variant: "pipeline" }, // AWS DevOps Infrastructure (GitHub Actions -> ECR -> ECS)
   14: { kind: "scene", Scene: MlScene }, // Stock Market Prediction
   11: { kind: "scene", Scene: WebAppScene, variant: "social" }, // Brainstorm Verse
   5: { kind: "scene", Scene: WebAppScene, variant: "travel" }, // Tour Vibes
   12: { kind: "scene", Scene: GameScene, variant: "pacman" },
   16: { kind: "scene", Scene: GameScene, variant: "minesweeper" },
   17: { kind: "scene", Scene: GameScene, variant: "snake" },
   18: { kind: "scene", Scene: GameScene, variant: "flappy" },

   // Community
   57: { kind: "scene", Scene: DiagramScene }, // orrery
   58: { kind: "scene", Scene: ForgeScene }, // svg-forge
   59: { kind: "scene", Scene: BrainScene }, // agent-brain
   60: { kind: "scene", Scene: WorkflowScene }, // Shared Workflows
   45: { kind: "scene", Scene: DocsScene, variant: "lint" }, // skillcheck (npm CLI)
   47: { kind: "scene", Scene: TaxScene }, // ITR Agent
   38: { kind: "scene", Scene: PluginScene }, // Claude Skills
   36: { kind: "scene", Scene: CostScene }, // Claude Cost Optimizer
   43: { kind: "scene", Scene: McpScene, variant: "bedrock" }, // Bedrock Multi-Model MCP
   30: { kind: "scene", Scene: GateScene, variant: "middleware" }, // MCP Toolkit
   35: { kind: "scene", Scene: DocsScene, variant: "claude-recipes" }, // Claude Code Recipes
   31: { kind: "scene", Scene: DocsScene, variant: "list" }, // Awesome MCP Servers
   32: { kind: "scene", Scene: GuideScene }, // Deploy Guide
   33: { kind: "scene", Scene: DocsScene, variant: "agent-recipes" }, // Agent Recipes
   34: { kind: "scene", Scene: GateScene, variant: "git" }, // AI Git Hooks
   42: { kind: "scene", Scene: AutomationScene, variant: "badge" }, // Credly Badge Action
   53: { kind: "scene", Scene: AutomationScene, variant: "card-github" }, // GitHub Stats Card Action
   54: { kind: "scene", Scene: AutomationScene, variant: "card-leetcode" }, // LeetCode Card Action
   55: { kind: "scene", Scene: AutomationScene, variant: "card-oss" }, // OSS Contributions Card Action
   56: { kind: "scene", Scene: AutomationScene, variant: "kit" }, // readme-kit
};

export const getProjectCover = (id: number): ProjectCover | undefined =>
   COVER_BY_ID[id];
