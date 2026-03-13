import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, FolderGit2, Mic2, FileText, GraduationCap, Building2 } from "lucide-react";
import TechTag from "@components/ui/TechTag";
import {
   TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
   CYAN, PURPLE, MONO_FONT,
} from "@/constants/theme";
import type { ProfessionalExperience, InternalContribution } from "@/types";

interface Props {
   experience: ProfessionalExperience | null;
   onClose: () => void;
}

const ICON = { talk: Mic2, publication: FileText, program: GraduationCap };
const TYPE_COLOR = { talk: CYAN, publication: PURPLE, program: "#22c55e" };

const ExperienceModal = ({ experience, onClose }: Props) => {
   const scrollRef = useRef<HTMLDivElement>(null);

   const onEsc = useCallback(
      (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
      [onClose],
   );

   useEffect(() => {
      if (!experience) return;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onEsc);
      return () => {
         document.body.style.overflow = "";
         document.removeEventListener("keydown", onEsc);
      };
   }, [experience, onEsc]);

   const allSkills = experience?.projects
      ? [...new Set(experience.projects.flatMap((p) => p.skills))].slice(0, 15)
      : [];

   return (
      <AnimatePresence>
         {experience && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
               onClick={onClose}
               style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 20,
                  background: "rgba(0,0,0,0.3)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  overscrollBehavior: "contain",
               }}
            >
               <motion.div
                  ref={scrollRef}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  style={{
                     position: "relative",
                     width: "100%",
                     maxWidth: 720,
                     maxHeight: "85vh",
                     overflowY: "auto",
                     borderRadius: 20,
                     border: "1px solid rgba(255,255,255,0.1)",
                     background: "linear-gradient(180deg, rgba(15,15,30,0.98) 0%, rgba(8,8,20,0.99) 100%)",
                     boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(6,182,212,0.04)",
                  }}
               >
                  {/* Header with glass bar */}
                  <div style={{
                     position: "sticky", top: 0, zIndex: 10,
                     padding: "20px 24px 16px",
                     background: "rgba(12,12,28,0.9)",
                     backdropFilter: "blur(20px)",
                     WebkitBackdropFilter: "blur(20px)",
                     borderBottom: "1px solid rgba(255,255,255,0.06)",
                     borderRadius: "20px 20px 0 0",
                  }}>
                     <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <Building2 size={18} style={{ color: CYAN }} />
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, flex: 1 }}>
                           {experience.company}
                        </h3>
                        <button
                           onClick={onClose}
                           aria-label="Close"
                           style={{
                              padding: 8, background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 10, cursor: "pointer", color: TEXT_SECONDARY,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "background 0.2s",
                           }}
                        >
                           <X size={16} />
                        </button>
                     </div>
                     <p style={{ fontSize: 13, color: CYAN, fontFamily: MONO_FONT }}>
                        {experience.title} | {experience.date}
                     </p>
                  </div>

                  {/* Scrollable content */}
                  <div style={{ padding: "20px 24px 28px" }}>
                     {/* Projects */}
                     {experience.projects?.map((proj) => (
                        <div key={proj.name} style={{
                           marginBottom: 20,
                           padding: "16px 18px",
                           borderRadius: 14,
                           background: "rgba(255,255,255,0.02)",
                           border: "1px solid rgba(255,255,255,0.05)",
                        }}>
                           <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <FolderGit2 size={14} style={{ color: CYAN, flexShrink: 0 }} />
                              <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY, flex: 1 }}>{proj.name}</span>
                              {proj.date && (
                                 <span style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: MONO_FONT, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)" }}>
                                    {proj.date}
                                 </span>
                              )}
                           </div>
                           <ul style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                              {Object.entries(proj.description).sort(([a], [b]) => a.localeCompare(b)).map(([, text]) => (
                                 <li key={text} style={{ color: TEXT_SECONDARY, fontSize: 13, lineHeight: 1.7, display: "flex", alignItems: "flex-start", gap: 8 }}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: `${CYAN}80`, marginTop: 8, flexShrink: 0 }} />
                                    {text}
                                 </li>
                              ))}
                           </ul>
                           <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {proj.skills.map((s) => <TechTag key={s} label={s} accent={CYAN} size={10} />)}
                           </div>
                        </div>
                     ))}

                     {/* Internal Contributions */}
                     {(experience.internal_contributions?.length ?? 0) > 0 && (
                        <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                           <p style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                              Internal Contributions
                           </p>
                           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {experience.internal_contributions!.map((c: InternalContribution) => {
                                 const Icon = ICON[c.type] || FileText;
                                 const color = TYPE_COLOR[c.type] || CYAN;
                                 return (
                                    <div key={c.title} style={{
                                       display: "flex", alignItems: "center", gap: 10,
                                       padding: "8px 12px", borderRadius: 10,
                                       background: "rgba(255,255,255,0.02)",
                                       border: "1px solid rgba(255,255,255,0.04)",
                                    }}>
                                       <div style={{
                                          width: 28, height: 28, borderRadius: 8,
                                          background: `${color}12`, display: "flex",
                                          alignItems: "center", justifyContent: "center", flexShrink: 0,
                                       }}>
                                          <Icon size={14} style={{ color }} />
                                       </div>
                                       <span style={{ fontSize: 13, color: TEXT_SECONDARY, flex: 1 }}>{c.title}</span>
                                       {c.year && (
                                          <span style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: MONO_FONT, flexShrink: 0 }}>{c.year}</span>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                     {/* Internal Achievements */}
                     {(experience.internal_achievements?.length ?? 0) > 0 && (
                        <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                           <p style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                              Internal Achievements
                           </p>
                           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {experience.internal_achievements!.map((c: InternalContribution) => {
                                 const Icon = ICON[c.type] || GraduationCap;
                                 const color = "#f59e0b";
                                 return (
                                    <div key={c.title} style={{
                                       display: "flex", alignItems: "center", gap: 10,
                                       padding: "8px 12px", borderRadius: 10,
                                       background: "rgba(245,158,11,0.03)",
                                       border: "1px solid rgba(245,158,11,0.08)",
                                    }}>
                                       <div style={{
                                          width: 28, height: 28, borderRadius: 8,
                                          background: `${color}12`, display: "flex",
                                          alignItems: "center", justifyContent: "center", flexShrink: 0,
                                       }}>
                                          <Icon size={14} style={{ color }} />
                                       </div>
                                       <span style={{ fontSize: 13, color: TEXT_SECONDARY, flex: 1 }}>{c.title}</span>
                                       {c.year && (
                                          <span style={{ fontSize: 10, color: TEXT_MUTED, fontFamily: MONO_FONT, flexShrink: 0 }}>{c.year}</span>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                     {/* Key Skills */}
                     {allSkills.length > 0 && (
                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                           <p style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                              Key Skills
                           </p>
                           <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {allSkills.map((s) => <TechTag key={s} label={s} accent={CYAN} />)}
                           </div>
                        </div>
                     )}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

export default ExperienceModal;
