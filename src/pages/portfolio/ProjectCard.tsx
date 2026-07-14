import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { scaleRotateIn } from "@utils/animations";
import { MONO_FONT, TEXT_SECONDARY } from "@/constants/theme";
import {
   getCategoryColors,
   isValidUrl,
   type ProjectWithCategory,
} from "./portfolioConstants";
import ProjectLink from "./ProjectLink";
import ProjectCardHeader from "./ProjectCardHeader";

interface ProjectCardProps {
   data: ProjectWithCategory;
   index?: number;
   onOpen?: () => void;
}

const ProjectCard = ({ data, index = 0, onOpen }: ProjectCardProps) => {
   const hasGithub = isValidUrl(data.github);
   const hasLive = isValidUrl(data.live);
   const colors = getCategoryColors(data.category);
   const isFeatured = data.category === "Featured";
   const isCollab = data.category === "Collab";

   const hasDetail =
      (data.features?.length ?? 0) > 0 ||
      (data.contributors?.length ?? 0) > 0 ||
      Boolean(data.description);
   const clickable = hasDetail && Boolean(onOpen);

   const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!clickable) return;
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         onOpen?.();
      }
   };

   return (
      <motion.div
         className="glass-card"
         style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            cursor: clickable ? "pointer" : "default",
         }}
         layout
         variants={scaleRotateIn}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "0px 0px -60px 0px" }}
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
            layout: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
         }}
         whileHover={{
            y: -6,
            transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
         }}
         onClick={clickable ? onOpen : undefined}
         onKeyDown={clickable ? handleKey : undefined}
         role={clickable ? "button" : undefined}
         tabIndex={clickable ? 0 : undefined}
         aria-label={clickable ? `View details for ${data.title}` : undefined}
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
                  color: TEXT_SECONDARY,
                  fontSize: 12,
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
                  gap: 4,
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
                        borderRadius: 6,
                        background: `${colors.bgAlpha}0.08)`,
                        color: colors.accent,
                        border: `1px solid ${colors.borderAlpha}0.15)`,
                     }}
                  >
                     {tool}
                  </span>
               ))}
            </div>

            {/* Click-for-details hint (subtle, shown only when there's real detail to see) */}
            {clickable && (
               <p
                  style={{
                     fontFamily: MONO_FONT,
                     fontSize: 10,
                     color: colors.accent,
                     opacity: 0.7,
                     marginBottom: 12,
                     letterSpacing: "0.02em",
                  }}
                  aria-hidden="true"
               >
                  Click for details
               </p>
            )}

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
