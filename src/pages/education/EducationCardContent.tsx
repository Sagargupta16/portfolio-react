import { GraduationCap } from "lucide-react";
import type { Education } from "@/types";
import useBreakpoint from "@hooks/useBreakpoint";
import AnimatedCounter from "@components/ui/AnimatedCounter";
import EntryHeader, { EntryMeta } from "@components/ui/EntryHeader";
import { EntryChipList } from "@components/ui/EntryDetails";
import TimelineEntry from "@components/ui/TimelineEntry";
import { getSectionCopy } from "@data/sections";
import ExpandableExtras from "./ExpandableExtras";

const COPY = getSectionCopy("education").card;

interface EducationCardContentProps {
   item: Education;
   accentColor: string;
   isMobile: boolean;
}

/**
 * One degree or class on the Education timeline, on the same card as a role:
 * the coursework in the card's list column, the achievements under the head.
 */
const EducationCardContent = ({
   item,
   accentColor,
   isMobile,
}: EducationCardContentProps) => {
   const { isTablet } = useBreakpoint();
   const lines = [item.department, item.board, item.field].filter(
      (line): line is string => Boolean(line),
   );

   return (
      <TimelineEntry
         date={item.date}
         location={item.location}
         accentColor={accentColor}
         isMobile={isMobile}
         aside={
            item.skills.length > 0 ? (
               <EntryChipList
                  label={COPY.coursework}
                  items={item.skills}
                  padded={!(isMobile || isTablet)}
               />
            ) : undefined
         }
         footer={
            (item.achievements?.length ?? 0) > 0 ? (
               <ExpandableExtras item={item} accentColor={accentColor} />
            ) : undefined
         }
      >
         <EntryHeader
            org={item.institution}
            title={item.title}
            meta={
               item.cgpa ? (
                  <EntryMeta>
                     {COPY.cgpa}
                     <AnimatedCounter value={item.cgpa} inline />
                  </EntryMeta>
               ) : null
            }
            lines={lines}
            fallbackIcon={GraduationCap}
            isMobile={isMobile}
         />
      </TimelineEntry>
   );
};

export default EducationCardContent;
