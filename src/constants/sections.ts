/* Page order. News sits near the end: the hero's LATEST line already
   surfaces the newest item at the top, so the full feed comes after the work. */
export const CONTENT_SECTIONS = [
   { id: "about", label: "About", surface: "section-darker" },
   { id: "experience", label: "Experience", surface: "section-dark" },
   { id: "education", label: "Education", surface: "section-darker" },
   { id: "skills", label: "Skills", surface: "section-dark" },
   { id: "projects", label: "Projects", surface: "section-darker" },
   { id: "achievements", label: "Awards", surface: "section-dark" },
   { id: "services", label: "Services", surface: "section-darker" },
   { id: "stats", label: "Stats", surface: "section-dark" },
   { id: "news", label: "News", surface: "section-darker" },
   { id: "contact", label: "Contact", surface: "section-dark" },
] as const;

export type ContentSectionId = (typeof CONTENT_SECTIONS)[number]["id"];

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

/* One line under each "More" entry, so a visitor knows what is behind it. */
export const NAV_MORE_BLURBS: Partial<Record<ContentSectionId, string>> = {
   education: "NIT Warangal MCA and coursework",
   achievements: "Certifications, badges and contest wins",
   services: "What I can build for your team",
   stats: "Impact, open source and coding numbers",
   news: "Recent releases, merges and milestones",
};
