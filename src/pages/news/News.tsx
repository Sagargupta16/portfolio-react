import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { getNews } from "@data/news";
import { EASING, MAX_WIDTH_NARROW, MONO_FONT } from "@/constants/theme";
import useMotionPreference from "@hooks/useMotionPreference";
import PageSection from "@components/layout/PageSection";
import type { NewsItem, NewsType } from "@/types";
import NewsFilters from "./NewsFilters";
import NewsRow from "./NewsRow";
import {
   COLLAPSED_COUNT,
   NEWS_TYPE_ORDER,
   NEWS_UI,
   type NewsFilter,
} from "./newsTypes";
import useScrollAnchor from "./useScrollAnchor";
import "./news.css";

const SECTION_ID = "news";

// Filter swaps stay quick: rows fade, the rest slide into place, and the
// entering rows stagger by at most MAX_STAGGER in total.
const STAGGER = 0.03;
const MAX_STAGGER = 0.18;
const LAYOUT: Transition = { duration: 0.2, ease: EASING.brisk };
const EXIT: Transition = { duration: 0.12, ease: EASING.brisk };
const HIDDEN = { opacity: 0, y: -4 };
const SHOWN = { opacity: 1, y: 0 };
const EXIT_STATE = { opacity: 0, transition: EXIT };
const FADED = { opacity: 0 };
const OPAQUE = { opacity: 1 };

const enterTransition = (delay: number): Transition => ({
   duration: 0.18,
   ease: EASING.brisk,
   delay,
   layout: LAYOUT,
});

const YEAR_TRANSITION = enterTransition(0);

const countByType = (news: NewsItem[]) => {
   const counts = Object.fromEntries(
      NEWS_TYPE_ORDER.map((type) => [type, 0]),
   ) as Record<NewsType, number>;
   for (const item of news) counts[item.type] += 1;
   return counts;
};

/** Year groups that keep each item's position in the visible list. */
const groupByYear = (items: NewsItem[]) => {
   const groups: { year: string; rows: { item: NewsItem; index: number }[] }[] =
      [];
   for (const [index, item] of items.entries()) {
      const year = item.date.slice(0, 4);
      const last = groups.at(-1);
      if (last?.year === year) last.rows.push({ item, index });
      else groups.push({ year, rows: [{ item, index }] });
   }
   return groups;
};

const News = () => {
   const news = useMemo(() => getNews(), []);
   const { reducedMotion } = useMotionPreference();
   const [filter, setFilter] = useState<NewsFilter>("all");
   const [expanded, setExpanded] = useState(false);
   const listId = useId();

   const counts = useMemo(() => countByType(news), [news]);
   const filtered = useMemo(
      () =>
         filter === "all" ? news : news.filter((item) => item.type === filter),
      [news, filter],
   );
   const visible = expanded ? filtered : filtered.slice(0, COLLAPSED_COUNT);
   const groups = groupByYear(visible);

   // Collapsing pulls the content below the list upwards; hold the pressed
   // control in place so the visitor stays with the list.
   const holdScroll = useScrollAnchor(SECTION_ID);
   const selectFilter = (next: NewsFilter, chip: HTMLElement) => {
      if (expanded) holdScroll(chip);
      setFilter(next);
      setExpanded(false);
   };
   const toggleExpanded = (button: HTMLElement) => {
      if (expanded) holdScroll(button);
      setExpanded(!expanded);
   };

   // Rows revealed by "Show all" stagger from the first new row, not from the top.
   const staggerFrom = expanded ? COLLAPSED_COUNT : 0;
   const rowTransition = (index: number) =>
      enterTransition(
         Math.min(Math.max(index - staggerFrom, 0) * STAGGER, MAX_STAGGER),
      );
   // Reduced: rows and years mount and unmount as they are, nothing tweens.
   const rowEnter = reducedMotion ? false : HIDDEN;
   const yearEnter = reducedMotion ? false : FADED;
   const exit = reducedMotion ? undefined : EXIT_STATE;
   const layout = reducedMotion ? false : "position";

   return (
      <PageSection
         id={SECTION_ID}
         title="News"
         subtitle="Merged PRs, publications and badges, newest first"
         maxWidth={MAX_WIDTH_NARROW}
      >
         <NewsFilters
            active={filter}
            counts={counts}
            total={news.length}
            controls={listId}
            onSelect={selectFilter}
         />

         <div id={listId} className="news-list">
            <AnimatePresence initial={false} mode="popLayout">
               {groups.map(({ year, rows }) => (
                  <motion.section
                     key={year}
                     aria-label={year}
                     className="news-year"
                     layout={layout}
                     initial={yearEnter}
                     animate={OPAQUE}
                     exit={exit}
                     transition={YEAR_TRANSITION}
                  >
                     <h3 className="dashed-rule">{year}</h3>
                     <ul className="news-graph">
                        <AnimatePresence initial={false} mode="popLayout">
                           {rows.map(({ item, index }) => (
                              <motion.li
                                 key={`${item.date}-${item.text}`}
                                 layout={layout}
                                 initial={rowEnter}
                                 animate={SHOWN}
                                 exit={exit}
                                 transition={rowTransition(index)}
                              >
                                 <NewsRow item={item} />
                              </motion.li>
                           ))}
                        </AnimatePresence>
                     </ul>
                  </motion.section>
               ))}
            </AnimatePresence>
         </div>

         {filtered.length > COLLAPSED_COUNT && (
            // Not layout-animated: the scroll anchor measures where it lands.
            <div className="news-more">
               <button
                  type="button"
                  className="btn-outline"
                  aria-expanded={expanded}
                  aria-controls={listId}
                  onClick={(event) => toggleExpanded(event.currentTarget)}
                  style={{ fontFamily: MONO_FONT, fontSize: 13 }}
               >
                  {expanded
                     ? NEWS_UI.showLess
                     : `${NEWS_UI.showAll} ${filtered.length}`}
               </button>
            </div>
         )}
      </PageSection>
   );
};

export default News;
