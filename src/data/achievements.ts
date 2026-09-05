import type {
   Achievement,
   Certification,
   CodingPlatformStats,
   LearningBadge,
} from "@/types";
import achievementsData from "../../data/achievements.json";

export const getCertifications = (): Certification[] =>
   achievementsData.certifications as Certification[];
export const getLearningBadges = (): LearningBadge[] =>
   (achievementsData.learning_badges ?? []) as LearningBadge[];
export const getAchievements = (): Achievement[] =>
   achievementsData.achievements as Achievement[];
export const getCodingPlatformStats = (): CodingPlatformStats =>
   (achievementsData.coding_platform_stats ?? {}) as CodingPlatformStats;
