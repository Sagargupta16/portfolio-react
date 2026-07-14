import { motion, AnimatePresence } from "motion/react";
import { getCategoryColors } from "./portfolioConstants";
import type { ProjectWithCategory } from "./portfolioConstants";
import ProjectCard from "./ProjectCard";

interface ProjectTimelineProps {
   projects: ProjectWithCategory[];
   isMobile: boolean;
   onOpenProject: (project: ProjectWithCategory) => void;
}

const ProjectTimeline = ({
   projects,
   isMobile,
   onOpenProject,
}: ProjectTimelineProps) => (
   <div
      style={{
         position: "relative",
         paddingLeft: isMobile ? 24 : 0,
      }}
   >
      {/* Straight center line (desktop) / left line (mobile) */}
      <motion.div
         initial={{ scaleY: 0 }}
         animate={{ scaleY: 1 }}
         transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
         style={{
            position: "absolute",
            left: isMobile ? 6 : "50%",
            top: 0,
            bottom: 0,
            width: 2,
            borderRadius: 4,
            transformOrigin: "top",
            background:
               "linear-gradient(to bottom, rgba(96,165,250,0.3), rgba(56,189,248,0.2) 50%, rgba(245,158,11,0.15) 80%, transparent)",
         }}
      />

      <AnimatePresence mode="popLayout">
         {projects.map((project, idx) => {
            const isLeft = !isMobile && idx % 2 === 0;
            const colors = getCategoryColors(project.category);

            let pl: number | string = 24;
            if (!isMobile) pl = isLeft ? 0 : "calc(50% + 20px)";
            const pr = isMobile || !isLeft ? 0 : "calc(50% + 20px)";

            return (
               <motion.div
                  key={`${project.category}-${project.id}`}
                  layout
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                     type: "spring",
                     stiffness: 80,
                     damping: 18,
                     delay: Math.min(idx * 0.06, 0.6),
                     layout: {
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1],
                     },
                  }}
                  style={{
                     display: "flex",
                     justifyContent:
                        isMobile || !isLeft ? "flex-start" : "flex-end",
                     paddingLeft: pl,
                     paddingRight: pr,
                     marginTop: idx === 0 || isMobile ? 0 : -60,
                     position: "relative",
                     zIndex: projects.length - idx,
                  }}
               >
                  {/* Timeline node dot */}
                  <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{
                        type: "spring",
                        delay: 0.2 + idx * 0.06,
                     }}
                     style={{
                        position: "absolute",
                        left: isMobile ? 2 : "calc(50% - 5px)",
                        top: 20,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: colors.accent,
                        boxShadow: `0 0 10px ${colors.accent}80, 0 0 20px ${colors.accent}30`,
                        zIndex: 3,
                        animation: `float ${3 + (idx % 4) * 0.5}s ease-in-out ${(idx % 6) * 0.4}s infinite`,
                     }}
                  />

                  {/* Horizontal connector line */}
                  {!isMobile && (
                     <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                           duration: 0.4,
                           delay: 0.3 + idx * 0.06,
                        }}
                        style={{
                           position: "absolute",
                           top: 24,
                           left: isLeft ? "auto" : "calc(50% + 5px)",
                           right: isLeft ? "calc(50% + 5px)" : "auto",
                           width: 15,
                           height: 1,
                           background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${colors.accent}50, transparent)`,
                           transformOrigin: isLeft ? "right" : "left",
                           zIndex: 2,
                        }}
                     />
                  )}

                  {/* Card */}
                  <div style={{ width: "100%", maxWidth: 480 }}>
                     <ProjectCard
                        data={project}
                        index={idx}
                        onOpen={() => onOpenProject(project)}
                     />
                  </div>
               </motion.div>
            );
         })}
      </AnimatePresence>
   </div>
);

export default ProjectTimeline;
