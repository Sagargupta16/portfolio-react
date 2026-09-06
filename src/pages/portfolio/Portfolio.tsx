import { useState, useMemo, useCallback, type CSSProperties } from "react";
import { motion, type Variants } from "motion/react";
import {
   getFeaturedProjects,
   getCollaborativeProjects,
   getOtherProjects,
   getCommunityProjects,
} from "@data/projects";
import useBreakpoint from "@hooks/useBreakpoint";
import {
   BLUE,
   DURATION,
   EASING,
   MONO_FONT,
   TEXT_SECONDARY,
   MAX_WIDTH,
} from "@/constants/theme";
import PageSection from "@components/layout/PageSection";
import { FILTERS, parseDate } from "./portfolioConstants";
import type { ProjectWithCategory } from "./portfolioConstants";
import ProjectGrid from "./ProjectGrid";
import OpenSourceBanner from "./OpenSourceBanner";
import ProjectModal from "./ProjectModal";

// The chips inherit the section's hidden/visible state, so they reveal when
// the filter bar scrolls in rather than when the lazy chunk mounts.
const filterBarVariants: Variants = {
   hidden: {},
   visible: { transition: { staggerChildren: 0.04 } },
};

const filterChipVariants: Variants = {
   hidden: { opacity: 0, y: 16 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.default, ease: EASING.cinematic },
   },
};

const CHIP_RADIUS = 12;
const ACTIVE_LABEL = "#fff";

// Every chip shares this geometry; only the sliding pill marks the active one,
// so the bar never reflows when the selection changes.
const CHIP_STYLE: CSSProperties = {
   position: "relative",
   display: "inline-flex",
   alignItems: "center",
   gap: 8,
   padding: "8px 20px",
   borderRadius: CHIP_RADIUS,
   fontSize: 14,
   fontFamily: MONO_FONT,
   fontWeight: 500,
   cursor: "pointer",
   border: "1px solid rgba(255, 255, 255, 0.06)",
   background: "rgba(255, 255, 255, 0.03)",
   transition: "color 0.2s ease",
};

// The pill covers the 1px border so the active chip reads as a solid fill.
const PILL_STYLE: CSSProperties = {
   position: "absolute",
   inset: -1,
   borderRadius: CHIP_RADIUS,
   background: BLUE,
};

const PILL_SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;
const TAP = { scale: 0.97 };

const Portfolio = () => {
   const [activeFilter, setActiveFilter] = useState<string>("Featured");
   // Flips on the first filter change: cards mounted afterwards enter with the
   // short swap rise instead of the taller first-scroll reveal.
   const [hasFiltered, setHasFiltered] = useState(false);
   const [selectedProject, setSelectedProject] =
      useState<ProjectWithCategory | null>(null);

   const handleFilterChange = useCallback((filter: string) => {
      setActiveFilter(filter);
      setHasFiltered(true);
   }, []);
   const { isMobile } = useBreakpoint();

   const featuredProjects = useMemo(() => getFeaturedProjects(), []);
   const communityProjects = useMemo(() => getCommunityProjects(), []);
   const collaborativeProjects = useMemo(() => getCollaborativeProjects(), []);
   const otherProjects = useMemo(() => getOtherProjects(), []);

   // Counts per filter -- drives both the badge text and the "hide empty" rule.
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
               variants={filterBarVariants}
            >
               {visibleFilters.map((filter) => {
                  const isActive = activeFilter === filter;
                  const count = counts[filter] ?? 0;
                  return (
                     <motion.button
                        key={filter}
                        type="button"
                        onClick={() => handleFilterChange(filter)}
                        style={{
                           ...CHIP_STYLE,
                           color: isActive ? ACTIVE_LABEL : TEXT_SECONDARY,
                        }}
                        variants={filterChipVariants}
                        whileTap={TAP}
                        aria-pressed={isActive}
                        aria-label={`${filter} (${count} project${count === 1 ? "" : "s"})`}
                     >
                        {isActive && (
                           <motion.span
                              layoutId="project-filter"
                              aria-hidden="true"
                              style={PILL_STYLE}
                              transition={PILL_SPRING}
                           />
                        )}
                        <span style={{ position: "relative" }}>{filter}</span>
                        <span
                           aria-hidden="true"
                           style={{
                              position: "relative",
                              fontFamily: MONO_FONT,
                              fontSize: 11,
                              fontWeight: 600,
                              opacity: 0.65,
                              padding: "1px 6px",
                              borderRadius: 6,
                              background: isActive
                                 ? "rgba(0, 0, 0, 0.18)"
                                 : "rgba(255, 255, 255, 0.06)",
                              transition: "background-color 0.2s ease",
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
               hasFiltered={hasFiltered}
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
