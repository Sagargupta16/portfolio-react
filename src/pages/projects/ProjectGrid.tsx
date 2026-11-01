import { memo, type PointerEvent } from "react";
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
 * Memoized: Projects passes memoized props, so a search keystroke's urgent
 * render skips the grid until the deferred filter result changes. Cards are
 * memoized too: onOpen is the stable handler itself (each card passes its own
 * project back), and layoutKey names the list and spotlight, so a card
 * re-measures its slot only when the list changes, not on any other render.
 */
const ProjectGrid = ({
   projects,
   spotlightProjectId,
   hasFiltered,
   onOpenProject,
}: ProjectGridProps) => {
   const ids = projects.map((project) => project.id).join(",");
   const layoutKey = `${spotlightProjectId}:${ids}`;

   return (
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
                  layoutKey={layoutKey}
                  onOpen={onOpenProject}
               />
            ))}
         </AnimatePresence>
      </div>
   );
};

export default memo(ProjectGrid);
