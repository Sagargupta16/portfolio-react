import type {
   Highlight,
   ImpactStats,
   SiteConfig,
   SocialProfile,
   StatsCopy,
} from "@/types";
import personalData from "../../data/personal.json";

export const getName = (): string => personalData.name;
export const getRole = (): string => personalData.role;
export const getEmployer = (): string => personalData.employer;
export const getLocation = (): string => personalData.location;
export const getTimezone = (): string => personalData.timezone;
export const getAvailability = (): string => personalData.availability;
export const getLanguages = (): { name: string; level: string }[] =>
   personalData.languages;
export const getAbout = (): Record<string, string> => personalData.about;
export const getSocialProfiles = (): SocialProfile[] =>
   personalData.social_profiles;
export const getGitHubUsername = (): string => personalData.contact.github;
export const getImpact = (): ImpactStats => personalData.impact as ImpactStats;
export const getHighlights = (): Highlight[] =>
   personalData.highlights as Highlight[];
/** Stats band headings and tile copy, plus the platform cards' copy; notes
 *  and captions may carry `{name}` placeholders. */
export const getStatsCopy = (): StatsCopy => personalData.stats as StatsCopy;
export const getIntro = (): string => personalData.intro;
export const getRoleLabel = (): string => personalData.role_label;
export const getHeroTaglines = (): string[] => personalData.hero_taglines;
export const getHeadline = (): string => personalData.headline;
/** The words before the name in the hero headline ("Hi, I'm"). */
export const getHeroGreeting = (): string => personalData.hero_greeting;
export const getSiteConfig = (): SiteConfig =>
   (personalData.site ?? {}) as SiteConfig;
/** The latest released resume PDF (latex-resume GitHub release asset). */
export const getResumeUrl = (): string => personalData.site.resume_url;
