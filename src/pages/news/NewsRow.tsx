import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { NewsItem } from "@/types";
import { newsHash } from "../../../scripts/lib/news-hash.js";
import { motion } from "motion/react";
import useMotionPreference from "@hooks/useMotionPreference";
import { NEWS_TYPES } from "./newsTypes";

const NODE_HIDDEN = { opacity: 0, scale: 0.3 };
const NODE_SHOWN = { opacity: 1, scale: 1 };
const NODE_VIEWPORT = { once: true, margin: "0px 0px -8% 0px" } as const;
const NODE_TRANSITION = {
   type: "spring",
   stiffness: 520,
   damping: 26,
} as const;

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

/** One thin line: node on the rail, date, type icon, text, arrow, hash. */
const NewsRow = ({
   item,
   revealDelay,
}: Readonly<{
   item: NewsItem;
   /** Seconds to wait before this row's node pops in, so the rail fills top to bottom. */
   revealDelay: number;
}>) => {
   const { reducedMotion } = useMotionPreference();
   const meta = NEWS_TYPES[item.type];
   const Icon = meta.icon;
   const className = `news-row news-row--${item.impact ?? "normal"}`;
   const style = { "--news-tone": meta.tone } as CSSProperties;
   const body = (
      <>
         {/* Commit node on the graph rail (the rail is the ul's ::before). */}
         {/* Pops in once when scrolled into view; Reduced shows it as is. */}
         <motion.span
            aria-hidden="true"
            className="news-node"
            initial={reducedMotion ? false : NODE_HIDDEN}
            whileInView={NODE_SHOWN}
            viewport={NODE_VIEWPORT}
            transition={{ ...NODE_TRANSITION, delay: revealDelay }}
         />
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
         {/* A stable 7-char "commit hash" per item, so the list reads like
             `git log --graph` and each row keeps its id across builds. */}
         <span aria-hidden="true" className="news-hash">
            {newsHash(item)}
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
