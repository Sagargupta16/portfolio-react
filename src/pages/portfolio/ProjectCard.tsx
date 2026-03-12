import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { scaleRotateIn } from "@utils/animations";
import { MONO_FONT } from "@/constants/theme";
import {
   CATEGORY_COLORS,
   type ProjectWithCategory,
} from "./portfolioConstants";
import ProjectLink from "./ProjectLink";
import ProjectCardHeader from "./ProjectCardHeader";

interface ProjectCardProps {
   data: ProjectWithCategory;
   index?: number;
}

const ProjectCard = ({ data, index = 0 }: ProjectCardProps) => {
   const hasGithub = data.github && data.github !== "" && data.github !== "#";
   const hasLive = data.live && data.live !== "" && data.live !== "#";
   const colors = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.Others;
   const isFeatured = data.category === "Featured";
   const isCollab = data.category === "Collab";

   return (
      <motion.div
         className="glass-card"
         style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
         }}
         layout
         variants={scaleRotateIn}
         initial="hidden"
         animate="visible"
         exit={{ opacity: 0, y: -20, scale: 0.95 }}
         transition={{
            ...(typeof scaleRotateIn.visible === "object" &&
            "transition" in scaleRotateIn.visible
               ? (
                    scaleRotateIn.visible as {
                       transition: Record<string, unknown>;
                    }
                 ).transition
               : {}),
            delay: Math.min(index * 0.1, 0.8),
            layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
         }}
         whileHover={{
            y: -6,
            transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
         }}
      >
         {/* Accent top bar */}
         <div
            style={{
               height: isFeatured ? 4 : 3,
               background: colors.gradient,
               borderRadius: "12px 12px 0 0",
            }}
         />

         <div
            style={{
               padding: "24px 24px 20px",
               display: "flex",
               flexDirection: "column",
               flex: 1,
            }}
         >
            <ProjectCardHeader
               data={data}
               colors={colors}
               isFeatured={isFeatured}
               isCollab={isCollab}
            />

            {/* Description */}
            <p
               style={{
                  color: "#a5a5c0",
                  fontSize: 13,
                  lineHeight: 1.7,
                  marginBottom: 16,
                  flex: 1,
               }}
            >
               {data.description}
            </p>

            {/* Tech tags */}
            <div
               style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 16,
               }}
            >
               {data.tools_tech.map((tool) => (
                  <span
                     key={`${data.id}-tool-${tool}`}
                     style={{
                        fontFamily: MONO_FONT,
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 5,
                        background: `${colors.bgAlpha}0.08)`,
                        color: colors.accent,
                        border: `1px solid ${colors.borderAlpha}0.15)`,
                     }}
                  >
                     {tool}
                  </span>
               ))}
            </div>

            {/* Links */}
            {(hasGithub || hasLive) && (
               <div
                  style={{
                     display: "flex",
                     gap: 8,
                     paddingTop: 14,
                     borderTop: "1px solid rgba(255,255,255,0.04)",
                  }}
               >
                  {hasGithub && (
                     <ProjectLink
                        href={data.github}
                        label="Source"
                        ariaLabel={`View ${data.title} on GitHub`}
                        icon={FaGithub}
                        accentColor={colors.accent}
                     />
                  )}
                  {hasLive && (
                     <ProjectLink
                        href={data.live}
                        label="Live Demo"
                        ariaLabel={`View ${data.title} live demo`}
                        icon={ExternalLink}
                        accentColor={colors.accent}
                     />
                  )}
               </div>
            )}
         </div>
      </motion.div>
   );
};

export default ProjectCard;
