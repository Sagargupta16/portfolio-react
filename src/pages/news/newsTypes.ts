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
import { getSectionCopy } from "@data/sections";
import { BLUE, BLUE_LIGHT, BLUE_PALE, SKY } from "@/constants/theme";

/** UI vocabulary for one news type: its chip and screen-reader labels from
 *  data/sections.json (news.types), plus the icon and tone. The items
 *  themselves live in data/news.json. */
interface NewsTypeMeta {
   /** Filter chip label, shown with the count ("Launches 18"). */
   chip: string;
   /** Screen-reader label for the row icon. */
   label: string;
   icon: LucideIcon;
   /** One shade per type, all inside the blue accent family: the theme
    *  blues first, then three in-between steps that exist only here. */
   tone: string;
}

const TYPE_COPY = getSectionCopy("news").types;

/** Key order is the chip order. */
export const NEWS_TYPES: Record<NewsType, NewsTypeMeta> = {
   launch: { ...TYPE_COPY.launch, icon: Rocket, tone: BLUE_LIGHT },
   oss: { ...TYPE_COPY.oss, icon: GitMerge, tone: SKY },
   award: { ...TYPE_COPY.award, icon: Trophy, tone: BLUE_PALE },
   community: { ...TYPE_COPY.community, icon: MessagesSquare, tone: "#7dd3fc" },
   cert: { ...TYPE_COPY.cert, icon: BadgeCheck, tone: "#a5b4fc" },
   education: { ...TYPE_COPY.education, icon: GraduationCap, tone: "#3b82f6" },
   work: { ...TYPE_COPY.work, icon: Briefcase, tone: BLUE },
};

export const NEWS_TYPE_ORDER = Object.keys(NEWS_TYPES) as NewsType[];

export type NewsFilter = NewsType | "all";

/** Collapsed view: the newest few items for the active filter. */
export const COLLAPSED_COUNT = 6;
