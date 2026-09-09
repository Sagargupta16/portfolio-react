import {
   getOpenSourceContributions,
   getCommunityDiscussions,
} from "@data/projects";
import type {
   Project,
   OpenSourceContribution,
   CommunityDiscussion,
} from "@/types";

export const FILTERS = [
   "All",
   "Featured",
   "Community",
   "Collab",
   "Others",
] as const;

export interface CategoryColors {
   accent: string;
   gradient: string;
   bgAlpha: string;
   borderAlpha: string;
}

const CATEGORY_COLORS: Record<string, CategoryColors> = {
   Featured: {
      accent: "#60a5fa",
      gradient: "linear-gradient(to right, #60a5fa, #3b82f6)",
      bgAlpha: "rgba(96,165,250,",
      borderAlpha: "rgba(96,165,250,",
   },
   Community: {
      accent: "#22c55e",
      gradient: "linear-gradient(to right, #22c55e, #16a34a)",
      bgAlpha: "rgba(34,197,94,",
      borderAlpha: "rgba(34,197,94,",
   },
   Collab: {
      accent: "#38bdf8",
      gradient: "linear-gradient(to right, #38bdf8, #0ea5e9)",
      bgAlpha: "rgba(56,189,248,",
      borderAlpha: "rgba(56,189,248,",
   },
   Others: {
      accent: "#f59e0b",
      gradient: "linear-gradient(to right, #f59e0b, #d97706)",
      bgAlpha: "rgba(245,158,11,",
      borderAlpha: "rgba(245,158,11,",
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
