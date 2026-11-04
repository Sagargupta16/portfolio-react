import { Trophy } from "lucide-react";
import { BLUE_LIGHT } from "@/constants/theme";
import type { Education } from "@/types";
import Disclosure from "@components/ui/Disclosure";
import { EntryBullets, EntryChips } from "@components/ui/EntryDetails";
import { getSectionCopy } from "@data/sections";
import { fillTemplate } from "@utils/fillTemplate";

const COPY = getSectionCopy("education").extras;

interface ExpandableExtrasProps {
   item: Education;
   marginLeft: number;
   accentColor?: string;
}

/** Coursework chips, always shown, then the achievements disclosure. */
const ExpandableExtras = ({
   item,
   marginLeft,
   accentColor = BLUE_LIGHT,
}: ExpandableExtrasProps) => {
   const achievementCount = item.achievements?.length ?? 0;
   const hasSkills = (item.skills?.length ?? 0) > 0;

   if (!achievementCount && !hasSkills) return null;

   return (
      <>
         {hasSkills && (
            <EntryChips
               items={item.skills}
               accentColor={accentColor}
               style={{ marginLeft, marginTop: 12 }}
            />
         )}

         {achievementCount > 0 && (
            <div style={{ marginLeft, marginTop: 12 }}>
               <Disclosure
                  accentColor={accentColor}
                  label={
                     <>
                        <Trophy size={14} aria-hidden="true" />
                        {fillTemplate(
                           achievementCount === 1
                              ? COPY.achievements_one
                              : COPY.achievements_many,
                           { count: achievementCount },
                        )}
                     </>
                  }
               >
                  <EntryBullets
                     items={item.achievements!}
                     accentColor={accentColor}
                  />
               </Disclosure>
            </div>
         )}
      </>
   );
};

export default ExpandableExtras;
