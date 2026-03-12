import type {
   Achievement,
   Certification,
   CodingPlatformStats,
   ContactOption,
   Education,
   EmailConfig,
   LearningBadge,
   OpenSourceContribution,
   PositionOfResponsibility,
   ProfessionalExperience,
   Project,
   Service,
   SiteConfig,
   SkillsData,
   SocialProfile,
} from "@/types";

import personalData from "./personal.json";
import educationData from "./education.json";
import experienceData from "./experience.json";
import skillsData from "./skills.json";
import servicesData from "./services.json";
import projectsData from "./projects.json";
import achievementsData from "./achievements.json";
import contactData from "./contact.json";

// Consolidated data access
// Individual data getters
export const getName = (): string => personalData.name;
export const getRoles = (): string[] => personalData.roles;
export const getAbout = (): Record<string, string> => personalData.about;
export const getStatistics = (): Record<string, string> =>
   personalData.statistics;
export const getSocialProfiles = (): SocialProfile[] =>
   personalData.social_profiles;
export const getEducation = (): Education[] => educationData as Education[];
export const getExperience = (): ProfessionalExperience[] =>
   experienceData.professional_experience as ProfessionalExperience[];
export const getPositionsOfResponsibility = (): PositionOfResponsibility[] =>
   experienceData.positions_of_responsibility as PositionOfResponsibility[];
export const getSkills = (): SkillsData => skillsData as SkillsData;
export const getServices = (): Service[] => servicesData as Service[];
export const getFeaturedProjects = (): Project[] =>
   projectsData.featured_projects as Project[];
export const getCollaborativeProjects = (): Project[] =>
   projectsData.collaborative_projects as Project[];
export const getOtherProjects = (): Project[] =>
   projectsData.other_projects as Project[];
export const getCommunityProjects = (): Project[] =>
   (projectsData.community_projects || []) as Project[];
export const getCertifications = (): Certification[] =>
   achievementsData.certifications as Certification[];
export const getLearningBadges = (): LearningBadge[] =>
   (achievementsData.learning_badges || []) as LearningBadge[];
export const getAchievements = (): Achievement[] =>
   achievementsData.achievements as Achievement[];
export const getCodingPlatformStats = (): CodingPlatformStats =>
   (achievementsData.coding_platform_stats || {}) as CodingPlatformStats;
export const getOpenSourceContributions = (): OpenSourceContribution[] =>
   (projectsData.open_source_contributions || []) as OpenSourceContribution[];
export const getContactOptions = (): ContactOption[] =>
   contactData.contact_options as ContactOption[];
export const getEmailConfig = (): EmailConfig =>
   contactData.email_config as EmailConfig;
export const getGitHubUsername = (): string => personalData.contact.github;
export const getSiteConfig = (): SiteConfig =>
   (personalData.site || {}) as SiteConfig;
