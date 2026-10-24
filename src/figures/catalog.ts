import * as agentBrain from "./covers/agent-brain";
import * as agentRecipes from "./covers/agent-recipes";
import * as agentcore from "./covers/agentcore";
import * as aiGitHooks from "./covers/ai-git-hooks";
import * as amongUs from "./covers/among-us";
import * as awesomeMcp from "./covers/awesome-mcp";
import * as bedrockMcp from "./covers/bedrock-mcp";
import * as blueGreen from "./covers/blue-green";
import * as brainstormVerse from "./covers/brainstorm-verse";
import * as cardGithub from "./covers/card-github";
import * as cardLeetcode from "./covers/card-leetcode";
import * as cardOss from "./covers/card-oss";
import * as claudeRecipes from "./covers/claude-recipes";
import * as claudeSkills from "./covers/claude-skills";
import * as codeArena from "./covers/code-arena";
import * as costOptimizer from "./covers/cost-optimizer";
import * as credlyBadges from "./covers/credly-badges";
import * as deployGuide from "./covers/deploy-guide";
import * as diagram from "./covers/diagram";
import * as farmEcs from "./covers/farm-ecs";
import * as flappy from "./covers/flappy";
import * as gitscope from "./covers/gitscope";
import * as instaAutopilot from "./covers/insta-autopilot";
import * as itrAgent from "./covers/itr-agent";
import * as kalchar from "./covers/kalchar";
import * as kinfolk from "./covers/kinfolk";
import * as ledgerSync from "./covers/ledger-sync";
import * as likesLeaderboard from "./covers/likes-leaderboard";
import * as linguaConnect from "./covers/lingua-connect";
import * as mcaNitw from "./covers/mca-nitw";
import * as mcpToolkit from "./covers/mcp-toolkit";
import * as minesweeper from "./covers/minesweeper";
import * as orbit from "./covers/orbit";
import * as orgGovernance from "./covers/org-governance";
import * as pacman from "./covers/pacman";
import * as placemento from "./covers/placemento";
import * as portfolio from "./covers/portfolio";
import * as ratingPredictor from "./covers/rating-predictor";
import * as readmeKit from "./covers/readme-kit";
import * as sagas from "./covers/sagas";
import * as sagemakerMlops from "./covers/sagemaker-mlops";
import * as selfhub from "./covers/selfhub";
import * as sharedWorkflows from "./covers/shared-workflows";
import * as skillcheck from "./covers/skillcheck";
import * as snake from "./covers/snake";
import * as stockLstm from "./covers/stock-lstm";
import * as studyHub from "./covers/study-hub";
import * as svgForge from "./covers/svg-forge";
import * as tourVibes from "./covers/tour-vibes";
import * as expAwsIntern from "./experience/aws-intern";
import * as expConsultingLoop from "./experience/consulting-loop";
import * as expIkarusDevops from "./experience/ikarus-devops";
import * as expLandingZone from "./experience/landing-zone";
import * as expMlopsLoop from "./experience/mlops-loop";
import * as expSecurityControls from "./experience/security-controls";
import * as expTfModernize from "./experience/tf-modernize";
import * as serAgents from "./services/agents";
import * as serFullstack from "./services/fullstack";
import * as serGovernance from "./services/governance";
import * as serMlops from "./services/mlops";
import * as serNetwork from "./services/network";
import * as serPipeline from "./services/pipeline";
import type { FigureModule, Tour } from "./hairline";

/**
 * Every hairline figure, by surface and name, for
 * src/__tests__/figures.test.ts. The app reaches figures through their slot
 * registries (lazily), never through this list.
 */
export const FIGURES: Record<string, FigureModule & { tour: Tour }> = {
   "covers/agent-brain": agentBrain,
   "covers/agent-recipes": agentRecipes,
   "covers/agentcore": agentcore,
   "covers/ai-git-hooks": aiGitHooks,
   "covers/among-us": amongUs,
   "covers/awesome-mcp": awesomeMcp,
   "covers/bedrock-mcp": bedrockMcp,
   "covers/blue-green": blueGreen,
   "covers/brainstorm-verse": brainstormVerse,
   "covers/card-github": cardGithub,
   "covers/card-leetcode": cardLeetcode,
   "covers/card-oss": cardOss,
   "covers/claude-recipes": claudeRecipes,
   "covers/claude-skills": claudeSkills,
   "covers/code-arena": codeArena,
   "covers/cost-optimizer": costOptimizer,
   "covers/credly-badges": credlyBadges,
   "covers/deploy-guide": deployGuide,
   "covers/diagram": diagram,
   "covers/farm-ecs": farmEcs,
   "covers/flappy": flappy,
   "covers/gitscope": gitscope,
   "covers/insta-autopilot": instaAutopilot,
   "covers/itr-agent": itrAgent,
   "covers/kalchar": kalchar,
   "covers/kinfolk": kinfolk,
   "covers/ledger-sync": ledgerSync,
   "covers/likes-leaderboard": likesLeaderboard,
   "covers/lingua-connect": linguaConnect,
   "covers/mca-nitw": mcaNitw,
   "covers/mcp-toolkit": mcpToolkit,
   "covers/minesweeper": minesweeper,
   "covers/orbit": orbit,
   "covers/org-governance": orgGovernance,
   "covers/pacman": pacman,
   "covers/placemento": placemento,
   "covers/portfolio": portfolio,
   "covers/rating-predictor": ratingPredictor,
   "covers/readme-kit": readmeKit,
   "covers/sagas": sagas,
   "covers/sagemaker-mlops": sagemakerMlops,
   "covers/selfhub": selfhub,
   "covers/shared-workflows": sharedWorkflows,
   "covers/skillcheck": skillcheck,
   "covers/snake": snake,
   "covers/stock-lstm": stockLstm,
   "covers/study-hub": studyHub,
   "covers/svg-forge": svgForge,
   "covers/tour-vibes": tourVibes,
   "experience/aws-intern": expAwsIntern,
   "experience/consulting-loop": expConsultingLoop,
   "experience/ikarus-devops": expIkarusDevops,
   "experience/landing-zone": expLandingZone,
   "experience/mlops-loop": expMlopsLoop,
   "experience/security-controls": expSecurityControls,
   "experience/tf-modernize": expTfModernize,
   "services/agents": serAgents,
   "services/fullstack": serFullstack,
   "services/governance": serGovernance,
   "services/mlops": serMlops,
   "services/network": serNetwork,
   "services/pipeline": serPipeline,
};
