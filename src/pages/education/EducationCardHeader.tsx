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

// Crests are full colour, so the tile is near-white to keep their reds,
// greens and blues readable on the near-black canvas.
const LOGO_TILE = 40;
const LOGO_SIZE = 30;

const InstitutionRow = ({ institution }: { institution: string }) => (
   <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <div
         style={{
            width: LOGO_TILE,
            height: LOGO_TILE,
            borderRadius: 12,
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
         }}
      >
         {getOrgLogo(institution, LOGO_SIZE) ?? (
            <GraduationCap style={{ width: 20, height: 20, color: PURPLE }} />
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
