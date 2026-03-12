import { Building2 } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";

interface CompanyHeaderProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   accentColor: string;
   isMobile: boolean;
   marginLeft: number;
}

const CompanyHeader = ({
   item,
   accentColor,
   isMobile,
   marginLeft,
}: CompanyHeaderProps) => (
   <>
      {/* Company row */}
      <div
         style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
         }}
      >
         <div
            style={{
               width: 28,
               height: 28,
               borderRadius: 8,
               background: `${accentColor}12`,
               border: `1px solid ${accentColor}20`,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
            }}
         >
            <Building2 style={{ width: 14, height: 14, color: accentColor }} />
         </div>
         <h3
            style={{
               fontSize: isMobile ? 16 : 18,
               fontWeight: 700,
               color: "#eeeef5",
               lineHeight: 1.3,
            }}
         >
            {item.company}
         </h3>
      </div>

      {/* Title + Position */}
      <p
         style={{
            color: "#a855f7",
            fontWeight: 600,
            fontSize: isMobile ? 14 : 15,
            marginTop: 4,
            marginLeft,
         }}
      >
         {item.title}
         {item.position && (
            <span
               className="tag tag-purple"
               style={{
                  marginLeft: 10,
                  verticalAlign: "middle",
                  fontSize: 11,
                  padding: "2px 8px",
               }}
            >
               {item.position}
            </span>
         )}
      </p>

      {/* Summary (always visible) */}
      {item.summary && (
         <p
            style={{
               color: "#a5a5c0",
               fontSize: 13,
               lineHeight: 1.6,
               marginTop: 8,
               marginLeft,
            }}
         >
            {item.summary}
         </p>
      )}
   </>
);

export default CompanyHeader;
