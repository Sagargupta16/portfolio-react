import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import CompanyHeader from "./CompanyHeader";
import TimelineExpandedContent from "./TimelineExpandedContent";

interface TimelineCardContentProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   accentColor: string;
   isMobile: boolean;
   onAnimationComplete?: () => void;
}

const TimelineCardContent = ({
   item,
   accentColor,
   isMobile,
   onAnimationComplete,
}: TimelineCardContentProps) => {
   const [expanded, setExpanded] = useState(false);

   const hasProjects = "projects" in item && (item.projects?.length ?? 0) > 0;
   const descriptionItems = useMemo(
      () => Object.values(item.description || {}),
      [item.description],
   );
   const hasExpandable =
      hasProjects ||
      descriptionItems.length > 0 ||
      (item.skills?.length ?? 0) > 0;

   const ml = isMobile ? 0 : 38;
   const descSize = isMobile ? 13 : 14;

   return (
      <>
         <CompanyHeader
            item={item}
            accentColor={accentColor}
            isMobile={isMobile}
            marginLeft={ml}
         />

         {/* Expandable Section */}
         {hasExpandable && (
            <>
               <AnimatePresence initial={false}>
                  {expanded && (
                     <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                           height: "auto",
                           opacity: 1,
                           transition: {
                              height: {
                                 duration: 0.5,
                                 ease: [0.4, 0, 0.2, 1],
                              },
                              opacity: { duration: 0.4, delay: 0.1 },
                           },
                        }}
                        exit={{
                           height: 0,
                           opacity: 0,
                           transition: {
                              opacity: { duration: 0.2 },
                              height: {
                                 duration: 0.4,
                                 ease: [0.4, 0, 0.2, 1],
                                 delay: 0.15,
                              },
                           },
                        }}
                        onAnimationComplete={onAnimationComplete}
                        style={{ overflow: "hidden", marginLeft: ml }}
                     >
                        <TimelineExpandedContent
                           item={item}
                           accentColor={accentColor}
                           fontSize={descSize}
                        />
                     </motion.div>
                  )}
               </AnimatePresence>

               <button
                  onClick={() => setExpanded((prev) => !prev)}
                  style={{
                     color: accentColor,
                     fontSize: 13,
                     fontWeight: 500,
                     cursor: "pointer",
                     border: "none",
                     background: "none",
                     marginTop: 14,
                     marginLeft: ml,
                     display: "flex",
                     alignItems: "center",
                     gap: 4,
                     padding: 0,
                  }}
               >
                  {expanded ? "Show less" : "Show more"}
                  <motion.span
                     animate={{ rotate: expanded ? 180 : 0 }}
                     transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                     style={{ display: "flex", alignItems: "center" }}
                  >
                     <ChevronDown size={14} />
                  </motion.span>
               </button>
            </>
         )}
      </>
   );
};

export default TimelineCardContent;
