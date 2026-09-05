import type { Education } from "@/types";
import educationData from "../../data/education.json";

export const getEducation = (): Education[] => educationData as Education[];
