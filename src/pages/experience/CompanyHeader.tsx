import { Building2 } from "lucide-react";
import { TEXT_PRIMARY, TEXT_SECONDARY, PURPLE } from "@/constants/theme";
import { getOrgLogo } from "@utils/orgLogos";
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
            gap: 8,
            marginBottom: 4,
         }}
      >
         <div
            style={{
               width: 28,
               height: 28,
               borderRadius: 10,
               background: `${accentColor}12`,
               border: `1px solid ${accentColor}20`,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
            }}
         >
            {getOrgLogo(item.company ?? "", 16) ?? (
               <Building2
                  style={{ width: 14, height: 14, color: accentColor }}
               />
            )}
         </div>
         <h3
            style={{
               fontSize: isMobile ? 16 : 18,
               fontWeight: 700,
               color: TEXT_PRIMARY,
               lineHeight: 1.2,
            }}
         >
            {item.company}
         </h3>
      </div>

      {/* Title + Position */}
      <p
         style={{
            color: PURPLE,
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
                  marginLeft: 8,
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
               color: TEXT_SECONDARY,
               fontSize: 12,
               lineHeight: 1.7,
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
