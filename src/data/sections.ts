import type { ContentSectionId } from "@/constants/sections";
import type { SectionCopyMap } from "@/types";
import sectionsData from "../../data/sections.json";

const sections = sectionsData as SectionCopyMap;

/** Copy of one page section: its heading (validate-data.js requires every
 *  id), plus the subsection titles and labels some sections carry. */
export const getSectionCopy = <K extends ContentSectionId>(
   id: K,
): SectionCopyMap[K] => sections[id];
