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
    *  blues and in-between mixes of them. Neighbouring types alternate
    *  light and deep so the icons read apart. */
   tone: string;
}

const TYPE_COPY = getSectionCopy("news").types;

/** A mix of two theme blues (srgb), `share`% of the first. */
const mix = (first: string, share: number, second: string) =>
   `color-mix(in srgb, ${first} ${share}%, ${second})`;

/** Key order is the chip order. */
export const NEWS_TYPES: Record<NewsType, NewsTypeMeta> = {
   launch: { ...TYPE_COPY.launch, icon: Rocket, tone: BLUE_LIGHT },
   oss: { ...TYPE_COPY.oss, icon: GitMerge, tone: SKY },
   award: { ...TYPE_COPY.award, icon: Trophy, tone: BLUE_PALE },
   community: {
      ...TYPE_COPY.community,
      icon: MessagesSquare,
      tone: mix(BLUE, 60, BLUE_LIGHT),
   },
   cert: {
      ...TYPE_COPY.cert,
      icon: BadgeCheck,
      tone: mix(SKY, 50, BLUE_PALE),
   },
   education: {
      ...TYPE_COPY.education,
      icon: GraduationCap,
      tone: mix(BLUE, 45, SKY),
   },
   work: {
      ...TYPE_COPY.work,
      icon: Briefcase,
      tone: mix(BLUE, 62, BLUE_PALE),
   },
};

export const NEWS_TYPE_ORDER = Object.keys(NEWS_TYPES) as NewsType[];

export type NewsFilter = NewsType | "all";

/** Collapsed view: the newest few items for the active filter. */
export const COLLAPSED_COUNT = 6;
