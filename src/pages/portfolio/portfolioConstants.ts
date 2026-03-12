import { getOpenSourceContributions } from "@data/dataLoader";
import type { Project, OpenSourceContribution } from "@/types";

export const FILTERS = [
   "All",
   "Featured",
   "Community",
   "Collab",
   "Others",
] as const;

export const MONTHS: Record<string, number> = {
   January: 0,
   February: 1,
   March: 2,
   April: 3,
   May: 4,
   June: 5,
   July: 6,
   August: 7,
   September: 8,
   October: 9,
   November: 10,
   December: 11,
};

export const parseDate = (dateStr: string): Date => {
   const [month, year] = dateStr.split(" ");
   return new Date(Number(year), MONTHS[month] || 0);
};

export interface CategoryColors {
   accent: string;
   gradient: string;
   bgAlpha: string;
   borderAlpha: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColors> = {
   Featured: {
      accent: "#06b6d4",
      gradient: "linear-gradient(to right, #06b6d4, #3b82f6)",
      bgAlpha: "rgba(6,182,212,",
      borderAlpha: "rgba(6,182,212,",
   },
   Community: {
      accent: "#22c55e",
      gradient: "linear-gradient(to right, #22c55e, #16a34a)",
      bgAlpha: "rgba(34,197,94,",
      borderAlpha: "rgba(34,197,94,",
   },
   Collab: {
      accent: "#a855f7",
      gradient: "linear-gradient(to right, #a855f7, #6366f1)",
      bgAlpha: "rgba(168,85,247,",
      borderAlpha: "rgba(168,85,247,",
   },
   Others: {
      accent: "#f59e0b",
      gradient: "linear-gradient(to right, #f59e0b, #d97706)",
      bgAlpha: "rgba(245,158,11,",
      borderAlpha: "rgba(245,158,11,",
   },
};

export interface ProjectWithCategory extends Project {
   category: string;
   achievement?: string;
}

export const OPEN_SOURCE_CONTRIBUTIONS: OpenSourceContribution[] =
   getOpenSourceContributions();
