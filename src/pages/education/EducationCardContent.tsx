import { BookOpen } from "lucide-react";
import type { Education } from "@/types";
import { TEXT_MUTED } from "@/constants/theme";
import EducationCardHeader from "./EducationCardHeader";
import ExpandableExtras from "./ExpandableExtras";

interface EducationCardContentProps {
   item: Education;
   isMobile: boolean;
}

const EducationCardContent = ({
   item,
   isMobile,
}: EducationCardContentProps) => {
   const ml = isMobile ? 0 : 38;

   return (
      <>
         <EducationCardHeader item={item} isMobile={isMobile} marginLeft={ml} />

         {/* Board / Field / Department */}
         {(item.board || item.field || item.department) && (
            <div style={{ marginLeft: ml, marginTop: 4 }}>
               {item.department && (
                  <p
                     style={{
                        color: TEXT_MUTED,
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                     }}
                  >
                     <BookOpen size={12} style={{ flexShrink: 0 }} />
                     {item.department}
                  </p>
               )}
               {item.board && (
                  <p style={{ color: TEXT_MUTED, fontSize: 12, marginTop: 3 }}>
                     {item.board}
                  </p>
               )}
               {item.field && (
                  <p style={{ color: TEXT_MUTED, fontSize: 12, marginTop: 3 }}>
                     {item.field}
                  </p>
               )}
            </div>
         )}

         <ExpandableExtras item={item} marginLeft={ml} />
      </>
   );
};

export default EducationCardContent;
