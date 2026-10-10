import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { NewsItem } from "@/types";
import { NEWS_TYPES } from "./newsTypes";

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

/** Stable 7-char "commit hash" per item (FNV-1a over date + text), so the
    list reads like `git log --graph` and each row keeps its id across builds. */
const shortHash = (item: NewsItem) => {
   let h = 0x811c9dc5;
   for (const ch of `${item.date}${item.text}`) {
      h ^= ch.codePointAt(0) ?? 0;
      h = Math.imul(h, 0x01000193);
   }
   return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
};

/** One thin line: node on the rail, date, type icon, text, arrow, hash. */
const NewsRow = ({ item }: Readonly<{ item: NewsItem }>) => {
   const meta = NEWS_TYPES[item.type];
   const Icon = meta.icon;
   const className = `news-row news-row--${item.impact ?? "normal"}`;
   const style = { "--news-tone": meta.tone } as CSSProperties;
   const body = (
      <>
         {/* Commit node on the graph rail (the rail is the ul's ::before). */}
         <span aria-hidden="true" className="news-node" />
         <time className="news-date" dateTime={item.date}>
            {shortDate(item.date)}
         </time>
         <Icon size={14} aria-hidden="true" className="news-icon" />
         <span className="sr-only">{meta.label}: </span>
         <span className="news-text" title={item.text}>
            {item.text}
         </span>
         {item.link && (
            <ArrowUpRight
               size={13}
               aria-hidden="true"
               className="news-row-arrow"
            />
         )}
         <span aria-hidden="true" className="news-hash">
            {shortHash(item)}
         </span>
      </>
   );

   return item.link ? (
      <a
         href={item.link}
         target="_blank"
         rel="noopener noreferrer"
         className={className}
         style={style}
      >
         {body}
      </a>
   ) : (
      <div className={className} style={style}>
         {body}
      </div>
   );
};

export default NewsRow;
