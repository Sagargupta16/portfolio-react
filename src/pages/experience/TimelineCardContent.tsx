import type { CSSProperties } from "react";
import { ArrowRight, Building2, ListChecks } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import useBreakpoint from "@hooks/useBreakpoint";
import Disclosure from "@components/ui/Disclosure";
import EntryHeader, { EntryMeta } from "@components/ui/EntryHeader";
import { EntryBullets, EntryChipList } from "@components/ui/EntryDetails";
import TimelineEntry from "@components/ui/TimelineEntry";
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

/**
 * One role or position on the Experience timeline: the role's scene in the
 * card's art column, or a position's skills in its list column, and the
 * responsibilities or View details under the head.
 */
const TimelineCardContent = ({
   item,
   accentColor,
   isMobile,
   onClick,
}: TimelineCardContentProps) => {
   const { isTablet } = useBreakpoint();
   const stacked = isMobile || isTablet;
   const hasDetail =
      ("projects" in item && (item.projects?.length ?? 0) > 0) ||
      ("internal_contributions" in item &&
         (item.internal_contributions?.length ?? 0) > 0);
   const showDetails = hasDetail && onClick;
   const roleScene = "scene" in item ? item.scene : undefined;
   const skills = "skills" in item ? item.skills : [];
   const duties = "description" in item ? Object.values(item.description) : [];

   const footer =
      duties.length > 0 || showDetails ? (
         <>
            {duties.length > 0 && (
               <Disclosure
                  accentColor={accentColor}
                  label={
                     <>
                        <ListChecks size={14} aria-hidden="true" />
                        {COPY.card.responsibilities}
                     </>
                  }
               >
                  <EntryBullets items={duties} accentColor={accentColor} />
               </Disclosure>
            )}
            {showDetails && (
               <button
                  type="button"
                  onClick={onClick}
                  className="text-action"
                  style={{ "--action-accent": accentColor } as CSSProperties}
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
         </>
      ) : undefined;

   return (
      <TimelineEntry
         date={item.date}
         location={item.location}
         accentColor={accentColor}
         isMobile={isMobile}
         media={
            roleScene ? (
               <TimelineCardScene
                  scene={roleScene}
                  tint={accentColor}
                  stacked={stacked}
               />
            ) : undefined
         }
         aside={
            !roleScene && skills.length > 0 ? (
               <EntryChipList
                  label={COPY.card.skills}
                  items={skills}
                  padded={!stacked}
               />
            ) : undefined
         }
         footer={footer}
      >
         <EntryHeader
            org={item.company}
            title={item.title}
            meta={item.position ? <EntryMeta>{item.position}</EntryMeta> : null}
            lines={item.summary ? [item.summary] : []}
            fallbackIcon={Building2}
            isMobile={isMobile}
         />
      </TimelineEntry>
   );
};

export default TimelineCardContent;
