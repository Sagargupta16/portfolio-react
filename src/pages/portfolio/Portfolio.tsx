import { useState, useMemo, useCallback } from "react";
import type { ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   ExternalLink,
   FolderGit2,
   Calendar,
   Users,
   Star,
   GitPullRequest,
   GitMerge,
   CircleDot,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import {
   getFeaturedProjects,
   getCollaborativeProjects,
   getOtherProjects,
   getCommunityProjects,
   getOpenSourceContributions,
} from "@data/dataLoader";
import type { Project, OpenSourceContribution } from "@/types";
import {
   sectionRevealEnhanced,
   fadeInUp,
   scaleRotateIn,
} from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import SectionHeader from "@components/ui/SectionHeader";

const FILTERS = ["All", "Featured", "Community", "Collab", "Others"] as const;

const MONTHS: Record<string, number> = {
   January: 0,
   February: 1,
   March: 2,
   April: 3,
   May: 4,
   June: 5,
   July: 6,
   August: 7,
   September: 8,
   October: 9,
   November: 10,
   December: 11,
};

const parseDate = (dateStr: string): Date => {
   const [month, year] = dateStr.split(" ");
   return new Date(Number(year), MONTHS[month] || 0);
};

interface CategoryColors {
   accent: string;
   gradient: string;
   bgAlpha: string;
   borderAlpha: string;
}

const CATEGORY_COLORS: Record<string, CategoryColors> = {
   Featured: {
      accent: "#06b6d4",
      gradient: "linear-gradient(to right, #06b6d4, #3b82f6)",
      bgAlpha: "rgba(6,182,212,",
      borderAlpha: "rgba(6,182,212,",
   },
   Community: {
      accent: "#22c55e",
      gradient: "linear-gradient(to right, #22c55e, #16a34a)",
      bgAlpha: "rgba(34,197,94,",
      borderAlpha: "rgba(34,197,94,",
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

const OPEN_SOURCE_CONTRIBUTIONS: OpenSourceContribution[] =
   getOpenSourceContributions();

interface ProjectLinkProps {
   href: string;
   label: string;
   ariaLabel: string;
   icon: ComponentType<{ size?: number }>;
   accentColor?: string;
}

const ProjectLink = ({
   href,
   label,
   ariaLabel,
   icon: Icon,
   accentColor = "#06b6d4",
}: ProjectLinkProps) => (
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
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
         e.currentTarget.style.color = accentColor;
         e.currentTarget.style.borderColor = `${accentColor}4D`;
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
         e.currentTarget.style.color = "#a5a5c0";
         e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
      }}
      aria-label={ariaLabel}
   >
      <Icon size={14} />
      {label}
   </a>
);

interface ProjectWithCategory extends Project {
   category: string;
   achievement?: string;
}

interface ProjectCardProps {
   data: ProjectWithCategory;
   index?: number;
}

const ProjectCard = ({ data, index = 0 }: ProjectCardProps) => {
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
         variants={scaleRotateIn}
         initial="hidden"
         animate="visible"
         exit={{ opacity: 0, y: -20, scale: 0.95 }}
         transition={{
            ...(typeof scaleRotateIn.visible === "object" &&
            "transition" in scaleRotateIn.visible
               ? (
                    scaleRotateIn.visible as {
                       transition: Record<string, unknown>;
                    }
                 ).transition
               : {}),
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

interface ContribCardProps {
   contrib: OpenSourceContribution;
}

const ContribCard = ({ contrib }: ContribCardProps) => {
   const isMerged = contrib.status === "merged";
   const statusColor = isMerged ? "#a855f7" : "#22c55e";
   const StatusIcon = isMerged ? GitMerge : CircleDot;
   const hoverBg = isMerged ? "rgba(168,85,247,0.06)" : "rgba(34,197,94,0.06)";
   const hoverBorder = isMerged
      ? "rgba(168,85,247,0.2)"
      : "rgba(34,197,94,0.2)";

   return (
      <a
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
            border: `1px solid ${isMerged ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.04)"}`,
            textDecoration: "none",
            transition: "all 0.2s",
         }}
         onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = hoverBg;
            e.currentTarget.style.borderColor = hoverBorder;
         }}
         onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            e.currentTarget.style.borderColor = isMerged
               ? "rgba(168,85,247,0.1)"
               : "rgba(255,255,255,0.04)";
         }}
      >
         <StatusIcon
            size={14}
            style={{ color: statusColor, flexShrink: 0, marginTop: 3 }}
         />
         <div style={{ minWidth: 0, flex: 1 }}>
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  justifyContent: "space-between",
               }}
            >
               <span
                  style={{
                     fontSize: 11,
                     fontFamily: "JetBrains Mono, ui-monospace, monospace",
                     color: statusColor,
                     fontWeight: 600,
                  }}
               >
                  {contrib.repo}
               </span>
               <span
                  style={{
                     fontSize: 9,
                     fontFamily: "JetBrains Mono, ui-monospace, monospace",
                     fontWeight: 700,
                     letterSpacing: "0.05em",
                     textTransform: "uppercase",
                     padding: "2px 6px",
                     borderRadius: 4,
                     background: isMerged
                        ? "rgba(168,85,247,0.12)"
                        : "rgba(34,197,94,0.1)",
                     color: statusColor,
                     border: `1px solid ${isMerged ? "rgba(168,85,247,0.25)" : "rgba(34,197,94,0.2)"}`,
                     flexShrink: 0,
                  }}
               >
                  {isMerged ? "Merged" : "Open"}
               </span>
            </div>
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
   );
};

