import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
   X,
   ExternalLink,
   Calendar,
   Users,
   Star,
   FolderGit2,
   Sparkles,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import useBreakpoint from "@hooks/useBreakpoint";
import useFocusTrap from "@hooks/useFocusTrap";
import TechTag from "@components/ui/TechTag";
import {
   EASING,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
   TEXT_MUTED,
   MONO_FONT,
} from "@/constants/theme";
import {
   CATEGORY_COLORS,
   type ProjectWithCategory,
} from "./portfolioConstants";

interface ProjectModalProps {
   project: ProjectWithCategory | null;
   onClose: () => void;
}

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const ProjectModal = ({ project, onClose }: ProjectModalProps) => {
   const { isMobile } = useBreakpoint();
   const dialogRef = useFocusTrap<HTMLDivElement>(project !== null);

   const onEsc = useCallback(
      (e: KeyboardEvent) => {
         if (e.key === "Escape") onClose();
      },
      [onClose],
   );

   useEffect(() => {
      if (!project) return;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onEsc);
      return () => {
         document.body.style.overflow = "";
         document.removeEventListener("keydown", onEsc);
      };
   }, [project, onEsc]);

   const colors = project
      ? CATEGORY_COLORS[project.category] || CATEGORY_COLORS.Others
      : CATEGORY_COLORS.Others;
   const isFeatured = project?.category === "Featured";
   const features = project?.features ?? [];
   const contributors = project?.contributors ?? [];
   const hasGithub =
      project?.github && project.github !== "" && project.github !== "#";
   const hasLive =
      project?.live && project.live !== "" && project.live !== "#";

   return createPortal(
      <AnimatePresence>
         {project && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.25 }}
               onClick={onClose}
               style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 1000,
                  display: "flex",
                  alignItems: isMobile ? "flex-end" : "center",
                  justifyContent: "center",
                  padding: isMobile ? 0 : 20,
                  background: "rgba(0,0,0,0.3)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  overscrollBehavior: "contain",
               }}
            >
               <motion.div
                  ref={dialogRef}
                  initial={{
                     opacity: 0,
                     y: isMobile ? 100 : 50,
                     scale: 0.95,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                     opacity: 0,
                     y: isMobile ? 100 : 30,
                     scale: 0.97,
                  }}
                  transition={{ duration: 0.4, ease: EASING.cinematic }}
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="project-modal-title"
                  tabIndex={-1}
                  style={{
                     position: "relative",
                     width: "100%",
                     maxWidth: isMobile ? "100%" : 720,
                     maxHeight: isMobile ? "92vh" : "85vh",
                     overflowY: "auto",
                     borderRadius: isMobile ? "20px 20px 0 0" : 20,
                     border: "1px solid rgba(255,255,255,0.1)",
                     background:
                        "linear-gradient(180deg, rgba(15,15,30,0.98) 0%, rgba(8,8,20,0.99) 100%)",
                     boxShadow:
                        "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(6,182,212,0.04)",
                  }}
               >
                  {/* Category accent bar */}
                  <div
                     style={{
                        height: isFeatured ? 4 : 3,
                        background: colors.gradient,
                        borderRadius: "20px 20px 0 0",
                     }}
                  />

                  {/* Sticky header */}
                  <motion.div
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{
                        delay: 0.1,
                        duration: 0.4,
                        ease: EXPO_EASE,
                     }}
                     style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        padding: isMobile
                           ? "16px 16px 12px"
                           : "20px 24px 16px",
                        background: "rgba(12,12,28,0.9)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                     }}
                  >
                     <div
                        style={{
                           display: "flex",
                           alignItems: "center",
                           gap: 8,
                           marginBottom: 4,
                        }}
                     >
                        {isFeatured ? (
                           <Star
                              size={isMobile ? 16 : 18}
                              style={{ color: colors.accent, flexShrink: 0 }}
                           />
                        ) : (
                           <FolderGit2
                              size={isMobile ? 16 : 18}
                              style={{ color: colors.accent, flexShrink: 0 }}
                           />
                        )}
                        <h3
                           id="project-modal-title"
                           style={{
                              fontSize: isMobile ? 15 : 18,
                              fontWeight: 700,
                              color: TEXT_PRIMARY,
                              flex: 1,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                           }}
                        >
                           {project.title}
                        </h3>
                        <button
                           onClick={onClose}
                           aria-label="Close project details"
                           style={{
                              padding: 8,
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 10,
                              cursor: "pointer",
                              color: TEXT_SECONDARY,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                           }}
                        >
                           <X size={16} />
                        </button>
                     </div>

                     <div
                        style={{
                           display: "flex",
                           alignItems: "center",
                           gap: 12,
                           flexWrap: "wrap",
                        }}
                     >
                        <span
                           style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: isMobile ? 11 : 12,
                              color: colors.accent,
                              fontFamily: MONO_FONT,
                           }}
                        >
                           <Calendar size={11} style={{ flexShrink: 0 }} />
                           {project.date}
                        </span>
                        {project.team && (
                           <span
                              style={{
                                 display: "inline-flex",
                                 alignItems: "center",
                                 gap: 4,
                                 fontSize: isMobile ? 11 : 12,
                                 color: TEXT_MUTED,
                                 fontFamily: MONO_FONT,
                              }}
                           >
                              <Users size={11} style={{ flexShrink: 0 }} />
                              {project.team}
                           </span>
                        )}
                        <span
                           style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              color: colors.accent,
                              padding: "2px 8px",
                              borderRadius: 6,
                              background: `${colors.bgAlpha}0.1)`,
                              border: `1px solid ${colors.borderAlpha}0.2)`,
                           }}
                        >
                           {project.category}
                        </span>
                     </div>
                  </motion.div>

                  {/* Body */}
                  <div
                     style={{
                        padding: isMobile
                           ? "16px 14px 24px"
                           : "20px 24px 28px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 20,
                     }}
                  >
                     {/* Description */}
                     <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                           delay: 0.18,
                           duration: 0.4,
                           ease: EXPO_EASE,
                        }}
                        style={{
                           color: TEXT_SECONDARY,
                           fontSize: isMobile ? 13 : 14,
                           lineHeight: 1.7,
                        }}
                     >
                        {project.description}
                     </motion.p>

                     {/* Tech stack */}
                     {project.tools_tech.length > 0 && (
                        <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{
                              delay: 0.24,
                              duration: 0.4,
                              ease: EXPO_EASE,
                           }}
                        >
                           <p
                              style={{
                                 fontSize: 11,
                                 color: TEXT_MUTED,
                                 fontWeight: 600,
                                 textTransform: "uppercase",
                                 letterSpacing: "0.06em",
                                 marginBottom: 8,
                              }}
                           >
                              Tech Stack
                           </p>
                           <div
                              style={{
                                 display: "flex",
                                 flexWrap: "wrap",
                                 gap: 4,
                              }}
                           >
                              {project.tools_tech.map((t) => (
                                 <TechTag
                                    key={t}
                                    label={t}
                                    accent={colors.accent}
                                    size={11}
                                 />
                              ))}
                           </div>
                        </motion.div>
                     )}

                     {/* Features */}
                     {features.length > 0 && (
                        <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{
                              delay: 0.3,
                              duration: 0.4,
                              ease: EXPO_EASE,
                           }}
                        >
                           <p
                              style={{
                                 display: "inline-flex",
                                 alignItems: "center",
                                 gap: 6,
                                 fontSize: 11,
                                 color: TEXT_MUTED,
                                 fontWeight: 600,
                                 textTransform: "uppercase",
                                 letterSpacing: "0.06em",
                                 marginBottom: 10,
                              }}
                           >
                              <Sparkles
                                 size={12}
                                 style={{ color: colors.accent }}
                              />
                              Key Features
                           </p>
                           <ul
                              style={{
                                 display: "flex",
                                 flexDirection: "column",
                                 gap: 8,
                              }}
                           >
                              {features.map((f) => (
                                 <li
                                    key={f}
                                    style={{
                                       display: "flex",
                                       alignItems: "flex-start",
                                       gap: 10,
                                       color: TEXT_SECONDARY,
                                       fontSize: isMobile ? 12 : 13,
                                       lineHeight: 1.6,
                                    }}
                                 >
                                    <span
                                       aria-hidden="true"
                                       style={{
                                          width: 6,
                                          height: 6,
                                          borderRadius: "50%",
                                          background: colors.accent,
                                          marginTop: 7,
                                          flexShrink: 0,
                                          boxShadow: `0 0 6px ${colors.accent}66`,
                                       }}
                                    />
                                    <span style={{ flex: 1 }}>{f}</span>
                                 </li>
                              ))}
                           </ul>
                        </motion.div>
                     )}

                     {/* Contributors (collab projects) */}
                     {contributors.length > 0 && (
                        <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{
                              delay: 0.36,
                              duration: 0.4,
                              ease: EXPO_EASE,
                           }}
                        >
                           <p
                              style={{
                                 fontSize: 11,
                                 color: TEXT_MUTED,
                                 fontWeight: 600,
                                 textTransform: "uppercase",
                                 letterSpacing: "0.06em",
                                 marginBottom: 8,
                              }}
                           >
                              Contributors
                           </p>
                           <div
                              style={{
                                 display: "flex",
                                 flexWrap: "wrap",
                                 gap: 4,
                              }}
                           >
                              {contributors.map((c) => (
                                 <span
                                    key={c}
                                    style={{
                                       fontFamily: MONO_FONT,
                                       fontSize: 11,
                                       padding: "3px 8px",
                                       borderRadius: 6,
                                       background: "rgba(255,255,255,0.03)",
                                       color: TEXT_SECONDARY,
                                       border:
                                          "1px solid rgba(255,255,255,0.06)",
                                    }}
                                 >
                                    {c}
                                 </span>
                              ))}
                           </div>
                        </motion.div>
                     )}

                     {/* Links */}
                     {(hasGithub || hasLive) && (
                        <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{
                              delay: 0.42,
                              duration: 0.4,
                              ease: EXPO_EASE,
                           }}
                           style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              paddingTop: 4,
                              borderTop: "1px solid rgba(255,255,255,0.06)",
                              marginTop: 4,
                           }}
                        >
                           {hasGithub && (
                              <a
                                 href={project.github}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "8px 14px",
                                    marginTop: 12,
                                    borderRadius: 10,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: TEXT_PRIMARY,
                                    border: `1px solid ${colors.accent}40`,
                                    background: `${colors.accent}10`,
                                    textDecoration: "none",
                                 }}
                                 aria-label={`View ${project.title} on GitHub`}
                              >
                                 <FaGithub size={14} />
                                 View Source
                              </a>
                           )}
                           {hasLive && (
                              <a
                                 href={project.live}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "8px 14px",
                                    marginTop: 12,
                                    borderRadius: 10,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: TEXT_PRIMARY,
                                    border: `1px solid ${colors.accent}40`,
                                    background: `${colors.accent}10`,
                                    textDecoration: "none",
                                 }}
                                 aria-label={`View ${project.title} live demo`}
                              >
                                 <ExternalLink size={14} />
                                 Live Demo
                              </a>
                           )}
                        </motion.div>
                     )}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>,
      document.body,
   );
};

export default ProjectModal;
