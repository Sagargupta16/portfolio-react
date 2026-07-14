import type { ComponentType } from "react";
import {
   SiPython,
   SiJavascript,
   SiTypescript,
   SiCplusplus,
   SiGo,
   SiR,
   SiHtml5,
   SiGnubash,
   SiMysql,
   SiPostgresql,
   SiMongodb,
   SiRedis,
   SiSqlite,
   SiReact,
   SiNextdotjs,
   SiVite,
   SiTailwindcss,
   SiThreedotjs,
   SiFramer,
   SiRedux,
   SiMui,
   SiNodedotjs,
   SiExpress,
   SiFastapi,
   SiTerraform,
   SiDocker,
   SiAnsible,
   SiGithubactions,
   SiJenkins,
   SiTensorflow,
   SiPytorch,
   SiScikitlearn,
   SiPandas,
   SiOpencv,
   SiJupyter,
   SiPostman,
   SiFigma,
   SiSonarqubeserver,
   SiGit,
   SiAnthropic,
   SiGithubcopilot,
} from "react-icons/si";
import { FaJava, FaAws } from "react-icons/fa";
import { TbBrandCSharp, TbBrandVscode, TbApi } from "react-icons/tb";
import {
   Database,
   Workflow,
   ArrowLeftRight,
   FileCode2,
   Brain,
   Network,
   Sparkles,
   Layers,
   Bot,
   MousePointer2,
   Plug,
   Binary,
   Boxes,
   Cpu,
   Wrench,
   Crown,
   Puzzle,
   MessageCircle,
   Users,
   Lightbulb,
   Shuffle,
   Cloud,
   GitFork,
   Gamepad2,
} from "lucide-react";

interface IconProps {
   size?: number;
   color?: string;
   style?: React.CSSProperties;
}

export interface SkillIcon {
   Icon: ComponentType<IconProps>;
   color: string;
}

const BLUE = "#60a5fa";
const AWS_ORANGE = "#FF9900";

/**
 * Brand glyph + official brand color per skill (Simple Icons / FA / Tabler).
 * Concept skills fall back to lucide glyphs in the site blue.
 * Colors are lightened where the official brand color would vanish on the
 * near-black canvas (C++, SQLite, Pandas).
 */
