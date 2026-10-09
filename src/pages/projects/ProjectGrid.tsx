import type { PointerEvent } from "react";
import { AnimatePresence } from "motion/react";
import type { ProjectWithCategory } from "./projectConstants";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
   projects: ProjectWithCategory[];
   spotlightProjectId: number | null;
   /** True once the filter has changed: later cards mount as swap entries. */
   hasFiltered: boolean;
   onOpenProject: (project: ProjectWithCategory) => void;
}

// One delegated listener for the whole grid: the card under a mouse pointer gets
// --mx/--my, which the .project-card::before border light follows (CSS).
const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
   if (event.pointerType !== "mouse") return;
   const card = (event.target as HTMLElement).closest<HTMLElement>(
      ".project-card",
   );
   if (!card) return;
   const box = card.getBoundingClientRect();
   card.style.setProperty("--mx", `${event.clientX - box.left}px`);
   card.style.setProperty("--my", `${event.clientY - box.top}px`);
};

/**
 * Responsive card grid: 1 column on phones, 2 on tablet, 3 on wide desktop.
 * On a filter change popLayout lifts the leaving cards out of the flow, the
 * survivors glide to their new slots and the newcomers rise into the gaps.
 */
const ProjectGrid = ({
   projects,
   spotlightProjectId,
   hasFiltered,
   onOpenProject,
}: ProjectGridProps) => (
   <div
      className="project-grid"
      id="project-results"
      onPointerMove={trackPointer}
   >
      <AnimatePresence mode="popLayout">
         {projects.map((project, idx) => (
            <ProjectCard
               key={`${project.category}-${project.id}-${project.title}`}
               data={project}
               index={idx}
               entering={hasFiltered}
               spotlight={project.id === spotlightProjectId}
               onOpen={() => onOpenProject(project)}
            />
         ))}
      </AnimatePresence>
   </div>
);

export default ProjectGrid;
