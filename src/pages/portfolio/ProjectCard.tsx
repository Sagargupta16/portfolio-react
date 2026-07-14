import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { MONO_FONT, TEXT_SECONDARY } from "@/constants/theme";
import {
   getCategoryColors,
   isValidUrl,
   type ProjectWithCategory,
} from "./portfolioConstants";
import ProjectLink from "./ProjectLink";
import ProjectCardHeader from "./ProjectCardHeader";
import ProjectCover from "./covers/ProjectCover";

interface ProjectCardProps {
   data: ProjectWithCategory;
   index?: number;
   onOpen?: () => void;
}

const MAX_VISIBLE_TAGS = 5;

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

   const visibleTags = data.tools_tech.slice(0, MAX_VISIBLE_TAGS);
   const hiddenTagCount = data.tools_tech.length - visibleTags.length;

   const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!clickable) return;
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         onOpen?.();
      }
   };

   return (
      <motion.div
         className="glass-card project-card"
         style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            cursor: clickable ? "pointer" : "default",
            height: "100%",
         }}
         layout
         initial={{ opacity: 0, y: 30 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true, margin: "0px 0px -60px 0px" }}
         exit={{ opacity: 0, y: -20, scale: 0.97 }}
         transition={{
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
            delay: Math.min((index % 6) * 0.06, 0.35),
            layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
         }}
         whileHover={{
            y: -6,
            transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
         }}
         onClick={clickable ? onOpen : undefined}
         onKeyDown={clickable ? handleKey : undefined}
         role={clickable ? "button" : undefined}
         tabIndex={clickable ? 0 : undefined}
         aria-label={clickable ? `View details for ${data.title}` : undefined}
      >
         {/* Media: live screenshot or animated scene */}
         <ProjectCover
            projectId={data.id}
            title={data.title}
            accent={colors.accent}
         />

         <div
            style={{
               padding: "20px 22px 18px",
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

            {/* Description (clamped -- full text lives in the modal) */}
            <p
               className="line-clamp-3"
               style={{
                  color: TEXT_SECONDARY,
                  fontSize: 13,
                  lineHeight: 1.65,
                  marginBottom: 14,
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
                  marginBottom: 14,
               }}
            >
               {visibleTags.map((tool) => (
                  <span
                     key={`${data.id}-tool-${tool}`}
                     style={{
                        fontFamily: MONO_FONT,
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "rgba(255,255,255,0.05)",
                        color: TEXT_SECONDARY,
                        border: "1px solid rgba(255,255,255,0.08)",
                     }}
                  >
                     {tool}
                  </span>
               ))}
               {hiddenTagCount > 0 && (
                  <span
                     style={{
                        fontFamily: MONO_FONT,
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 6,
                        color: colors.accent,
                        border: "1px dashed rgba(255,255,255,0.12)",
                     }}
                  >
                     +{hiddenTagCount}
                  </span>
               )}
            </div>

            {/* Links */}
            {(hasGithub || hasLive) && (
               <div
                  style={{
                     display: "flex",
                     gap: 8,
                     paddingTop: 12,
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
