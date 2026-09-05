import type { SkillsData } from "@/types";
import skillsData from "../../data/skills.json";

export const getSkills = (): SkillsData => skillsData as SkillsData;
