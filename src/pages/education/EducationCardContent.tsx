import { GraduationCap } from "lucide-react";
import type { Education } from "@/types";
import AnimatedCounter from "@components/ui/AnimatedCounter";
import EntryHeader, { EntryMeta } from "@components/ui/EntryHeader";
import { ENTRY_INDENT } from "@components/ui/entryStyles";
import { getSectionCopy } from "@data/sections";
import ExpandableExtras from "./ExpandableExtras";

const COPY = getSectionCopy("education").card;

interface EducationCardContentProps {
   item: Education;
   accentColor: string;
   isMobile: boolean;
}

const EducationCardContent = ({
   item,
   accentColor,
   isMobile,
}: EducationCardContentProps) => {
   const lines = [item.department, item.board, item.field].filter(
      (line): line is string => Boolean(line),
   );

   return (
      <>
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
         <ExpandableExtras
            item={item}
            accentColor={accentColor}
            marginLeft={isMobile ? 0 : ENTRY_INDENT}
         />
      </>
   );
};

export default EducationCardContent;
