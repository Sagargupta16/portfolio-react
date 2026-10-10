import type { CSSProperties } from "react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { waveCascadeContainer, waveCascadeItem } from "@utils/animations";
import type { NewsType } from "@/types";
import {
   NEWS_TYPE_ORDER,
   NEWS_TYPES,
   NEWS_UI,
   type NewsFilter,
} from "./newsTypes";

const PILL_SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;
const TAP = { scale: 0.97 };

interface FilterOption {
   key: NewsFilter;
   label: string;
   count: number;
   icon?: LucideIcon;
   style?: CSSProperties;
}

interface NewsFiltersProps {
   active: NewsFilter;
   counts: Readonly<Record<NewsType, number>>;
   total: number;
   controls: string;
   /** Gets the pressed chip too, so the list can anchor scrolling to it. */
   onSelect: (filter: NewsFilter, chip: HTMLElement) => void;
}

/** Single-select type chips: All, then every type that has items. */
const NewsFilters = ({
   active,
   counts,
   total,
   controls,
   onSelect,
}: Readonly<NewsFiltersProps>) => {
   const options: FilterOption[] = [
      { key: "all", label: NEWS_UI.all, count: total },
      ...NEWS_TYPE_ORDER.filter((type) => counts[type] > 0).map((type) => ({
         key: type,
         label: NEWS_TYPES[type].chip,
         count: counts[type],
         icon: NEWS_TYPES[type].icon,
         style: { "--news-tone": NEWS_TYPES[type].tone } as CSSProperties,
      })),
   ];

   return (
      <motion.div
         className="news-filters"
         role="group"
         aria-label={NEWS_UI.filterGroup}
         variants={waveCascadeContainer}
      >
         {options.map(({ key, label, count, icon: Icon, style }) => {
            const isActive = key === active;
            return (
               <motion.button
                  key={key}
                  type="button"
                  className="news-chip"
                  style={style}
                  variants={waveCascadeItem}
                  whileTap={TAP}
                  aria-pressed={isActive}
                  aria-controls={controls}
                  onClick={(event) => onSelect(key, event.currentTarget)}
               >
                  {isActive && (
                     <motion.span
                        layoutId="news-filter"
                        aria-hidden="true"
                        className="news-chip-pill"
                        transition={PILL_SPRING}
                     />
                  )}
                  {Icon && (
                     <Icon size={14} aria-hidden="true" className="news-icon" />
                  )}
                  <span>{label}</span>
                  <span className="news-chip-count">{count}</span>
               </motion.button>
            );
         })}
      </motion.div>
   );
};

export default NewsFilters;
