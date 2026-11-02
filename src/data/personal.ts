import type { Highlight, ImpactStats, SiteConfig, StatsCopy } from "@/types";
import personalData from "../../data/personal.json";

/* The fields the first load reads come from @data/copyShell, which the entry
   chunk imports; they are re-exported here so a lazy section keeps one import
   for all of personal.json. */
export {
   getHeadline,
   getHeroGreeting,
   getHeroTaglines,
   getIntro,
   getName,
   getResumeUrl,
   getRole,
   getRoleLabel,
   getSocialProfiles,
} from "./copyShell";

export const getEmployer = (): string => personalData.employer;
export const getLocation = (): string => personalData.location;
export const getTimezone = (): string => personalData.timezone;
export const getAvailability = (): string => personalData.availability;
export const getLanguages = (): { name: string; level: string }[] =>
   personalData.languages;
export const getAbout = (): Record<string, string> => personalData.about;
export const getGitHubUsername = (): string => personalData.contact.github;
export const getImpact = (): ImpactStats => personalData.impact as ImpactStats;
export const getHighlights = (): Highlight[] =>
   personalData.highlights as Highlight[];
/** Stats band headings and tile copy, plus the platform cards' copy; notes
 *  and captions may carry `{name}` placeholders. */
export const getStatsCopy = (): StatsCopy => personalData.stats as StatsCopy;
export const getSiteConfig = (): SiteConfig =>
   (personalData.site ?? {}) as SiteConfig;
