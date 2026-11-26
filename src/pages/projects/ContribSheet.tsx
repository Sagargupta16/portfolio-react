import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { getSectionCopy } from "@data/sections";
import useBreakpoint from "@hooks/useBreakpoint";
import useFocusTrap from "@hooks/useFocusTrap";
import useScrollLock from "@hooks/useScrollLock";
import ModalHeaderShell from "@components/ui/ModalHeaderShell";
import ModalShell from "@components/ui/ModalShell";
import {
   CONTRIB_GROUPS,
   CONTRIB_TOTAL,
   type ContribGroupId,
} from "./contribGroups";
import ContribRow from "./ContribRow";
import ContribTabs from "./ContribTabs";

const COPY = getSectionCopy("projects");
const DIGEST = COPY.open_source_digest;

const TITLE_ID = "contrib-sheet-title";
const LIST_ID = "contrib-sheet-list";

interface ContribSheetProps {
   isOpen: boolean;
   onClose: () => void;
   active: ContribGroupId;
   onSelect: (id: ContribGroupId) => void;
}

type SheetBodyProps = Omit<ContribSheetProps, "isOpen"> & {
   isMobile: boolean;
};

/* Mounted only while the sheet is open, so the search starts empty each time. */
const SheetBody = ({ onClose, active, onSelect, isMobile }: SheetBodyProps) => {
   const [query, setQuery] = useState("");
   const searchRef = useRef<HTMLInputElement>(null);
   const needle = query.trim().toLowerCase();

   // Every group is filtered, not only the open one, so each chip's count
   // says where the matches are.
   const groups = useMemo(
      () =>
         needle
            ? CONTRIB_GROUPS.map((group) => ({
                 ...group,
                 items: group.items.filter(({ repo, title }) =>
                    `${repo} ${title}`.toLowerCase().includes(needle),
                 ),
              }))
            : CONTRIB_GROUPS,
      [needle],
   );
   const group = groups.find(({ id }) => id === active) ?? groups[0];

   const clearSearch = () => {
      setQuery("");
      searchRef.current?.focus();
   };

   return (
      <>
         <ModalHeaderShell
            isMobile={isMobile}
            onClose={onClose}
            closeLabel={DIGEST.close}
         >
            <div className="contrib-sheet-title">
               <h2 id={TITLE_ID}>{COPY.subsections.open_source}</h2>
               <span className="subsection-count">{CONTRIB_TOTAL}</span>
            </div>
            {/* The header shell keeps 44px on the right free for the close
                button; the tools sit under it and take the full width. */}
            <div className="contrib-sheet-tools">
               <div className="project-search">
                  <Search size={18} aria-hidden="true" />
                  <input
                     ref={searchRef}
                     type="text"
                     inputMode="search"
                     enterKeyHint="search"
                     name="contribution-search"
                     value={query}
                     onChange={(event) => setQuery(event.target.value)}
                     onKeyDown={(event) => {
                        // The first Escape clears a search, the next one
                        // closes the sheet.
                        if (event.key !== "Escape" || !query) return;
                        event.preventDefault();
                        clearSearch();
                     }}
                     placeholder={DIGEST.search_placeholder}
                     aria-label={DIGEST.search_label}
                     aria-controls={LIST_ID}
                     autoComplete="off"
                     spellCheck={false}
                  />
                  {query && (
                     <button
                        type="button"
                        className="project-action"
                        aria-label={COPY.search.clear}
                        onClick={clearSearch}
                     >
                        <X size={16} aria-hidden="true" />
                     </button>
                  )}
               </div>
               <ContribTabs
                  groups={groups}
                  active={group.id}
                  onSelect={onSelect}
                  controls={LIST_ID}
                  pillId="contrib-tab-sheet"
               />
            </div>
         </ModalHeaderShell>

         <div className="contrib-sheet-body">
            <p
               className="contrib-sheet-heading"
               style={{ color: group.color }}
               role="status"
               aria-live="polite"
            >
               {group.heading(group.items.length)}
            </p>
            {group.items.length ? (
               <ul id={LIST_ID} className="contrib-list">
                  {group.items.map((item) => (
                     <li key={item.url}>
                        <ContribRow
                           item={item}
                           color={group.color}
                           Icon={group.Icon}
                        />
                     </li>
                  ))}
               </ul>
            ) : (
               <p id={LIST_ID} className="contrib-empty">
                  {DIGEST.empty}
               </p>
            )}
         </div>
      </>
   );
};

/** The whole open source list: the digest's groups with every row, and a
 *  search over repo and title. */
const ContribSheet = ({ isOpen, onClose, ...body }: ContribSheetProps) => {
   const { isMobile } = useBreakpoint();
   const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);
   useScrollLock(isOpen);

   // A layer above that handled this Escape already called preventDefault,
   // so one press closes only the topmost layer.
   const onEsc = useCallback(
      (event: KeyboardEvent) => {
         if (event.key !== "Escape" || event.defaultPrevented) return;
         event.preventDefault();
         onClose();
      },
      [onClose],
   );

   useEffect(() => {
      if (!isOpen) return;
      document.addEventListener("keydown", onEsc);
      return () => document.removeEventListener("keydown", onEsc);
   }, [isOpen, onEsc]);

   return (
      <ModalShell
         isOpen={isOpen}
         onClose={onClose}
         dialogRef={dialogRef}
         isMobile={isMobile}
         titleId={TITLE_ID}
      >
         <SheetBody onClose={onClose} isMobile={isMobile} {...body} />
      </ModalShell>
   );
};

export default ContribSheet;
