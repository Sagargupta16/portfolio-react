export const LEVEL_ORDER: Record<string, number> = {
   Foundational: 0,
   Associate: 1,
   Professional: 2,
};

const MEDAL_COLORS: Record<string, string> = {
   "1st": "#fbbf24",
   "2nd": "#94a3b8",
   "3rd": "#d97706",
};

export const getMedalColor = (title: string): string => {
   if (title.startsWith("1st")) return MEDAL_COLORS["1st"];
   if (title.startsWith("2nd")) return MEDAL_COLORS["2nd"];
   if (title.startsWith("3rd")) return MEDAL_COLORS["3rd"];
   return "#6e6e90";
};

export const formatStatLabel = (key: string): string =>
   key.replaceAll(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

export const isNumericStat = (value: unknown): boolean =>
   /^\d/.test(String(value));