const OpenSourceBanner = () => {
   const merged = OPEN_SOURCE_CONTRIBUTIONS.filter(
      (c) => c.status === "merged",
   );
   const open = OPEN_SOURCE_CONTRIBUTIONS.filter((c) => c.status !== "merged");

   return (
      <motion.div
         style={{ marginTop: 64 }}
         initial={{ opacity: 0, y: 30 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ margin: "0px 0px -100px 0px" }}
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
            <span
               style={{
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, ui-monospace, monospace",
                  color: "#6e6e90",
                  fontWeight: 500,
               }}
            >
               ({OPEN_SOURCE_CONTRIBUTIONS.length})
            </span>
         </div>

         <div
            className="glass-card"
            style={{
               padding: 24,
               border: "1px solid rgba(34,197,94,0.2)",
               position: "relative",
               overflow: "hidden",
            }}
         >
            <div
               style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  padding: 1,
                  background:
                     "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(34,197,94,0.3), rgba(6,182,212,0.3))",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMask:
                     "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  pointerEvents: "none",
               }}
            />

            {merged.length > 0 && (
               <>
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                     }}
                  >
                     <GitMerge size={14} style={{ color: "#a855f7" }} />
                     <span
                        style={{
                           fontSize: 12,
                           fontWeight: 700,
                           color: "#a855f7",
                           fontFamily:
                              "JetBrains Mono, ui-monospace, monospace",
                           letterSpacing: "0.03em",
                        }}
                     >
                        Merged ({merged.length})
                     </span>
                  </div>
                  <div
                     style={{
                        display: "grid",
                        gridTemplateColumns:
                           "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 10,
                        marginBottom: open.length > 0 ? 20 : 0,
                     }}
                  >
                     {merged.map((contrib) => (
                        <ContribCard key={contrib.url} contrib={contrib} />
                     ))}
                  </div>
               </>
            )}

            {open.length > 0 && (
               <>
                  {merged.length > 0 && (
                     <div
                        style={{
                           height: 1,
                           background:
                              "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)",
                           marginBottom: 16,
                        }}
                     />
                  )}
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                     }}
                  >
                     <CircleDot size={14} style={{ color: "#22c55e" }} />
                     <span
                        style={{
                           fontSize: 12,
                           fontWeight: 700,
                           color: "#22c55e",
                           fontFamily:
                              "JetBrains Mono, ui-monospace, monospace",
                           letterSpacing: "0.03em",
                        }}
                     >
                        Under Review ({open.length})
                     </span>
                  </div>
                  <div
                     style={{
                        display: "grid",
                        gridTemplateColumns:
                           "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 10,
                     }}
                  >
                     {open.map((contrib) => (
                        <ContribCard key={contrib.url} contrib={contrib} />
                     ))}
                  </div>
               </>
            )}
         </div>
      </motion.div>
   );
};

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
      <motion.section
         id="projects"
         className="py-24 px-6"
         style={{ padding: isMobile ? "64px 16px" : "96px 24px" }}
         initial="hidden"
         whileInView="visible"
         viewport={{ margin: "0px 0px -100px 0px" }}
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

            {/* Vertical timeline */}
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
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                     position: "absolute",
                     left: isMobile ? 6 : "50%",
                     top: 0,
                     bottom: 0,
                     width: 2,
                     borderRadius: 1,
                     transformOrigin: "top",
                     background:
                        "linear-gradient(to bottom, rgba(6,182,212,0.3), rgba(168,85,247,0.2) 50%, rgba(245,158,11,0.15) 80%, transparent)",
                  }}
               />

               <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project, idx) => {
                     const isLeft = !isMobile && idx % 2 === 0;
                     const colors =
                        CATEGORY_COLORS[project.category] ||
                        CATEGORY_COLORS.Others;

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
                                 isMobile || !isLeft
                                    ? "flex-start"
                                    : "flex-end",
                              paddingLeft: pl,
                              paddingRight: pr,
                              marginTop: idx === 0 || isMobile ? 0 : -60,
                              position: "relative",
                              zIndex: filteredProjects.length - idx,
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
                              <ProjectCard data={project} index={idx} />
                           </div>
                        </motion.div>
                     );
                  })}
               </AnimatePresence>
            </div>

            {/* Open Source Contributions Banner */}
            <OpenSourceBanner />
         </div>
      </motion.section>
   );
};

export default Portfolio;
