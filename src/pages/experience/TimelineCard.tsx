import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import { BLUE_LIGHT } from "@/constants/theme";
import TimelineCardMobile from "./TimelineCardMobile";
import TimelineCardDesktop from "./TimelineCardDesktop";

interface TimelineCardProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   accentColor?: string;
   isMobile: boolean;
   onClick?: () => void;
}

const TimelineCard = ({
   item,
   accentColor = BLUE_LIGHT,
   isMobile,
   onClick,
}: TimelineCardProps) => {
   if (isMobile) {
      return (
         <TimelineCardMobile
            item={item}
            accentColor={accentColor}
            onClick={onClick}
         />
      );
   }

   return (
      <TimelineCardDesktop
         item={item}
         accentColor={accentColor}
         onClick={onClick}
      />
   );
};

export default TimelineCard;
