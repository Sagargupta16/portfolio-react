import { memo, useCallback, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, GitPullRequest } from "lucide-react";
import { getSectionCopy } from "@data/sections";
import { GREEN, DURATION, EASING } from "@/constants/theme";
import { fillTemplate } from "@utils/fillTemplate";
import {
   staggerContainer,
   staggerItem,
   VIEWPORT_MARGIN,
} from "@utils/animations";
import {
   CONTRIB_GROUPS,
   CONTRIB_TOTAL,
   type ContribGroupId,
} from "./contribGroups";
import ContribRow from "./ContribRow";
import ContribSheet from "./ContribSheet";
import ContribTabs from "./ContribTabs";

const COPY = getSectionCopy("projects");

/** Rows the digest shows per group. The card's height comes from this, not
 *  from how many contributions there are; the rest is in the sheet. */
const DIGEST_ROWS = 5;

const LIST_ID = "contrib-digest-list";

const OpenSourceBanner = () => {
   const [active, setActive] = useState<ContribGroupId | undefined>(
      CONTRIB_GROUPS[0]?.id,
   );
   const [sheetOpen, setSheetOpen] = useState(false);
   const closeSheet = useCallback(() => setSheetOpen(false), []);

   const group =
      CONTRIB_GROUPS.find(({ id }) => id === active) ?? CONTRIB_GROUPS[0];
   if (!group) return null;

   return (
      <motion.div
         style={{ marginTop: 48 }}
         initial={{ opacity: 0, y: 30 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true, margin: "0px 0px -100px 0px" }}
         transition={{ duration: DURATION.slow, ease: EASING.standard }}
      >
         <div className="subsection-heading">
            <GitPullRequest
               size={22}
               style={{ color: GREEN }}
               aria-hidden="true"
            />
            <h3>{COPY.subsections.open_source}</h3>
            <span className="subsection-count">{CONTRIB_TOTAL}</span>
         </div>

         <div className="glass-card contrib-digest">
            <div className="contrib-digest-ring" aria-hidden="true" />

            <ContribTabs
               groups={CONTRIB_GROUPS}
               active={group.id}
               onSelect={setActive}
               controls={LIST_ID}
               pillId="contrib-tab-digest"
            />

            {/* Keyed by group, so a switch mounts a new list and its rows
                stagger in again. */}
            <motion.ul
               key={group.id}
               id={LIST_ID}
               className="contrib-list contrib-list--digest"
               variants={staggerContainer}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: VIEWPORT_MARGIN }}
            >
               {group.items.slice(0, DIGEST_ROWS).map((item) => (
                  <motion.li key={item.url} variants={staggerItem}>
                     <ContribRow
                        item={item}
                        color={group.color}
                        Icon={group.Icon}
                     />
                  </motion.li>
               ))}
            </motion.ul>

            {group.items.length > DIGEST_ROWS && (
               <button
                  type="button"
                  className="project-action contrib-show-all"
                  aria-haspopup="dialog"
                  onClick={() => setSheetOpen(true)}
               >
                  {fillTemplate(COPY.open_source_digest.show_all, {
                     count: group.items.length,
                  })}
                  <ArrowRight
                     size={14}
                     className="action-arrow"
                     aria-hidden="true"
                  />
               </button>
            )}
         </div>

         <ContribSheet
            isOpen={sheetOpen}
            onClose={closeSheet}
            active={group.id}
            onSelect={setActive}
         />
      </motion.div>
   );
};

export default memo(OpenSourceBanner);
