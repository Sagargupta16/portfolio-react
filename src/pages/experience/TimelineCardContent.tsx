import type { CSSProperties } from "react";
import { ArrowRight, Building2, ListChecks } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import Disclosure from "@components/ui/Disclosure";
import EntryHeader, { EntryMeta } from "@components/ui/EntryHeader";
import { EntryBullets, EntryChips } from "@components/ui/EntryDetails";
import { ENTRY_INDENT } from "@components/ui/entryStyles";
import { getSectionCopy } from "@data/sections";
import { fillTemplate } from "@utils/fillTemplate";
import TimelineCardScene from "./TimelineCardScene";

const COPY = getSectionCopy("experience");

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
   const ml = isMobile ? 0 : ENTRY_INDENT;
   const hasDetail =
      ("projects" in item && (item.projects?.length ?? 0) > 0) ||
      ("internal_contributions" in item &&
         (item.internal_contributions?.length ?? 0) > 0);

   // The role's own scene, so the work shows before any click.
   const roleScene = "scene" in item ? item.scene : undefined;
   const header = (
      <EntryHeader
         org={item.company}
         title={item.title}
         meta={item.position ? <EntryMeta>{item.position}</EntryMeta> : null}
         lines={item.summary ? [item.summary] : []}
         fallbackIcon={Building2}
         isMobile={isMobile}
      />
   );

   return (
      <div>
         {roleScene ? (
            <TimelineCardScene
               header={header}
               scene={roleScene}
               tint={accentColor}
               isMobile={isMobile}
            />
         ) : (
            header
         )}
         {"description" in item && (
            <>
               {item.skills.length > 0 && (
                  <EntryChips
                     items={item.skills}
                     accentColor={accentColor}
                     style={{ marginLeft: ml, marginTop: 12 }}
                  />
               )}
               <div style={{ marginLeft: ml, marginTop: 12 }}>
                  <Disclosure
                     accentColor={accentColor}
                     label={
                        <>
                           <ListChecks size={14} aria-hidden="true" />
                           {COPY.card.responsibilities}
                        </>
                     }
                  >
                     <EntryBullets
                        items={Object.values(item.description)}
                        accentColor={accentColor}
                     />
                  </Disclosure>
               </div>
            </>
         )}
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
               aria-label={fillTemplate(COPY.links.details_label, {
                  company: item.company,
               })}
            >
               {COPY.links.details}
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
