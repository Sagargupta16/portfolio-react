import {
   BadgeCheck,
   CircleDot,
   GitMerge,
   GitPullRequestClosed,
   MessageCircle,
   type LucideIcon,
} from "lucide-react";
import { getSectionCopy } from "@data/sections";
import type { CommunityDiscussion, OpenSourceContribution } from "@/types";
import { BLUE_LIGHT, GREEN, ORANGE, SKY } from "@/constants/theme";
import { fillTemplate } from "@utils/fillTemplate";
import {
   COMMUNITY_DISCUSSIONS,
   OPEN_SOURCE_CONTRIBUTIONS,
} from "./projectConstants";

const COPY = getSectionCopy("projects");

export type ContribGroupId =
   OpenSourceContribution["status"] | CommunityDiscussion["status"];

/** What a row shows: an upstream PR and a discussion answer share it. */
export interface ContribItem {
   repo: string;
   title: string;
   url: string;
}

export interface ContribGroup {
   id: ContribGroupId;
   /** Short name on the chip. */
   tab: string;
   /** Full name with its count, above the whole list in the sheet. */
   heading: (count: number) => string;
   color: string;
   Icon: LucideIcon;
   /** Newest first. */
   items: ContribItem[];
}

/* data/projects.json keeps both lists oldest first: PRs are appended by hand,
   and scripts/sync-live-data.js keeps the discussions as an accepted run and
   a helpful run, adding each newly accepted answer at the end of its run. */
const newestFirst = <T>(items: T[]): T[] => items.toReversed();

const withStatus = <T extends { status: string }>(items: T[], status: string) =>
   newestFirst(items.filter((item) => item.status === status));

/** Merged PRs carry their merge date; one without it sorts last. */
const byMergeDate = (a: OpenSourceContribution, b: OpenSourceContribution) =>
   (b.merged_at ?? "").localeCompare(a.merged_at ?? "");

const counted = (label: string) => (count: number) => `${label} (${count})`;
const templated = (template: string) => (count: number) =>
   fillTemplate(template, { count });

const ALL_GROUPS: ContribGroup[] = [
   {
      id: "merged",
      tab: COPY.open_source_digest.tabs.merged,
      heading: counted(COPY.open_source.merged),
      color: SKY,
      Icon: GitMerge,
      items: withStatus(OPEN_SOURCE_CONTRIBUTIONS, "merged").sort(byMergeDate),
   },
   {
      id: "open",
      tab: COPY.open_source_digest.tabs.open,
      heading: counted(COPY.open_source.open),
      color: GREEN,
      Icon: CircleDot,
      items: withStatus(OPEN_SOURCE_CONTRIBUTIONS, "open"),
   },
   {
      id: "closed",
      tab: COPY.open_source_digest.tabs.closed,
      heading: counted(COPY.open_source.closed),
      color: ORANGE,
      Icon: GitPullRequestClosed,
      items: withStatus(OPEN_SOURCE_CONTRIBUTIONS, "closed"),
   },
   {
      id: "accepted",
      tab: COPY.open_source_digest.tabs.accepted,
      heading: templated(COPY.open_source.accepted),
      color: BLUE_LIGHT,
      Icon: BadgeCheck,
      items: withStatus(COMMUNITY_DISCUSSIONS, "accepted"),
   },
   {
      id: "helpful",
      tab: COPY.open_source_digest.tabs.helpful,
      heading: templated(COPY.open_source.helpful),
      color: SKY,
      Icon: MessageCircle,
      items: withStatus(COMMUNITY_DISCUSSIONS, "helpful"),
   },
];

/** The groups that have at least one item, in display order. */
export const CONTRIB_GROUPS: ContribGroup[] = ALL_GROUPS.filter(
   (group) => group.items.length > 0,
);

export const CONTRIB_TOTAL =
   OPEN_SOURCE_CONTRIBUTIONS.length + COMMUNITY_DISCUSSIONS.length;
