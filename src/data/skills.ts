import type { SkillsData, SkillsFile } from "@/types";
import skillsData from "../../data/skills.json";

const skillsFile = skillsData as SkillsFile;

export const getSkills = (): SkillsData => skillsFile;

/** Ranked hero field names; the field renders as many as it has slots. */
export const getHeroStack = (): string[] => skillsFile.hero_stack ?? [];
