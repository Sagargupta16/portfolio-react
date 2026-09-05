import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import { MONO_FONT, TEXT_SECONDARY } from "@/constants/theme";
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
            <details style={{ marginTop: 12, marginLeft: ml }}>
               <summary
                  style={{
                     color: accentColor,
                     cursor: "pointer",
                     fontSize: 12,
                     fontWeight: 600,
                  }}
               >
                  Responsibilities
               </summary>
               <ul
                  style={{
                     display: "flex",
                     flexDirection: "column",
                     gap: 6,
                     marginTop: 10,
                     paddingLeft: 18,
                     color: TEXT_SECONDARY,
                     fontSize: 12,
                     lineHeight: 1.7,
                  }}
               >
                  {Object.values(item.description).map((detail) => (
                     <li key={detail}>{detail}</li>
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
            </details>
         )}
      </>
   );

   return (
      <div>
         {content}
         {hasDetail && (
            <button
               type="button"
               onClick={onClick}
               style={{
                  display: "inline-flex",
                  marginTop: 12,
                  marginLeft: ml,
                  padding: 0,
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  color: accentColor,
                  fontSize: 12,
                  fontWeight: 600,
               }}
               aria-label={`View details for ${item.company}`}
            >
               View details
            </button>
         )}
      </div>
   );
};

export default TimelineCardContent;
