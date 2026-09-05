import StackAnim from "./animations/StackAnim";
import PipelineAnim from "./animations/PipelineAnim";
import NeuralNetAnim from "./animations/NeuralNetAnim";
import AgentChatAnim from "./animations/AgentChatAnim";
import ArchitectureAnim from "./animations/ArchitectureAnim";
import SortAnim from "./animations/SortAnim";
import AiDlcAnim from "./animations/AiDlcAnim";

interface ServiceAnimationProps {
   title: string;
   color: string;
   /** Phone strip is 100 px tall; the desktop column is 150 px. */
   compact?: boolean;
}

/* The 80 px canvas scales to 144 px beside the copy on desktop and to 96 px
 * inside the 100 px phone strip, so nothing is clipped at either size. */
const SCALE_DESKTOP = 1.8;
const SCALE_COMPACT = 1.2;

const ANIM_MAP: Record<string, React.FC<{ color: string }>> = {
   "Full-Stack Development": StackAnim,
   "Cloud & DevOps": PipelineAnim,
   "AI/ML & MLOps": NeuralNetAnim,
   "AI Agents & Tooling": AgentChatAnim,
   "AI-Driven Development (AI-DLC)": AiDlcAnim,
   "Cloud Consulting": ArchitectureAnim,
   "Competitive Programming": SortAnim,
};

const ServiceAnimation = ({
   title,
   color,
   compact = false,
}: ServiceAnimationProps) => {
   const AnimComponent = ANIM_MAP[title];

   if (!AnimComponent) return null;

   return (
      <div
         aria-hidden="true"
         style={{
            transform: `scale(${compact ? SCALE_COMPACT : SCALE_DESKTOP})`,
            transformOrigin: "center",
         }}
      >
         <AnimComponent color={color} />
      </div>
   );
};

export default ServiceAnimation;
