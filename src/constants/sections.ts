export const CONTENT_SECTIONS = [
   { id: "about", label: "About", surface: "section-darker" },
   { id: "experience", label: "Experience", surface: "section-dark" },
   { id: "education", label: "Education", surface: "section-darker" },
   { id: "skills", label: "Skills", surface: "section-dark" },
   { id: "projects", label: "Projects", surface: "section-darker" },
   { id: "achievements", label: "Awards", surface: "section-dark" },
   { id: "services", label: "Services", surface: "section-darker" },
   { id: "stats", label: "Stats", surface: "section-dark" },
   { id: "contact", label: "Contact", surface: "section-darker" },
] as const;

export type ContentSectionId = (typeof CONTENT_SECTIONS)[number]["id"];

export const NAV_SECTIONS = CONTENT_SECTIONS.map(({ id, label }) => ({
   id,
   label,
}));
