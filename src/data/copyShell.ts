import { personal, sections, ui } from "virtual:copy-shell";
import type { ContentSectionId } from "@/constants/sections";
import type { SocialProfile } from "@/types";
import { fillTemplate } from "@utils/fillTemplate";

/* Getters for the copy the first load needs: the fields of
   data/personal.json, ui.json and sections.json that copyShellSlices.ts
   lists, served at build time by copyShellPlugin.js. Modules in the entry
   chunk import from here; @data/personal, @data/ui and @data/sections keep
   the full files for the lazy sections, and the build fails if the entry
   pulls one of those in again. */

export const getName = (): string => personal.name;
export const getRole = (): string => personal.role;
export const getSocialProfiles = (): SocialProfile[] =>
   personal.social_profiles;
export const getIntro = (): string => personal.intro;
export const getRoleLabel = (): string => personal.role_label;
export const getHeroTaglines = (): string[] => personal.hero_taglines;
export const getHeadline = (): string => personal.headline;
/** The words before the name in the hero headline ("Hi, I'm"). */
export const getHeroGreeting = (): string => personal.hero_greeting;
/** The latest released resume PDF (latex-resume GitHub release asset). */
export const getResumeUrl = (): string => personal.site.resume_url;

/** The site chrome copy the first screen draws: skip link, nav, hero, error
 *  states, the motion control and back to top (the rest of UiCopy is in
 *  @data/ui). */
export const getUiCopy = () => ui;

/** The accessible name of a link that opens a new tab: the link's own label
 *  plus the shared "(opens in a new tab)" note. */
export const newTabLabel = (label: string): string =>
   fillTemplate(ui.new_tab, { label });

/** One section's nav label and its "More" menu blurb (the headings and the
 *  rest are in @data/sections). */
export const getSectionCopy = (id: ContentSectionId) => sections[id];
