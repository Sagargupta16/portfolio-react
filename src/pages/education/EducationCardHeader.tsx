import { GraduationCap } from "lucide-react";
import type { Education } from "@/types";
import { MONO_FONT } from "@/constants/theme";
import AnimatedCounter from "@components/ui/AnimatedCounter";

interface EducationCardHeaderProps {
   item: Education;
   isMobile: boolean;
   marginLeft: number;
}

const InstitutionRow = ({ institution }: { institution: string }) => (
   <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <div
         style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "rgba(168,85,247,0.1)",
            border: "1px solid rgba(168,85,247,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
         }}
      >
         <GraduationCap style={{ width: 14, height: 14, color: "#a855f7" }} />
      </div>
      <h3
         style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#eeeef5",
            lineHeight: 1.3,
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
            padding: "6px 14px",
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
               color: "#22c55e",
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
         <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <InstitutionRow institution={item.institution} />
            <p style={{ color: "#06b6d4", fontWeight: 600, fontSize: 15 }}>
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
                  color: "#06b6d4",
                  fontWeight: 600,
                  fontSize: 15,
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
