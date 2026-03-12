import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import {
   getFeaturedProjects,
   getCollaborativeProjects,
   getOtherProjects,
   getCommunityProjects,
} from "@data/dataLoader";
import { fadeInUp } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import { MONO_FONT } from "@/constants/theme";
import PageSection from "@components/layout/PageSection";
import { FILTERS, parseDate } from "./portfolioConstants";
import type { ProjectWithCategory } from "./portfolioConstants";
import ProjectTimeline from "./ProjectTimeline";
import OpenSourceBanner from "./OpenSourceBanner";

const Portfolio = () => {
   const [activeFilter, setActiveFilter] = useState<string>("Featured");

   const handleFilterChange = useCallback((filter: string) => {
      if (document.startViewTransition) {
         document.startViewTransition(() => {
            setActiveFilter(filter);
         });
      } else {
         setActiveFilter(filter);
      }
   }, []);
   const isMobile = useMediaQuery("(max-width: 768px)");

   const featuredProjects = useMemo(() => getFeaturedProjects(), []);
   const communityProjects = useMemo(() => getCommunityProjects(), []);
   const collaborativeProjects = useMemo(() => getCollaborativeProjects(), []);
   const otherProjects = useMemo(() => getOtherProjects(), []);

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

   return (
      <PageSection id="projects" title="Projects" subtitle="Things I've built">
         <div
            className="max-w-6xl mx-auto"
            style={{ maxWidth: 1152, margin: "0 auto" }}
         >
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
               {FILTERS.map((filter, idx) => (
                  <motion.button
                     key={filter}
                     onClick={() => handleFilterChange(filter)}
                     className={activeFilter === filter ? "btn-primary" : ""}
                     style={
                        activeFilter === filter
                           ? {}
                           : {
                                padding: "10px 20px",
                                borderRadius: 12,
                                fontSize: 14,
                                fontFamily: MONO_FONT,
                                fontWeight: 500,
                                cursor: "pointer",
                                border: "1px solid rgba(255, 255, 255, 0.06)",
                                color: "#a5a5c0",
                                background: "rgba(255, 255, 255, 0.03)",
                                backdropFilter: "blur(8px)",
                             }
                     }
                     initial={{ opacity: 0, y: 15 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.1 + idx * 0.08,
                     }}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.97 }}
                  >
                     {filter}
                  </motion.button>
               ))}
            </motion.div>

            {/* Vertical timeline */}
            <ProjectTimeline projects={filteredProjects} isMobile={isMobile} />

            {/* Open Source Contributions Banner */}
            <OpenSourceBanner />
         </div>
      </PageSection>
   );
};

export default Portfolio;
