import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ChevronDown } from "lucide-react";
import { AMBER, TEXT_MUTED } from "@/constants/theme";
import useReducedMotion from "@utils/useReducedMotion";
import type { Education } from "@/types";
import EducationCardExtras from "./EducationCardExtras";

interface ExpandableExtrasProps {
   item: Education;
   marginLeft: number;
}

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const ExpandableExtras = ({ item, marginLeft }: ExpandableExtrasProps) => {
   const [isExpanded, setIsExpanded] = useState(false);
   const reducedMotion = useReducedMotion();

   const hasAchievements = (item.achievements?.length ?? 0) > 0;
   const hasSkills = (item.skills?.length ?? 0) > 0;

   // If no expandable content, render nothing
   if (!hasAchievements && !hasSkills) return null;

   // If reduced motion or no achievements (just skills), show directly
   if (reducedMotion || !hasAchievements) {
      return <EducationCardExtras item={item} marginLeft={marginLeft} />;
   }

   const count = (item.achievements?.length ?? 0) + item.skills.length;

   return (
      <div style={{ marginLeft, marginTop: 12 }}>
         {/* Toggle button */}
         <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
               display: "flex",
               alignItems: "center",
               gap: 8,
               padding: "8px 12px",
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
               {count} achievements & skills
            </span>
            <motion.div
               animate={{ rotate: isExpanded ? 180 : 0 }}
               transition={{ duration: 0.2 }}
            >
               <ChevronDown size={14} />
            </motion.div>
         </button>

         {/* Expandable content */}
         <AnimatePresence>
            {isExpanded && (
               <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EXPO_EASE }}
                  style={{ overflow: "hidden" }}
               >
                  <EducationCardExtras item={item} marginLeft={0} />
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default ExpandableExtras;
