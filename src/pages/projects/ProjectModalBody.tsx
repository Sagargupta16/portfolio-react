import { Suspense, type ComponentType, type ReactNode } from "react";
import { motion } from "motion/react";
import { ExternalLink, Sparkles, Check, Play } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import TechTag from "@components/ui/TechTag";
import GlossText from "@components/ui/GlossText";
import CaseStudyBrief from "@components/ui/CaseStudyBrief";
import { hasProjectUrl } from "@utils/projectMetadata";
import {
   TEXT_SECONDARY,
   TEXT_MUTED,
   MONO_FONT,
   EASING,
} from "@/constants/theme";
import type { CategoryColors, ProjectWithCategory } from "./projectConstants";
import { getProjectDemo } from "./demos/demoRegistry";

interface ProjectModalBodyProps {
   project: ProjectWithCategory;
   colors: CategoryColors;
   isMobile: boolean;
}

/** Shared fade-in-up transition used by every section in the modal body. */
const fadeInUpProps = (delay: number) => ({
   initial: { opacity: 0, y: 10 },
   animate: { opacity: 1, y: 0 },
   transition: { delay, duration: 0.4, ease: EASING.cinematic },
});

const sectionLabelStyle: React.CSSProperties = {
   fontSize: 11,
   color: TEXT_MUTED,
   fontWeight: 600,
   textTransform: "uppercase",
   letterSpacing: "0.06em",
   marginBottom: 8,
};

interface ModalLinkProps {
   href: string;
   ariaLabel: string;
   icon: ComponentType<{ size?: number }>;
   label: string;
   /** "primary" = solid blue (Live Demo), "outline" = soft white (Source). */
   kind: "primary" | "outline";
}

const ModalLink = ({
   href,
   ariaLabel,
   icon: Icon,
   label,
   kind,
}: ModalLinkProps) => (
   <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={kind === "primary" ? "btn-primary" : "btn-outline"}
      style={{
         display: "inline-flex",
         alignItems: "center",
         gap: 8,
         padding: "10px 18px",
         fontSize: 13,
         textDecoration: "none",
      }}
      aria-label={`${ariaLabel} (opens in a new tab)`}
   >
      <Icon size={15} />
      {label}
   </a>
);

interface SectionProps {
   delay: number;
   label?: ReactNode;
   children: ReactNode;
}

const Section = ({ delay, label, children }: SectionProps) => (
   <motion.div {...fadeInUpProps(delay)}>
      {label && <p style={sectionLabelStyle}>{label}</p>}
      {children}
   </motion.div>
);

const ProjectModalBody = ({
   project,
   colors,
   isMobile,
}: ProjectModalBodyProps) => {
   const features = project.features ?? [];
   const contributors = project.contributors ?? [];
   const hasGithub = hasProjectUrl(project.github);
   const hasLive = hasProjectUrl(project.live);
   const demo = getProjectDemo(project.id);
   const brief = project.case_study;

   // Source and demo sit at the top, inside the brief when there is one, so
   // the "where can I inspect this" answer never needs a scroll.
   const links = (hasGithub || hasLive) && (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
         {hasLive && (
            <ModalLink
               href={project.live}
               ariaLabel={`View ${project.title} live demo`}
               icon={ExternalLink}
               label="Live Demo"
               kind="primary"
            />
         )}
         {hasGithub && (
            <ModalLink
               href={project.github}
               ariaLabel={`View ${project.title} on GitHub`}
               icon={FaGithub}
               label="View Source"
               kind="outline"
            />
         )}
      </div>
   );

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
            {...fadeInUpProps(0.18)}
            style={{
               color: TEXT_SECONDARY,
               fontSize: isMobile ? 13 : 14,
               lineHeight: 1.7,
            }}
         >
            <GlossText text={project.description} />
         </motion.p>

         {brief ? (
            <Section delay={0.21} label="At a glance">
               <CaseStudyBrief
                  brief={brief}
                  accent={colors.accent}
                  inspect={links || undefined}
               />
            </Section>
         ) : (
            links && <motion.div {...fadeInUpProps(0.21)}>{links}</motion.div>
         )}

         {/* Tech stack */}
         {project.tools_tech.length > 0 && (
            <Section delay={0.24} label="Tech Stack">
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
            </Section>
         )}

         {/* Case-study demo (lazy chunk per project) */}
         {demo && (
            <Section
               delay={0.27}
               label={
                  <span
                     style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                     }}
                  >
                     <Play size={12} style={{ color: colors.accent }} />
                     {demo.label}
                  </span>
               }
            >
               <Suspense
                  fallback={
                     <div
                        className="skeleton"
                        style={{ height: isMobile ? 260 : 220 }}
                     />
                  }
               >
                  <demo.Demo accent={colors.accent} isMobile={isMobile} />
               </Suspense>
            </Section>
         )}

         {/* Features */}
         {features.length > 0 && (
            <Section
               delay={0.3}
               label={
                  <span
                     style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                     }}
                  >
                     <Sparkles size={12} style={{ color: colors.accent }} />
                     Key Features
                  </span>
               }
            >
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
                        <Check
                           aria-hidden="true"
                           size={14}
                           style={{
                              color: colors.accent,
                              marginTop: 3,
                              flexShrink: 0,
                           }}
                        />
                        <span style={{ flex: 1 }}>{f}</span>
                     </li>
                  ))}
               </ul>
            </Section>
         )}

         {/* Contributors (collab projects) */}
         {contributors.length > 0 && (
            <Section delay={0.36} label="Contributors">
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
            </Section>
         )}
      </div>
   );
};

export default ProjectModalBody;
