import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
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
         {hasDetail && (
            <p
               style={{
                  color: accentColor,
                  fontSize: 12,
                  fontWeight: 500,
                  marginTop: 12,
                  marginLeft: ml,
                  opacity: 0.7,
               }}
            >
               Click to view details
            </p>
         )}
      </>
   );

   if (hasDetail) {
      return (
         <button
            onClick={onClick}
            style={{
               cursor: "pointer",
               background: "none",
               border: "none",
               padding: 0,
               textAlign: "left",
               width: "100%",
               color: "inherit",
            }}
            aria-label={`View details for ${item.company}`}
         >
            {content}
         </button>
      );
   }

   return <div>{content}</div>;
};

export default TimelineCardContent;
