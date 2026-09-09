import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import { MONO_FONT, TEXT_SECONDARY } from "@/constants/theme";
import Disclosure from "@components/ui/Disclosure";
import CompanyHeader from "./CompanyHeader";

interface TimelineCardContentProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   accentColor: string;
   isMobile: boolean;
   onClick?: () => void;
}

const TimelineCardContent = ({
   item,
   accentColor,
   isMobile,
   onClick,
}: TimelineCardContentProps) => {
   const ml = isMobile ? 0 : 38;
   const hasDetail =
      ("projects" in item && (item.projects?.length ?? 0) > 0) ||
      ("internal_contributions" in item &&
         (item.internal_contributions?.length ?? 0) > 0);

   const content = (
      <>
         <CompanyHeader
            item={item}
            accentColor={accentColor}
            isMobile={isMobile}
            marginLeft={ml}
         />
         {"description" in item && (
            <div style={{ marginLeft: ml, marginTop: 12 }}>
               <Disclosure label="Responsibilities" accentColor={accentColor}>
                  <ul
                     style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        color: TEXT_SECONDARY,
                        fontSize: 12,
                        lineHeight: 1.7,
                     }}
                  >
                     {Object.values(item.description).map((detail) => (
                        <li
                           key={detail}
                           style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                           }}
                        >
                           <span
                              style={{
                                 width: 5,
                                 height: 5,
                                 borderRadius: "50%",
                                 background: `${accentColor}80`,
                                 marginTop: 8,
                                 flexShrink: 0,
                              }}
                           />
                           {detail}
                        </li>
                     ))}
                  </ul>
                  <div
                     style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginTop: 10,
                     }}
                  >
                     {item.skills.map((skill) => (
                        <span
                           key={skill}
                           style={{
                              padding: "2px 7px",
                              borderRadius: 6,
                              color: accentColor,
                              background: `${accentColor}0D`,
                              border: `1px solid ${accentColor}20`,
                              fontFamily: MONO_FONT,
                              fontSize: 10,
                           }}
                        >
                           {skill}
                        </span>
                     ))}
                  </div>
               </Disclosure>
            </div>
         )}
      </>
   );

   return (
      <div>
         {content}
         {hasDetail && onClick && (
            <button
               type="button"
               onClick={onClick}
               className="text-action"
               style={
                  {
                     "--action-accent": accentColor,
                     marginLeft: ml,
                     marginTop: 4,
                  } as CSSProperties
               }
               aria-label={`View details for ${item.company}`}
            >
               View details
               <ArrowRight
                  size={16}
                  className="action-arrow"
                  aria-hidden="true"
               />
            </button>
         )}
      </div>
   );
};

export default TimelineCardContent;
