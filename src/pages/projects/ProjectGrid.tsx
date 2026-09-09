import { AnimatePresence } from "motion/react";
import type { ProjectWithCategory } from "./projectConstants";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
   projects: ProjectWithCategory[];
   highlightFirst: boolean;
   /** True once the filter has changed: later cards mount as swap entries. */
   hasFiltered: boolean;
   onOpenProject: (project: ProjectWithCategory) => void;
}

/**
 * Responsive card grid: 1 column on phones, 2 on tablet, 3 on wide desktop.
 * On a filter change popLayout lifts the leaving cards out of the flow, the
 * survivors glide to their new slots and the newcomers rise into the gaps.
 */
const ProjectGrid = ({
   projects,
   highlightFirst,
   hasFiltered,
   onOpenProject,
}: ProjectGridProps) => (
   <div className="project-grid" id="project-results">
      <AnimatePresence mode="popLayout">
         {projects.map((project, idx) => (
            <ProjectCard
               key={`${project.category}-${project.id}-${project.title}`}
               data={project}
               index={idx}
               entering={hasFiltered}
               spotlight={highlightFirst && idx === 0}
               onOpen={() => onOpenProject(project)}
            />
         ))}
      </AnimatePresence>
   </div>
);

export default ProjectGrid;
