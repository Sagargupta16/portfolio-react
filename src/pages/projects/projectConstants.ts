import {
   getOpenSourceContributions,
   getCommunityDiscussions,
} from "@data/projects";
import { getSectionCopy } from "@data/sections";
import type {
   Project,
   ProjectFilter,
   OpenSourceContribution,
   CommunityDiscussion,
} from "@/types";
import { AMBER, BLUE_LIGHT, GREEN, SKY } from "@/constants/theme";

/* Chip order. These are ids: each one's on-screen label is
   projects.filters in data/sections.json. */
export const FILTERS = [
   "All",
   "Featured",
   "Community",
   "Collab",
   "Others",
] as const satisfies readonly ProjectFilter[];

const FILTER_LABELS = getSectionCopy("projects").filters;

/** The on-screen name of a filter chip or project category. */
export const filterLabel = (filter: string): string =>
   FILTER_LABELS[filter as ProjectFilter];

export interface CategoryColors {
   accent: string;
   gradient: string;
   /** Colour function open at its alpha slot: append e.g. `0.1)`. */
   bgAlpha: string;
   borderAlpha: string;
}

// Each gradient runs from the accent token to one deeper step of its own hue.
const CATEGORY_COLORS: Record<string, CategoryColors> = {
   Featured: {
      accent: BLUE_LIGHT,
      gradient: `linear-gradient(to right, ${BLUE_LIGHT}, #3b82f6)`,
      bgAlpha: "rgb(var(--ch-blue-light) / ",
      borderAlpha: "rgb(var(--ch-blue-light) / ",
   },
   Community: {
      accent: GREEN,
      gradient: `linear-gradient(to right, ${GREEN}, #16a34a)`,
      bgAlpha: "rgb(var(--ch-green) / ",
      borderAlpha: "rgb(var(--ch-green) / ",
   },
   Collab: {
      accent: SKY,
      gradient: `linear-gradient(to right, ${SKY}, #0ea5e9)`,
      bgAlpha: "rgb(var(--ch-sky) / ",
      borderAlpha: "rgb(var(--ch-sky) / ",
   },
   Others: {
      accent: AMBER,
      gradient: `linear-gradient(to right, ${AMBER}, #d97706)`,
      bgAlpha: "rgb(var(--ch-amber) / ",
      borderAlpha: "rgb(var(--ch-amber) / ",
   },
};

/** Resolve a category string to its palette, falling back to "Others". */
export const getCategoryColors = (category: string): CategoryColors =>
   CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Others;

export interface ProjectWithCategory extends Project {
   category: string;
   achievement?: string;
}

export const OPEN_SOURCE_CONTRIBUTIONS: OpenSourceContribution[] =
   getOpenSourceContributions();

export const COMMUNITY_DISCUSSIONS: CommunityDiscussion[] =
   getCommunityDiscussions();
