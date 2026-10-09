import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { getNews } from "@data/news";
import { staggerContainer, staggerItem } from "@utils/animations";
import {
   BLUE,
   CYAN,
   MAX_WIDTH_NARROW,
   MONO_FONT,
   PURPLE,
   TEXT_MUTED,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
} from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import PageSection from "@components/layout/PageSection";
import type { NewsItem, NewsType } from "@/types";

// Collapsed view: the newest few items, topped up with the latest highlights.
const RECENT_COUNT = 3;
const COLLAPSED_LIMIT = 10;

const collapsedItems = (news: NewsItem[]) => {
   const keep = new Set(news.slice(0, RECENT_COUNT));
   for (const item of news) {
      if (keep.size >= COLLAPSED_LIMIT) break;
      if (item.impact === "major") keep.add(item);
   }
   return news.filter((item) => keep.has(item));
};

const TYPE_LABEL: Record<NewsType, string> = {
   launch: "Launch",
   oss: "Open source",
   community: "Community",
   cert: "Certified",
   award: "Award",
   work: "Career",
   education: "Education",
};

// One accent family: tag dots vary only in blue shade.
const TYPE_DOT: Record<NewsType, string> = {
   launch: BLUE,
   oss: CYAN,
   community: PURPLE,
   cert: CYAN,
   award: BLUE,
   work: PURPLE,
   education: TEXT_MUTED,
};

const MONTHS = [
   "Jan",
   "Feb",
   "Mar",
   "Apr",
   "May",
   "Jun",
   "Jul",
   "Aug",
   "Sep",
   "Oct",
   "Nov",
   "Dec",
];

/** "2026-09-29" -> "Sep 29", "2026-09" -> "Sep" (the year sits in the group rule). */
const shortDate = (date: string) => {
   const [, month, day] = date.split("-");
   const name = MONTHS[Number(month) - 1];
   return day ? `${name} ${Number(day)}` : name;
};

const groupByYear = (items: NewsItem[]) => {
   const groups: { year: string; items: NewsItem[] }[] = [];
   for (const item of items) {
      const year = item.date.slice(0, 4);
      const last = groups.at(-1);
      if (last?.year === year) last.items.push(item);
      else groups.push({ year, items: [item] });
   }
   return groups;
};

const NewsRow = ({ item, isMobile }: { item: NewsItem; isMobile: boolean }) => {
   const major = item.impact === "major";
   const minor = item.impact === "minor";
   const textSize = isMobile ? 14 : 15;
   const body = (
      <>
         <span
            style={{
               fontFamily: MONO_FONT,
               fontSize: 12,
               color: TEXT_MUTED,
               fontVariantNumeric: "tabular-nums",
               whiteSpace: "nowrap",
               paddingTop: 2,
            }}
         >
            <time dateTime={item.date}>{shortDate(item.date)}</time>
         </span>
         <span style={{ minWidth: 0 }}>
            <span
               style={{
                  display: "block",
                  color: minor ? TEXT_SECONDARY : TEXT_PRIMARY,
                  fontSize: minor ? textSize - 1 : textSize + (major ? 1 : 0),
                  fontWeight: major ? 600 : 400,
                  lineHeight: 1.55,
               }}
            >
               {item.text}
               {item.link && (
                  <ArrowUpRight
                     size={14}
                     aria-hidden="true"
                     className="news-row-arrow"
                     style={{
                        display: "inline",
                        marginLeft: 4,
                        verticalAlign: "-2px",
                        color: CYAN,
                     }}
                  />
               )}
            </span>
            <span
               style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 6,
                  fontFamily: MONO_FONT,
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: TEXT_SECONDARY,
               }}
            >
               <span
                  aria-hidden="true"
                  style={{
                     width: 6,
                     height: 6,
                     borderRadius: "50%",
                     backgroundColor: TYPE_DOT[item.type],
                  }}
               />
               {TYPE_LABEL[item.type]}
               {major && (
                  <span style={{ color: CYAN, marginLeft: 4 }}>
                     · Highlight
                  </span>
               )}
            </span>
         </span>
      </>
   );

   const rowStyle = {
      display: "grid",
      gridTemplateColumns: isMobile
         ? "52px minmax(0, 1fr)"
         : "72px minmax(0, 1fr)",
      gap: isMobile ? 12 : 20,
      padding: isMobile ? "14px 12px" : "16px 20px",
      borderRadius: 12,
   } as const;

   const className = `news-row${major ? " news-row--major" : ""}`;
   return item.link ? (
      <a
         href={item.link}
         target="_blank"
         rel="noopener noreferrer"
         className={className}
         style={rowStyle}
      >
         {body}
      </a>
   ) : (
      <div className={`${className} news-row--static`} style={rowStyle}>
         {body}
      </div>
   );
};

const News = () => {
   const news = useMemo(() => getNews(), []);
   const { isMobile } = useBreakpoint();
   const [expanded, setExpanded] = useState(false);
   const listId = useId();

   const collapsed = useMemo(() => collapsedItems(news), [news]);
   const visible = expanded ? news : collapsed;
   const groups = groupByYear(visible);
   const hidden = news.length - collapsed.length;

   return (
      <PageSection
         id="news"
         title="News"
         subtitle="What I've been shipping, earning and learning"
         maxWidth={MAX_WIDTH_NARROW}
      >
         <motion.div id={listId} variants={staggerContainer}>
            {groups.map(({ year, items }) => (
               <section key={year} aria-label={year} style={{ marginTop: 28 }}>
                  <h3 className="dashed-rule" style={{ marginBottom: 8 }}>
                     {year}
                  </h3>
                  <ul
                     style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                     }}
                  >
                     <AnimatePresence initial={false}>
                        {items.map((item) => (
                           <motion.li
                              key={`${item.date}-${item.text}`}
                              variants={staggerItem}
                              initial={expanded ? "hidden" : false}
                              animate="visible"
                              exit={{
                                 opacity: 0,
                                 y: -6,
                                 transition: { duration: 0.15 },
                              }}
                              layout="position"
                           >
                              <NewsRow item={item} isMobile={isMobile} />
                           </motion.li>
                        ))}
                     </AnimatePresence>
                  </ul>
               </section>
            ))}
         </motion.div>

         {hidden > 0 && (
            <div
               style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 32,
               }}
            >
               <button
                  type="button"
                  className="btn-outline"
                  aria-expanded={expanded}
                  aria-controls={listId}
                  onClick={() => setExpanded((open) => !open)}
                  style={{ fontFamily: MONO_FONT, fontSize: 13 }}
               >
                  {expanded ? "Show less" : `Show all ${news.length}`}
               </button>
            </div>
         )}
      </PageSection>
   );
};

export default News;
