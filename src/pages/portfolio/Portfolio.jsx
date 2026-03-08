import { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import {
   ExternalLink,
   FolderGit2,
   Calendar,
   Users,
   Star,
   GitPullRequest,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import {
   getFeaturedProjects,
   getCollaborativeProjects,
   getOtherProjects,
} from "@data/dataLoader";
import {
   sectionRevealEnhanced,
   staggerContainer,
   fadeInUp,
} from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import SectionHeader from "@components/ui/SectionHeader";

const FILTERS = ["All", "Featured", "Collab", "Others"];

const CATEGORY_COLORS = {
   Featured: {
      accent: "#06b6d4",
      gradient: "linear-gradient(to right, #06b6d4, #3b82f6)",
      bgAlpha: "rgba(6,182,212,",
      borderAlpha: "rgba(6,182,212,",
   },
   Collab: {
      accent: "#a855f7",
      gradient: "linear-gradient(to right, #a855f7, #6366f1)",
      bgAlpha: "rgba(168,85,247,",
      borderAlpha: "rgba(168,85,247,",
   },
   Others: {
      accent: "#f59e0b",
      gradient: "linear-gradient(to right, #f59e0b, #d97706)",
      bgAlpha: "rgba(245,158,11,",
      borderAlpha: "rgba(245,158,11,",
   },
};

const OPEN_SOURCE_CONTRIBUTIONS = [
   {
      repo: "apache/airflow",
      title: "Add template_fields support to SalesforceBulkOperator",
      url: "https://github.com/apache/airflow/pull/62840",
   },
   {
      repo: "chroma-core/chroma",
      title: "Fix: replace ValueError with InvalidArgumentError",
      url: "https://github.com/chroma-core/chroma/pull/6538",
   },
   {
      repo: "stanfordnlp/dspy",
      title: "Add docstrings to predict module public APIs",
      url: "https://github.com/stanfordnlp/dspy/pull/9381",
   },
   {
      repo: "awslabs/mcp",
      title: "Fix Kendra documentation menu structure",
      url: "https://github.com/awslabs/mcp/pull/2557",
   },
   {
      repo: "freeCodeCamp",
      title: "Fix Python custom exception example",
      url: "https://github.com/freeCodeCamp/freeCodeCamp/pull/66171",
   },
   {
      repo: "TheAlgorithms/Python",
      title: "Add confusion matrix with precision, recall, F1",
      url: "https://github.com/TheAlgorithms/Python/pull/14318",
   },
   {
      repo: "exercism/python",
      title: "Add approaches for armstrong-numbers exercise",
      url: "https://github.com/exercism/python/pull/4106",
   },
   {
      repo: "forem/selfhost",
      title: "Updated AWS Ansible, added elastic IP",
      url: "https://github.com/forem/selfhost/pull/91",
   },
];

const ProjectLink = ({
   href,
   label,
   ariaLabel,
   icon: Icon,
   accentColor = "#06b6d4",
}) => (
   <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
         display: "inline-flex",
         alignItems: "center",
         gap: 6,
         padding: "6px 14px",
         borderRadius: 8,
         fontSize: 12,
         fontWeight: 500,
         color: "#a5a5c0",
         border: "1px solid rgba(255, 255, 255, 0.06)",
         background: "rgba(255, 255, 255, 0.03)",
         backdropFilter: "blur(8px)",
         textDecoration: "none",
         transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
         e.currentTarget.style.color = accentColor;
         e.currentTarget.style.borderColor = `${accentColor}4D`;
      }}
      onMouseLeave={(e) => {
         e.currentTarget.style.color = "#a5a5c0";
         e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
      }}
      aria-label={ariaLabel}
   >
      <Icon size={14} />
      {label}
   </a>
);

ProjectLink.propTypes = {
   href: PropTypes.string.isRequired,
   label: PropTypes.string.isRequired,
   ariaLabel: PropTypes.string.isRequired,
   icon: PropTypes.elementType.isRequired,
   accentColor: PropTypes.string,
};