const SKILL_ICONS: Record<string, SkillIcon> = {
   // Languages
   Python: { Icon: SiPython, color: "#3776AB" },
   JavaScript: { Icon: SiJavascript, color: "#F7DF1E" },
   TypeScript: { Icon: SiTypescript, color: "#3178C6" },
   "C++": { Icon: SiCplusplus, color: "#649AD2" },
   Java: { Icon: FaJava, color: "#ED8B00" },
   SQL: { Icon: Database, color: BLUE },
   HCL: { Icon: SiTerraform, color: "#844FBA" },
   Bash: { Icon: SiGnubash, color: "#4EAA25" },
   Go: { Icon: SiGo, color: "#00ADD8" },
   "C#": { Icon: TbBrandCSharp, color: "#8B72E9" },
   R: { Icon: SiR, color: "#276DC3" },
   "HTML/CSS": { Icon: SiHtml5, color: "#E34F26" },

   // Frontend
   React: { Icon: SiReact, color: "#61DAFB" },
   "Next.js": { Icon: SiNextdotjs, color: "#FFFFFF" },
   Vite: { Icon: SiVite, color: "#646CFF" },
   "Tailwind CSS": { Icon: SiTailwindcss, color: "#38BDF8" },
   "Three.js": { Icon: SiThreedotjs, color: "#FFFFFF" },
   Motion: { Icon: SiFramer, color: "#F5F5F5" },
   Redux: { Icon: SiRedux, color: "#764ABC" },
   MUI: { Icon: SiMui, color: "#007FFF" },

   // Backend & databases
   "Node.js": { Icon: SiNodedotjs, color: "#5FA04E" },
   "Express.js": { Icon: SiExpress, color: "#FFFFFF" },
   FastAPI: { Icon: SiFastapi, color: "#009688" },
   "REST API": { Icon: TbApi, color: BLUE },
   MongoDB: { Icon: SiMongodb, color: "#47A248" },
   PostgreSQL: { Icon: SiPostgresql, color: "#699ECA" },
   MySQL: { Icon: SiMysql, color: "#4479A1" },
   Redis: { Icon: SiRedis, color: "#FF4438" },
   SQLite: { Icon: SiSqlite, color: "#6BB3DE" },

   // Cloud & DevOps
   Terraform: { Icon: SiTerraform, color: "#844FBA" },
   Docker: { Icon: SiDocker, color: "#2496ED" },
   Ansible: { Icon: SiAnsible, color: "#EE4444" },
   "GitHub Actions": { Icon: SiGithubactions, color: "#2088FF" },
   Jenkins: { Icon: SiJenkins, color: "#D24939" },
   "CI/CD Pipelines": { Icon: Workflow, color: BLUE },
   "Blue-Green Deployment": { Icon: ArrowLeftRight, color: BLUE },
   "AWS CDK": { Icon: FaAws, color: AWS_ORANGE },
   "AWS Step Functions": { Icon: FaAws, color: AWS_ORANGE },
   "Infrastructure as Code": { Icon: FileCode2, color: BLUE },

   // AI / ML
   "AWS SageMaker": { Icon: FaAws, color: AWS_ORANGE },
   "AWS Bedrock": { Icon: FaAws, color: AWS_ORANGE },
   "Amazon Q": { Icon: FaAws, color: AWS_ORANGE },
   TensorFlow: { Icon: SiTensorflow, color: "#FF6F00" },
   PyTorch: { Icon: SiPytorch, color: "#EE4C2C" },
   "Scikit-learn": { Icon: SiScikitlearn, color: "#F7931E" },
   "Pandas / NumPy": { Icon: SiPandas, color: "#9A8FDB" },
   "LSTM / Neural Networks": { Icon: Brain, color: BLUE },
   "OpenCV / Image Processing": { Icon: SiOpencv, color: "#5C3EE8" },
   "Deep Learning": { Icon: Network, color: BLUE },
   MLOps: { Icon: Workflow, color: BLUE },
   "LLM APIs": { Icon: Sparkles, color: BLUE },
   "RAG Pipelines": { Icon: Layers, color: BLUE },

   // Tools & platforms
   "Claude Code": { Icon: SiAnthropic, color: "#D97757" },
   Kiro: { Icon: Bot, color: BLUE },
   "Cursor AI": { Icon: MousePointer2, color: BLUE },
   "GitHub Copilot": { Icon: SiGithubcopilot, color: "#FFFFFF" },
   Git: { Icon: SiGit, color: "#F05032" },
   "VS Code": { Icon: TbBrandVscode, color: "#3EA8E5" },
   "Jupyter Notebook": { Icon: SiJupyter, color: "#F37626" },
   Postman: { Icon: SiPostman, color: "#FF6C37" },
   Figma: { Icon: SiFigma, color: "#F24E1E" },
   "MCP Protocol": { Icon: Plug, color: BLUE },
   "AI Agent Frameworks": { Icon: Bot, color: BLUE },
   SonarQube: { Icon: SiSonarqubeserver, color: "#4E9BCD" },

   // CS fundamentals
   "Data Structures & Algorithms": { Icon: Binary, color: BLUE },
   "Object-Oriented Programming": { Icon: Boxes, color: BLUE },
   "Computer Networks": { Icon: Network, color: BLUE },
   "Operating Systems": { Icon: Cpu, color: BLUE },
   "Software Engineering": { Icon: Wrench, color: BLUE },
   "Database Management Systems": { Icon: Database, color: BLUE },

   // Soft skills
   Leadership: { Icon: Crown, color: BLUE },
   "Problem Solving": { Icon: Puzzle, color: BLUE },
   Communication: { Icon: MessageCircle, color: BLUE },
   Teamwork: { Icon: Users, color: BLUE },
   "Critical Thinking": { Icon: Lightbulb, color: BLUE },
   Adaptability: { Icon: Shuffle, color: BLUE },

   // Areas of interest
   "Full-Stack Development": { Icon: Layers, color: BLUE },
   "AI/ML Engineering": { Icon: Brain, color: BLUE },
   "DevOps & Cloud": { Icon: Cloud, color: BLUE },
   "Open Source": { Icon: GitFork, color: BLUE },
   "AI Agents & MCP": { Icon: Bot, color: BLUE },
   "Game Development": { Icon: Gamepad2, color: BLUE },
};

/** Grouped AWS service strings ("AWS (EC2, ...)") all take the AWS glyph. */
export const getSkillIcon = (name: string): SkillIcon | undefined =>
   SKILL_ICONS[name] ??
   (name.startsWith("AWS") ? { Icon: FaAws, color: AWS_ORANGE } : undefined);
