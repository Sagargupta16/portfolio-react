import StackAnim from "./animations/StackAnim";
import PipelineAnim from "./animations/PipelineAnim";
import NeuralNetAnim from "./animations/NeuralNetAnim";
import AgentChatAnim from "./animations/AgentChatAnim";
import ArchitectureAnim from "./animations/ArchitectureAnim";
import SortAnim from "./animations/SortAnim";

interface ServiceAnimationProps {
   title: string;
   color: string;
}

const ANIM_MAP: Record<string, React.FC<{ color: string }>> = {
   "Full-Stack Development": StackAnim,
   "Cloud & DevOps": PipelineAnim,
   "AI/ML & MLOps": NeuralNetAnim,
   "AI Agents & Tooling": AgentChatAnim,
   "Cloud Consulting": ArchitectureAnim,
   "Competitive Programming": SortAnim,
};

const ServiceAnimation = ({ title, color }: ServiceAnimationProps) => {
   const AnimComponent = ANIM_MAP[title];

   if (!AnimComponent) return null;

   return (
      <div
         style={{
            transform: "scale(1.8)",
            transformOrigin: "center",
         }}
      >
         <AnimComponent color={color} />
      </div>
   );
};

export default ServiceAnimation;
