import type { SkillCategoryKey, SkillsData, SkillsFile } from "@/types";
import skillsData from "../../data/skills.json";

const skillsFile = skillsData as SkillsFile;

export const getSkills = (): SkillsData => skillsFile;

/** Display label of a category, e.g. cs_fundamentals -> "CS Fundamentals". */
export const getSkillCategoryLabel = (key: SkillCategoryKey): string =>
   skillsFile.categories[key].label;

/** Ranked hero field names; the field renders as many as it has slots. */
export const getHeroStack = (): string[] => skillsFile.hero_stack ?? [];
