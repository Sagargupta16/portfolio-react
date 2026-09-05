import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import { MONO_FONT, TEXT_SECONDARY } from "@/constants/theme";
import CompanyHeader from "./CompanyHeader";

interface TimelineCardContentProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   accentColor: string;
   isMobile: boolean;
   onClick?: () => void;
}

// The 12px trigger labels sit on the body 1.7 line-height (a ~20px line
// box); 12px of padding above and below lifts each hit area past the 44px
// mobile minimum (WCAG 2.5.8) without changing the label's size or weight.
const TRIGGER_PAD = 12;
const TRIGGER_STYLE: React.CSSProperties = {
   padding: `${TRIGGER_PAD}px 0`,
   cursor: "pointer",
   fontSize: 12,
   fontWeight: 600,
};

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
            <details style={{ marginLeft: ml }}>
               <summary style={{ ...TRIGGER_STYLE, color: accentColor }}>
                  Responsibilities
               </summary>
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
                  ...TRIGGER_STYLE,
                  display: "flex",
                  alignItems: "center",
                  width: "fit-content",
                  marginLeft: ml,
                  // The bottom padding only exists to grow the hit area; pull
                  // it back so the card ends where the old 12px-margin label did.
                  marginBottom: -TRIGGER_PAD,
                  background: "none",
                  border: "none",
                  color: accentColor,
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
