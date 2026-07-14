import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import {
   getFeaturedProjects,
   getCollaborativeProjects,
   getOtherProjects,
   getCommunityProjects,
} from "@data/dataLoader";
import { fadeInUp } from "@utils/animations";
import useBreakpoint from "@hooks/useBreakpoint";
import { MONO_FONT, TEXT_SECONDARY, MAX_WIDTH } from "@/constants/theme";
import PageSection from "@components/layout/PageSection";
import { FILTERS, parseDate } from "./portfolioConstants";
import type { ProjectWithCategory } from "./portfolioConstants";
import ProjectGrid from "./ProjectGrid";
import OpenSourceBanner from "./OpenSourceBanner";
import ProjectModal from "./ProjectModal";

const Portfolio = () => {
   const [activeFilter, setActiveFilter] = useState<string>("Featured");
   const [selectedProject, setSelectedProject] =
      useState<ProjectWithCategory | null>(null);

   const handleFilterChange = useCallback((filter: string) => {
      if (document.startViewTransition) {
         document.startViewTransition(() => {
            setActiveFilter(filter);
         });
      } else {
         setActiveFilter(filter);
      }
   }, []);
   const { isMobile } = useBreakpoint();

   const featuredProjects = useMemo(() => getFeaturedProjects(), []);
   const communityProjects = useMemo(() => getCommunityProjects(), []);
   const collaborativeProjects = useMemo(() => getCollaborativeProjects(), []);
   const otherProjects = useMemo(() => getOtherProjects(), []);

   // Counts per filter — drives both the badge text and the "hide empty" rule.
   const counts = useMemo<Record<string, number>>(() => {
      const f = featuredProjects.length;
      const c = communityProjects.length;
      const x = collaborativeProjects.length;
      const o = otherProjects.length;
      return {
         Featured: f,
         Community: c,
         Collab: x,
         Others: o,
         All: f + c + x + o,
      };
   }, [
      featuredProjects,
      communityProjects,
      collaborativeProjects,
      otherProjects,
   ]);

   // Skip categories with zero items so the filter bar never shows dead options.
   // "All" is kept even at zero so the bar still renders with a fallback.
   const visibleFilters = useMemo(
      () => FILTERS.filter((f) => f === "All" || (counts[f] ?? 0) > 0),
      [counts],
   );

   const filteredProjects = useMemo(() => {
      const featured = featuredProjects.map((p) => ({
         ...p,
         category: "Featured",
      }));
      const community = communityProjects.map((p) => ({
         ...p,
         category: "Community",
      }));
      const collab = collaborativeProjects.map((p) => ({
         ...p,
         category: "Collab",
      }));
      const others = otherProjects.map((p) => ({ ...p, category: "Others" }));

      let list: ProjectWithCategory[];
      if (activeFilter === "Featured") list = featured;
      else if (activeFilter === "Community") list = community;
      else if (activeFilter === "Collab") list = collab;
      else if (activeFilter === "Others") list = others;
      else list = [...featured, ...community, ...collab, ...others];

      return list.sort(
         (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime(),
      );
   }, [
      activeFilter,
      featuredProjects,
      communityProjects,
      collaborativeProjects,
      otherProjects,
   ]);

   const handleOpenProject = useCallback(
      (project: ProjectWithCategory) => setSelectedProject(project),
      [],
   );

   return (
      <PageSection id="projects" title="Projects" subtitle="Things I've built">
         <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto" }}>
            {/* Filter buttons */}
            <motion.div
               style={{
                  display: "flex",
                  gap: isMobile ? 8 : 12,
                  marginBottom: 48,
                  justifyContent: "center",
                  flexWrap: "wrap",
               }}
               variants={fadeInUp}
            >
               {visibleFilters.map((filter, idx) => {
                  const isActive = activeFilter === filter;
                  const count = counts[filter] ?? 0;
                  return (
                     <motion.button
                        key={filter}
                        onClick={() => handleFilterChange(filter)}
                        className={isActive ? "btn-primary" : ""}
                        style={
                           isActive
                              ? {}
                              : {
                                   padding: "8px 20px",
                                   borderRadius: 12,
                                   fontSize: 14,
                                   fontFamily: MONO_FONT,
                                   fontWeight: 500,
                                   cursor: "pointer",
                                   border:
                                      "1px solid rgba(255, 255, 255, 0.06)",
                                   color: TEXT_SECONDARY,
                                   background: "rgba(255, 255, 255, 0.03)",
                                   display: "inline-flex",
                                   alignItems: "center",
                                   gap: 8,
                                }
                        }
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                           duration: 0.7,
                           ease: [0.4, 0, 0.2, 1],
                           delay: 0.1 + idx * 0.08,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        aria-label={`${filter} (${count} project${count === 1 ? "" : "s"})`}
                     >
                        <span>{filter}</span>
                        <span
                           aria-hidden="true"
                           style={{
                              fontFamily: MONO_FONT,
                              fontSize: 11,
                              fontWeight: 600,
                              opacity: 0.65,
                              padding: "1px 6px",
                              borderRadius: 6,
                              background: isActive
                                 ? "rgba(0, 0, 0, 0.18)"
                                 : "rgba(255, 255, 255, 0.06)",
                              // Use tabular digits so 1-digit and 2-digit counts
                              // don't shift the button width during filter swaps.
                              fontVariantNumeric: "tabular-nums",
                           }}
                        >
                           {count}
                        </span>
                     </motion.button>
                  );
               })}
            </motion.div>

            {/* Card grid with live screenshots / animated covers */}
            <ProjectGrid
               projects={filteredProjects}
               isMobile={isMobile}
               onOpenProject={handleOpenProject}
            />

            {/* Open Source Contributions Banner */}
            <OpenSourceBanner />
         </div>

         <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
         />
      </PageSection>
   );
};

export default Portfolio;
