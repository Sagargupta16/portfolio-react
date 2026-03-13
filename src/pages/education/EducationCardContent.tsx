import { BookOpen } from "lucide-react";
import type { Education } from "@/types";
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
            <div style={{ marginLeft: ml, marginTop: 6 }}>
               {item.department && (
                  <p
                     style={{
                        color: "#6e6e90",
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                     }}
                  >
                     <BookOpen size={12} style={{ flexShrink: 0 }} />
                     {item.department}
                  </p>
               )}
               {item.board && (
                  <p style={{ color: "#6e6e90", fontSize: 13, marginTop: 3 }}>
                     {item.board}
                  </p>
               )}
               {item.field && (
                  <p style={{ color: "#6e6e90", fontSize: 13, marginTop: 3 }}>
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
