import { useLenis } from "lenis/react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import TimelineCardMobile from "./TimelineCardMobile";
import TimelineCardDesktop from "./TimelineCardDesktop";

interface TimelineCardProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   index: number;
   accentColor?: string;
   isMobile: boolean;
}

const TimelineCard = ({
   item,
   index,
   accentColor = "#06b6d4",
   isMobile,
}: TimelineCardProps) => {
   const lenis = useLenis();
   const handleAnimationComplete = () => lenis?.resize();

   if (isMobile) {
      return (
         <TimelineCardMobile
            item={item}
            index={index}
            accentColor={accentColor}
            onAnimationComplete={handleAnimationComplete}
         />
      );
   }

   return (
      <TimelineCardDesktop
         item={item}
         index={index}
         accentColor={accentColor}
         onAnimationComplete={handleAnimationComplete}
      />
   );
};

export default TimelineCard;
