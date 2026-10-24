import { Trophy } from "lucide-react";
import { AMBER, MONO_FONT, SKY, TEXT_SECONDARY } from "@/constants/theme";
import type { Education } from "@/types";
import Disclosure from "@components/ui/Disclosure";
import { getSectionCopy } from "@data/sections";
import { fillTemplate } from "@utils/fillTemplate";

const COPY = getSectionCopy("education").extras;

interface ExpandableExtrasProps {
   item: Education;
   marginLeft: number;
}

const ExpandableExtras = ({ item, marginLeft }: ExpandableExtrasProps) => {
   const achievementCount = item.achievements?.length ?? 0;
   const hasSkills = (item.skills?.length ?? 0) > 0;

   if (!achievementCount && !hasSkills) return null;

   return (
      <>
         {/* Skills - always visible */}
         {hasSkills && (
            <div
               style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  marginTop: 12,
                  marginLeft,
               }}
            >
               {item.skills.map((skill) => (
                  <span
                     key={skill}
                     style={{
                        fontFamily: MONO_FONT,
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "rgb(var(--ch-sky) / 0.08)",
                        color: SKY,
                        border: "1px solid rgb(var(--ch-sky) / 0.15)",
                     }}
                  >
                     {skill}
                  </span>
               ))}
            </div>
         )}

         {/* Achievements - expandable dropdown */}
         {achievementCount > 0 && (
            <div style={{ marginLeft, marginTop: 12 }}>
               <Disclosure
                  accentColor={AMBER}
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
                  <ul
                     style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                     }}
                  >
                     {item.achievements!.map((achievement) => (
                        <li
                           key={achievement}
                           style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                           }}
                        >
                           <span
                              style={{
                                 width: 6,
                                 height: 6,
                                 borderRadius: "50%",
                                 backgroundColor: "rgb(var(--ch-amber) / 0.5)",
                                 marginTop: 8,
                                 flexShrink: 0,
                              }}
                           />
                           <span
                              style={{
                                 color: TEXT_SECONDARY,
                                 fontSize: 12,
                                 lineHeight: 1.7,
                              }}
                           >
                              {achievement}
                           </span>
                        </li>
                     ))}
                  </ul>
               </Disclosure>
            </div>
         )}
      </>
   );
};

export default ExpandableExtras;
