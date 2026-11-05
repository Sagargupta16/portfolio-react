import { Trophy } from "lucide-react";
import { BLUE_LIGHT } from "@/constants/theme";
import type { Education } from "@/types";
import Disclosure from "@components/ui/Disclosure";
import { EntryBullets } from "@components/ui/EntryDetails";
import { getSectionCopy } from "@data/sections";
import { fillTemplate } from "@utils/fillTemplate";

const COPY = getSectionCopy("education").extras;

interface ExpandableExtrasProps {
   item: Education;
   accentColor?: string;
}

/** A degree's achievements in a native disclosure, collapsed by default. */
const ExpandableExtras = ({
   item,
   accentColor = BLUE_LIGHT,
}: ExpandableExtrasProps) => {
   const achievements = item.achievements ?? [];
   if (achievements.length === 0) return null;

   return (
      <Disclosure
         accentColor={accentColor}
         label={
            <>
               <Trophy size={14} aria-hidden="true" />
               {fillTemplate(
                  achievements.length === 1
                     ? COPY.achievements_one
                     : COPY.achievements_many,
                  { count: achievements.length },
               )}
            </>
         }
      >
         <EntryBullets items={achievements} accentColor={accentColor} />
      </Disclosure>
   );
};

export default ExpandableExtras;
