import {
   BadgeCheck,
   Briefcase,
   GitMerge,
   GraduationCap,
   MessagesSquare,
   Rocket,
   Trophy,
   type LucideIcon,
} from "lucide-react";
import type { NewsType } from "@/types";

/** UI vocabulary for one news type. The items themselves live in data/news.json. */
interface NewsTypeMeta {
   /** Filter chip label, shown with the count ("Launches 18"). */
   chip: string;
   /** Screen-reader label for the row icon. */
   label: string;
   icon: LucideIcon;
   /** One shade per type, all inside the blue accent family. */
   tone: string;
}

/** Key order is the chip order. */
export const NEWS_TYPES: Record<NewsType, NewsTypeMeta> = {
   launch: {
      chip: "Launches",
      label: "Launch",
      icon: Rocket,
      tone: "#60a5fa",
   },
   oss: {
      chip: "Open source",
      label: "Open source",
      icon: GitMerge,
      tone: "#38bdf8",
   },
   award: { chip: "Awards", label: "Award", icon: Trophy, tone: "#93c5fd" },
   community: {
      chip: "Community",
      label: "Community",
      icon: MessagesSquare,
      tone: "#7dd3fc",
   },
   cert: {
      chip: "Certs",
      label: "Certification",
      icon: BadgeCheck,
      tone: "#a5b4fc",
   },
   education: {
      chip: "Education",
      label: "Education",
      icon: GraduationCap,
      tone: "#3b82f6",
   },
   work: { chip: "Career", label: "Career", icon: Briefcase, tone: "#2563eb" },
};

export const NEWS_TYPE_ORDER = Object.keys(NEWS_TYPES) as NewsType[];

export type NewsFilter = NewsType | "all";

export const NEWS_UI = {
   all: "All",
   filterGroup: "Filter news by type",
   showAll: "Show all",
   showLess: "Show less",
} as const;

/** Collapsed view: the newest few items for the active filter. */
export const COLLAPSED_COUNT = 6;
