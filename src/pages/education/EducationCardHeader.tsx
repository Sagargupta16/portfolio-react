import { GraduationCap } from "lucide-react";
import type { Education } from "@/types";
import {
   CYAN,
   GREEN,
   MONO_FONT,
   PURPLE,
   TEXT_PRIMARY,
} from "@/constants/theme";
import { getOrgLogo } from "@utils/orgLogos";
import AnimatedCounter from "@components/ui/AnimatedCounter";

interface EducationCardHeaderProps {
   item: Education;
   isMobile: boolean;
   marginLeft: number;
}

const InstitutionRow = ({ institution }: { institution: string }) => (
   <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <div
         style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            background: "rgba(56,189,248,0.1)",
            border: "1px solid rgba(56,189,248,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
         }}
      >
         {getOrgLogo(institution, 16) ?? (
            <GraduationCap style={{ width: 14, height: 14, color: PURPLE }} />
         )}
      </div>
      <h3
         style={{
            fontSize: 20,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            lineHeight: 1.2,
         }}
      >
         {institution}
      </h3>
   </div>
);

const CgpaBadge = ({
   item,
   isMobile,
}: {
   item: Education;
   isMobile: boolean;
}) => {
   if (!item.cgpa) return null;
   return (
      <div
         style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            borderRadius: 10,
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.12)",
            ...(isMobile
               ? { alignSelf: "flex-start" as const }
               : { flexShrink: 0 }),
         }}
      >
         <span
            style={{
               color: GREEN,
               fontWeight: 700,
               fontSize: 16,
               fontFamily: MONO_FONT,
            }}
         >
            <AnimatedCounter value={item.cgpa} />
         </span>
      </div>
   );
};

const EducationCardHeader = ({
   item,
   isMobile,
   marginLeft,
}: EducationCardHeaderProps) => {
   if (isMobile) {
      return (
         <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <InstitutionRow institution={item.institution} />
            <p style={{ color: CYAN, fontWeight: 600, fontSize: 14 }}>
               {item.title}
            </p>
            <CgpaBadge item={item} isMobile={isMobile} />
         </div>
      );
   }

   return (
      <div
         style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
         }}
      >
         <div style={{ minWidth: 0, flex: 1 }}>
            <InstitutionRow institution={item.institution} />
            <p
               style={{
                  color: CYAN,
                  fontWeight: 600,
                  fontSize: 14,
                  marginTop: 4,
                  marginLeft,
               }}
            >
               {item.title}
            </p>
         </div>
         <CgpaBadge item={item} isMobile={isMobile} />
      </div>
   );
};

export default EducationCardHeader;
