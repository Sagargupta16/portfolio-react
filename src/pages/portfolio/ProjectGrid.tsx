import { AnimatePresence } from "motion/react";
import type { ProjectWithCategory } from "./portfolioConstants";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
   projects: ProjectWithCategory[];
   isMobile: boolean;
   onOpenProject: (project: ProjectWithCategory) => void;
}

/**
 * Responsive card grid: 1 column on phones, 2 on tablet, 3 on wide desktop.
 * Replaces the old alternating vertical timeline.
 */
const ProjectGrid = ({
   projects,
   isMobile,
   onOpenProject,
}: ProjectGridProps) => (
   <div
      style={{
         display: "grid",
         gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fill, minmax(340px, 1fr))",
         gap: 24,
         alignItems: "stretch",
      }}
   >
      <AnimatePresence mode="popLayout">
         {projects.map((project, idx) => (
            <ProjectCard
               key={`${project.category}-${project.id}-${project.title}`}
               data={project}
               index={idx}
               onOpen={() => onOpenProject(project)}
            />
         ))}
      </AnimatePresence>
   </div>
);

export default ProjectGrid;
