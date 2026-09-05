import type { ImpactStats, SiteConfig, SocialProfile } from "@/types";
import personalData from "../../data/personal.json";

export const getName = (): string => personalData.name;
export const getTitle = (): string => personalData.title;
export const getLocation = (): string => personalData.location;
export const getLanguages = (): { name: string; level: string }[] =>
   personalData.languages;
export const getAbout = (): Record<string, string> => personalData.about;
export const getSocialProfiles = (): SocialProfile[] =>
   personalData.social_profiles;
export const getGitHubUsername = (): string => personalData.contact.github;
export const getImpact = (): ImpactStats => personalData.impact as ImpactStats;
export const getIntro = (): string => personalData.intro;
export const getRoleLabel = (): string => personalData.role_label;
export const getHeadline = (): string => personalData.headline;
export const getAvailability = (): string => personalData.availability;
export const getSiteConfig = (): SiteConfig =>
   (personalData.site ?? {}) as SiteConfig;