const ProjectCard = ({ data, index = 0 }) => {
   const hasGithub = data.github && data.github !== "" && data.github !== "#";
   const hasLive = data.live && data.live !== "" && data.live !== "#";
   const colors = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.Others;
   const isFeatured = data.category === "Featured";
   const isCollab = data.category === "Collab";

   return (
      <motion.div
         className="glass-card"
         style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
         }}
         layout
         initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
         animate={{ opacity: 1, scale: 1, rotate: 0 }}
         exit={{ opacity: 0, y: -20, scale: 0.95 }}
         transition={{
            type: "spring",
            stiffness: 80,
            damping: 16,
            delay: Math.min(index * 0.1, 0.8),
            layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
         }}
         whileHover={{
            y: -6,
            transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
         }}
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
            {/* Header: icon + title */}
            <div
               style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 12,
               }}
            >
               <div
                  style={{
                     width: 36,
                     height: 36,
                     borderRadius: 10,
                     background: `${colors.bgAlpha}0.1)`,
                     border: `1px solid ${colors.borderAlpha}0.2)`,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     flexShrink: 0,
                     marginTop: 2,
                  }}
               >
                  {isFeatured ? (
                     <Star size={18} style={{ color: colors.accent }} />
                  ) : (
                     <FolderGit2 size={18} style={{ color: colors.accent }} />
                  )}
               </div>
               <div style={{ minWidth: 0, flex: 1 }}>
                  <h3
                     style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#eeeef5",
                        lineHeight: 1.3,
                     }}
                  >
                     {data.title}
                  </h3>
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 6,
                        flexWrap: "wrap",
                     }}
                  >
                     <span
                        style={{
                           display: "inline-flex",
                           alignItems: "center",
                           gap: 4,
                           fontSize: 11,
                           color: "#6e6e90",
                           fontFamily:
                              "JetBrains Mono, ui-monospace, monospace",
                        }}
                     >
                        <Calendar size={10} style={{ flexShrink: 0 }} />
                        {data.date}
                     </span>
                     {(isCollab || (isFeatured && data.team)) && data.team && (
                        <span
                           style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                              color: colors.accent,
                              fontFamily:
                                 "JetBrains Mono, ui-monospace, monospace",
                           }}
                        >
                           <Users size={10} style={{ flexShrink: 0 }} />
                           {data.team}
                        </span>
                     )}
                  </div>
               </div>
            </div>

            {/* Featured badge */}
            {isFeatured && (
               <div
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 4,
                     padding: "3px 10px",
                     borderRadius: 6,
                     background: `${colors.bgAlpha}0.08)`,
                     border: `1px solid ${colors.borderAlpha}0.15)`,
                     fontSize: 10,
                     fontWeight: 700,
                     color: colors.accent,
                     letterSpacing: "0.05em",
                     textTransform: "uppercase",
                     marginBottom: 12,
                     alignSelf: "flex-start",
                  }}
               >
                  <Star size={10} />
                  Featured
               </div>
            )}

            {/* Achievement badge for collaborative */}
            {isCollab && data.achievement && (
               <div
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 6,
                     padding: "4px 10px",
                     borderRadius: 6,
                     background: "rgba(245,158,11,0.08)",
                     border: "1px solid rgba(245,158,11,0.15)",
                     fontSize: 11,
                     fontWeight: 600,
                     color: "#f59e0b",
                     marginBottom: 12,
                     alignSelf: "flex-start",
                  }}
               >
                  {data.achievement}
               </div>
            )}

            {/* Description */}
            <p
               style={{
                  color: "#a5a5c0",
                  fontSize: 13,
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
                  gap: 6,
                  marginBottom: 16,
               }}
            >
               {data.tools_tech.map((tool) => (
                  <span
                     key={`${data.id}-tool-${tool}`}
                     style={{
                        fontFamily: "JetBrains Mono, ui-monospace, monospace",
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 5,
                        background: `${colors.bgAlpha}0.08)`,
                        color: colors.accent,
                        border: `1px solid ${colors.borderAlpha}0.15)`,
                     }}
                  >
                     {tool}
                  </span>
               ))}
            </div>

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

ProjectCard.propTypes = {
   data: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      date: PropTypes.string,
      tools_tech: PropTypes.arrayOf(PropTypes.string),
      github: PropTypes.string,
      live: PropTypes.string,
      category: PropTypes.string,
      team: PropTypes.string,
      achievement: PropTypes.string,
   }).isRequired,
   index: PropTypes.number,
};

