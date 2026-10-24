import { getSectionCopy } from "@data/sections";

/* Page order. News sits near the end: the hero's LATEST line already
   surfaces the newest item at the top, so the full feed comes after the work.
   Each id's copy, its nav label included, lives in data/sections.json;
   validate-data.js reads the ids below and fails on any without a nav label,
   a title and a subtitle there. */
const SECTION_LAYOUT = [
   { id: "about", surface: "section-darker" },
   { id: "experience", surface: "section-dark" },
   { id: "education", surface: "section-darker" },
   { id: "skills", surface: "section-dark" },
   { id: "projects", surface: "section-darker" },
   { id: "achievements", surface: "section-dark" },
   { id: "services", surface: "section-darker" },
   { id: "stats", surface: "section-dark" },
   { id: "news", surface: "section-darker" },
   { id: "contact", surface: "section-dark" },
] as const;

export type ContentSectionId = (typeof SECTION_LAYOUT)[number]["id"];

export const CONTENT_SECTIONS = SECTION_LAYOUT.map((section) => ({
   ...section,
   label: getSectionCopy(section.id).nav,
}));

export const NAV_SECTIONS = CONTENT_SECTIONS.map(({ id, label }) => ({
   id,
   label,
}));

/* Desktop nav: these stay as direct links; the rest sit under "More". */
export const NAV_PRIMARY_IDS: readonly ContentSectionId[] = [
   "about",
   "experience",
   "projects",
   "skills",
];

/* One line under each "More" entry, so a visitor knows what is behind it.
   The copy is each section's `blurb` in data/sections.json. */
export const NAV_MORE_BLURBS: Partial<Record<ContentSectionId, string>> =
   Object.fromEntries(
      CONTENT_SECTIONS.flatMap(({ id }) => {
         const { blurb } = getSectionCopy(id);
         return blurb ? [[id, blurb] as const] : [];
      }),
   );
