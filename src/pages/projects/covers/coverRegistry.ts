import type { FigureModule } from "@/figures/hairline";

/** A hairline figure: its module loads once the cover slot nears the viewport. */
export type ProjectCover = {
   kind: "figure";
   load: () => Promise<FigureModule>;
};

/**
 * Cover per project id (ids from data/projects.json). Every cover is an
 * isometric line figure (src/figures/covers/) that shows the project's real
 * mechanism and answers the pointer. scripts/validate-data.js reads the
 * `<id>: {` keys below, so keep one entry per line.
 */
const COVER_BY_ID: Record<number, ProjectCover> = {
   // Featured
   49: {
      kind: "figure",
      load: () => import("@/figures/covers/sagemaker-mlops"),
   }, // SageMaker Image Classification MLOps
   52: {
      kind: "figure",
      load: () => import("@/figures/covers/org-governance"),
   }, // AWS Organizations Governance on Control Tower
   61: { kind: "figure", load: () => import("@/figures/covers/agentcore") }, // AgentCore Harness Agent with Governed MCP Tools
   44: { kind: "figure", load: () => import("@/figures/covers/kalchar") }, // Kalchar
   37: { kind: "figure", load: () => import("@/figures/covers/gitscope") }, // GitScope
   15: { kind: "figure", load: () => import("@/figures/covers/ledger-sync") }, // Ledger Sync
   2: {
      kind: "figure",
      load: () => import("@/figures/covers/rating-predictor"),
   }, // LeetCode Rating Predictor
   13: { kind: "figure", load: () => import("@/figures/covers/blue-green") }, // Blue Green AWS Terraform
   20: {
      kind: "figure",
      load: () => import("@/figures/covers/likes-leaderboard"),
   }, // Instagram Likes Leaderboard
   3: { kind: "figure", load: () => import("@/figures/covers/portfolio") }, // Personal Portfolio
   22: { kind: "figure", load: () => import("@/figures/covers/selfhub") }, // SelfHub

   // Collaborative
   39: { kind: "figure", load: () => import("@/figures/covers/code-arena") }, // Code Arena
   21: { kind: "figure", load: () => import("@/figures/covers/placemento") }, // Placemento
   1: { kind: "figure", load: () => import("@/figures/covers/lingua-connect") }, // Lingua Connect
   4: { kind: "figure", load: () => import("@/figures/covers/among-us") }, // LeetCode Among Us
   23: { kind: "figure", load: () => import("@/figures/covers/mca-nitw") }, // MCA NITW Website
   27: { kind: "figure", load: () => import("@/figures/covers/study-hub") }, // Noobathon (Study HUB)

   // Others
   50: { kind: "figure", load: () => import("@/figures/covers/kinfolk") }, // Kinfolk
   51: { kind: "figure", load: () => import("@/figures/covers/orbit") }, // Orbit
   46: { kind: "figure", load: () => import("@/figures/covers/sagas") }, // Sagas
   40: {
      kind: "figure",
      load: () => import("@/figures/covers/insta-autopilot"),
   }, // Instagram Autopilot
   7: { kind: "figure", load: () => import("@/figures/covers/farm-ecs") }, // AWS DevOps Infrastructure
   14: { kind: "figure", load: () => import("@/figures/covers/stock-lstm") }, // Stock Market Prediction
   11: {
      kind: "figure",
      load: () => import("@/figures/covers/brainstorm-verse"),
   }, // Brainstorm Verse
   5: { kind: "figure", load: () => import("@/figures/covers/tour-vibes") }, // Tour Vibes
   12: { kind: "figure", load: () => import("@/figures/covers/pacman") }, // PacMan Game Unity
   16: { kind: "figure", load: () => import("@/figures/covers/minesweeper") }, // Minesweeper Game Unity
   17: { kind: "figure", load: () => import("@/figures/covers/snake") }, // Snake Game Unity
   18: { kind: "figure", load: () => import("@/figures/covers/flappy") }, // Flappy Bird Game Unity

   // Community
   57: { kind: "figure", load: () => import("@/figures/covers/diagram") }, // orrery
   58: { kind: "figure", load: () => import("@/figures/covers/svg-forge") }, // svg-forge
   59: { kind: "figure", load: () => import("@/figures/covers/agent-brain") }, // agent-brain
   60: {
      kind: "figure",
      load: () => import("@/figures/covers/shared-workflows"),
   }, // Shared Workflows
   53: { kind: "figure", load: () => import("@/figures/covers/card-github") }, // GitHub Stats Card Action
   54: { kind: "figure", load: () => import("@/figures/covers/card-leetcode") }, // LeetCode Card Action
   55: { kind: "figure", load: () => import("@/figures/covers/card-oss") }, // OSS Contributions Card Action
   56: { kind: "figure", load: () => import("@/figures/covers/readme-kit") }, // readme-kit
   45: { kind: "figure", load: () => import("@/figures/covers/skillcheck") }, // skillcheck
   47: { kind: "figure", load: () => import("@/figures/covers/itr-agent") }, // ITR Agent
   38: { kind: "figure", load: () => import("@/figures/covers/claude-skills") }, // Claude Skills
   36: {
      kind: "figure",
      load: () => import("@/figures/covers/cost-optimizer"),
   }, // Claude Cost Optimizer
   43: { kind: "figure", load: () => import("@/figures/covers/bedrock-mcp") }, // Bedrock Multi-Model MCP
   30: { kind: "figure", load: () => import("@/figures/covers/mcp-toolkit") }, // MCP Toolkit
   35: {
      kind: "figure",
      load: () => import("@/figures/covers/claude-recipes"),
   }, // Claude Code Recipes
   31: { kind: "figure", load: () => import("@/figures/covers/awesome-mcp") }, // Awesome MCP Servers
   32: { kind: "figure", load: () => import("@/figures/covers/deploy-guide") }, // Deploy Guide
   33: { kind: "figure", load: () => import("@/figures/covers/agent-recipes") }, // Agent Recipes
   34: { kind: "figure", load: () => import("@/figures/covers/ai-git-hooks") }, // AI Git Hooks
   42: { kind: "figure", load: () => import("@/figures/covers/credly-badges") }, // Credly Badge README Action
};

export const getProjectCover = (
   id: number,
   _title: string,
): ProjectCover | undefined => COVER_BY_ID[id];
