import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ChevronDown } from "lucide-react";
import { AMBER, MONO_FONT, TEXT_MUTED } from "@/constants/theme";
import type { Education } from "@/types";

interface ExpandableExtrasProps {
   item: Education;
   marginLeft: number;
}

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const ExpandableExtras = ({ item, marginLeft }: ExpandableExtrasProps) => {
   const [isExpanded, setIsExpanded] = useState(false);

   const hasAchievements = (item.achievements?.length ?? 0) > 0;
   const hasSkills = (item.skills?.length ?? 0) > 0;

   if (!hasAchievements && !hasSkills) return null;

   return (
      <>
         {/* Skills - always visible */}
         {hasSkills && (
            <div
               style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 14,
                  marginLeft,
               }}
            >
               {item.skills.map((skill) => (
                  <span
                     key={skill}
                     style={{
                        fontFamily: MONO_FONT,
                        fontSize: 11,
                        padding: "3px 10px",
                        borderRadius: 6,
                        background: "rgba(168,85,247,0.08)",
                        color: "#a855f7",
                        border: "1px solid rgba(168,85,247,0.15)",
                     }}
                  >
                     {skill}
                  </span>
               ))}
            </div>
         )}

         {/* Achievements - expandable dropdown */}
         {hasAchievements && (
            <div style={{ marginLeft, marginTop: 12 }}>
               <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                     display: "flex",
                     alignItems: "center",
                     gap: 8,
                     padding: "7px 12px",
                     borderRadius: 8,
                     background: "rgba(245,158,11,0.05)",
                     border: "1px solid rgba(245,158,11,0.12)",
                     cursor: "pointer",
                     color: TEXT_MUTED,
                     fontSize: 12,
                     fontWeight: 500,
                     transition: "all 0.2s ease",
                     width: "100%",
                  }}
               >
                  <Trophy size={13} style={{ color: AMBER, flexShrink: 0 }} />
                  <span style={{ flex: 1, textAlign: "left" }}>
                     {item.achievements!.length} Achievements
                  </span>
                  <motion.div
                     animate={{ rotate: isExpanded ? 180 : 0 }}
                     transition={{ duration: 0.2 }}
                  >
                     <ChevronDown size={14} />
                  </motion.div>
               </button>

               <AnimatePresence>
                  {isExpanded && (
                     <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EXPO_EASE }}
                        style={{ overflow: "hidden" }}
                     >
                        <ul
                           style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              marginTop: 10,
                           }}
                        >
                           {item.achievements!.map((achievement) => (
                              <li
                                 key={achievement}
                                 style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 10,
                                 }}
                              >
                                 <span
                                    style={{
                                       width: 6,
                                       height: 6,
                                       borderRadius: "50%",
                                       backgroundColor: "rgba(245,158,11,0.5)",
                                       marginTop: 7,
                                       flexShrink: 0,
                                    }}
                                 />
                                 <span
                                    style={{
                                       color: "#a5a5c0",
                                       fontSize: 13,
                                       lineHeight: 1.6,
                                    }}
                                 >
                                    {achievement}
                                 </span>
                              </li>
                           ))}
                        </ul>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         )}
      </>
   );
};

export default ExpandableExtras;
