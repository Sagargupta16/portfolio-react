import type {
   Achievement,
   Certification,
   CodingPlatformStats,
   LearningBadge,
} from "@/types";
import achievementsData from "../../data/achievements.json";

export const getCertifications = (): Certification[] =>
   achievementsData.certifications as Certification[];
// Held once: a missing list would otherwise hand back a new [] on every call.
const learningBadges = achievementsData.learning_badges ?? [];
export const getLearningBadges = (): LearningBadge[] =>
   learningBadges as LearningBadge[];
export const getAchievements = (): Achievement[] =>
   achievementsData.achievements as Achievement[];
// JSON imports widen the [date, rating] pairs to (string | number)[], so the
// cast goes through unknown; validate-data.js enforces the pair shape.
export const getCodingPlatformStats = (): CodingPlatformStats =>
   (achievementsData.coding_platform_stats ??
      {}) as unknown as CodingPlatformStats;
