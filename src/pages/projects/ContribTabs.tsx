import type { CSSProperties, MouseEvent } from "react";
import { motion } from "motion/react";
import { getSectionCopy } from "@data/sections";
import type { ContribGroup, ContribGroupId } from "./contribGroups";

const COPY = getSectionCopy("projects").open_source_digest;

const PILL_SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;
const TAP = { scale: 0.97 };

interface ContribTabsProps {
   groups: ContribGroup[];
   active: ContribGroupId;
   onSelect: (id: ContribGroupId) => void;
   /** ID of the list the chips switch. */
   controls: string;
   /** The digest and the sheet can be on screen together, so each names its
    *  own sliding pill. */
   pillId: string;
}

/** Single-select group chips with their counts. One row that scrolls sideways
 *  when it does not fit, so five groups never stack into three lines. */
const ContribTabs = ({
   groups,
   active,
   onSelect,
   controls,
   pillId,
}: ContribTabsProps) => {
   const select = (
      id: ContribGroupId,
      event: MouseEvent<HTMLButtonElement>,
   ) => {
      onSelect(id);
      // Bring a half-hidden chip fully into the row. Only the row scrolls:
      // scrollIntoView could move the page, which Lenis owns.
      const chip = event.currentTarget;
      const row = chip.parentElement;
      row?.scrollTo({
         left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2,
         behavior: "smooth",
      });
   };

   return (
      <fieldset className="contrib-tabs" aria-label={COPY.group_label}>
         {groups.map(({ id, tab, color, Icon, items }) => {
            const isActive = id === active;
            return (
               <motion.button
                  key={id}
                  type="button"
                  className="contrib-tab"
                  style={{ "--contribution-accent": color } as CSSProperties}
                  whileTap={TAP}
                  aria-pressed={isActive}
                  aria-controls={controls}
                  onClick={(event) => select(id, event)}
               >
                  {isActive && (
                     <motion.span
                        layoutId={pillId}
                        aria-hidden="true"
                        className="contrib-tab-pill"
                        transition={PILL_SPRING}
                     />
                  )}
                  <Icon size={14} aria-hidden="true" />
                  <span>{tab}</span>
                  <span className="contrib-tab-count">{items.length}</span>
               </motion.button>
            );
         })}
      </fieldset>
   );
};

export default ContribTabs;