const OpenSourceBanner = () => (
   <motion.div
      style={{ marginTop: 64 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
   >
      <div
         style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            justifyContent: "center",
         }}
      >
         <GitPullRequest size={20} style={{ color: "#22c55e" }} />
         <h3 style={{ fontSize: 20, fontWeight: 700, color: "#eeeef5" }}>
            Open Source Contributions
         </h3>
      </div>

      <div
         className="glass-card"
         style={{
            padding: 24,
            borderImage:
               "linear-gradient(135deg, rgba(34,197,94,0.3), rgba(6,182,212,0.3), rgba(168,85,247,0.3)) 1",
            borderWidth: 1,
            borderStyle: "solid",
         }}
      >
         <div
            style={{
               display: "grid",
               gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
               gap: 12,
            }}
         >
            {OPEN_SOURCE_CONTRIBUTIONS.map((contrib) => (
               <a
                  key={contrib.url}
                  href={contrib.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                     display: "flex",
                     alignItems: "flex-start",
                     gap: 10,
                     padding: "12px 14px",
                     borderRadius: 10,
                     background: "rgba(255,255,255,0.02)",
                     border: "1px solid rgba(255,255,255,0.04)",
                     textDecoration: "none",
                     transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                     e.currentTarget.style.background = "rgba(34,197,94,0.06)";
                     e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)";
                  }}
                  onMouseLeave={(e) => {
                     e.currentTarget.style.background =
                        "rgba(255,255,255,0.02)";
                     e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.04)";
                  }}
               >
                  <GitPullRequest
                     size={14}
                     style={{ color: "#22c55e", flexShrink: 0, marginTop: 3 }}
                  />
                  <div style={{ minWidth: 0 }}>
                     <span
                        style={{
                           fontSize: 11,
                           fontFamily:
                              "JetBrains Mono, ui-monospace, monospace",
                           color: "#22c55e",
                           fontWeight: 600,
                        }}
                     >
                        {contrib.repo}
                     </span>
                     <p
                        style={{
                           fontSize: 12,
                           color: "#a5a5c0",
                           lineHeight: 1.4,
                           marginTop: 2,
                           overflow: "hidden",
                           textOverflow: "ellipsis",
                           whiteSpace: "nowrap",
                        }}
                     >
                        {contrib.title}
                     </p>
                  </div>
               </a>
            ))}
         </div>
      </div>
   </motion.div>
);

const Portfolio = () => {
   const [activeFilter, setActiveFilter] = useState("All");

   const handleFilterChange = useCallback((filter) => {
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
   const collaborativeProjects = useMemo(() => getCollaborativeProjects(), []);
   const otherProjects = useMemo(() => getOtherProjects(), []);

   const filteredProjects = useMemo(() => {
      const featured = featuredProjects.map((p) => ({
         ...p,
         category: "Featured",
      }));
      const collab = collaborativeProjects.map((p) => ({
         ...p,
         category: "Collab",
      }));
      const others = otherProjects.map((p) => ({ ...p, category: "Others" }));

      if (activeFilter === "Featured") return featured;
      if (activeFilter === "Collab") return collab;
      if (activeFilter === "Others") return others;
      return [...featured, ...collab, ...others];
   }, [activeFilter, featuredProjects, collaborativeProjects, otherProjects]);

   return (
      <motion.section
         id="projects"
         className="py-24 px-6"
         style={{ padding: isMobile ? "64px 16px" : "96px 24px" }}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, amount: 0.1 }}
         variants={sectionRevealEnhanced}
      >
         <SectionHeader title="Projects" subtitle="Things I've built" />

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
                                fontFamily:
                                   "JetBrains Mono, ui-monospace, monospace",
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

            <motion.div
               style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                     ? "1fr"
                     : "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 20,
               }}
               variants={staggerContainer}
            >
               <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project, idx) => (
                     <ProjectCard
                        key={`${project.category}-${project.id}`}
                        data={project}
                        index={idx}
                     />
                  ))}
               </AnimatePresence>
            </motion.div>

            {/* Open Source Contributions Banner */}
            <OpenSourceBanner />
         </div>
      </motion.section>
   );
};

export default Portfolio;
