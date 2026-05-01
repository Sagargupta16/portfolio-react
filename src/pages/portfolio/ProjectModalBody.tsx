import { motion } from "motion/react";
import { ExternalLink, Sparkles } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import TechTag from "@components/ui/TechTag";
import {
   TEXT_PRIMARY,
   TEXT_SECONDARY,
   TEXT_MUTED,
   MONO_FONT,
} from "@/constants/theme";
import {
   isValidUrl,
   type CategoryColors,
   type ProjectWithCategory,
} from "./portfolioConstants";

interface ProjectModalBodyProps {
   project: ProjectWithCategory;
   colors: CategoryColors;
   isMobile: boolean;
}

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const linkButtonStyle = (accent: string): React.CSSProperties => ({
   display: "inline-flex",
   alignItems: "center",
   gap: 6,
   padding: "8px 14px",
   marginTop: 12,
   borderRadius: 10,
   fontSize: 12,
   fontWeight: 600,
   color: TEXT_PRIMARY,
   border: `1px solid ${accent}40`,
   background: `${accent}10`,
   textDecoration: "none",
});

const sectionLabelStyle: React.CSSProperties = {
   fontSize: 11,
   color: TEXT_MUTED,
   fontWeight: 600,
   textTransform: "uppercase",
   letterSpacing: "0.06em",
   marginBottom: 8,
};

const ProjectModalBody = ({
   project,
   colors,
   isMobile,
}: ProjectModalBodyProps) => {
   const features = project.features ?? [];
   const contributors = project.contributors ?? [];
   const hasGithub = isValidUrl(project.github);
   const hasLive = isValidUrl(project.live);

   return (
      <div
         style={{
            padding: isMobile ? "16px 14px 24px" : "20px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
         }}
      >
         {/* Description */}
         <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: EXPO_EASE }}
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
               transition={{ delay: 0.24, duration: 0.4, ease: EXPO_EASE }}
            >
               <p style={sectionLabelStyle}>Tech Stack</p>
               <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
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
               transition={{ delay: 0.3, duration: 0.4, ease: EXPO_EASE }}
            >
               <p
                  style={{
                     ...sectionLabelStyle,
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 6,
                     marginBottom: 10,
                  }}
               >
                  <Sparkles size={12} style={{ color: colors.accent }} />
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
               transition={{ delay: 0.36, duration: 0.4, ease: EXPO_EASE }}
            >
               <p style={sectionLabelStyle}>Contributors</p>
               <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
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
                           border: "1px solid rgba(255,255,255,0.06)",
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
               transition={{ delay: 0.42, duration: 0.4, ease: EXPO_EASE }}
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
                     style={linkButtonStyle(colors.accent)}
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
                     style={linkButtonStyle(colors.accent)}
                     aria-label={`View ${project.title} live demo`}
                  >
                     <ExternalLink size={14} />
                     Live Demo
                  </a>
               )}
            </motion.div>
         )}
      </div>
   );
};

export default ProjectModalBody;
