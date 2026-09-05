import type { PositionOfResponsibility, ProfessionalExperience } from "@/types";
import experienceData from "../../data/experience.json";

export const getExperience = (): ProfessionalExperience[] =>
   experienceData.professional_experience as ProfessionalExperience[];
export const getPositionsOfResponsibility = (): PositionOfResponsibility[] =>
   experienceData.positions_of_responsibility as PositionOfResponsibility[];
