import type { ContentSectionId } from "@/constants/sections";
import type { SectionCopyMap, UiCopy } from "@/types";

/* The fields of data/personal.json, ui.json and sections.json that the entry
   chunk reads: the intro splash, the nav, the hero and the fixed controls.
   copyShellPlugin.js runs these slices when Vite builds and serves the result
   as virtual:copy-shell, so the first load ships these fields instead of the
   three whole files; everything else stays with the lazy sections, which keep
   importing the full files. The types below come from the slices, so an entry
   module that reads a field left out here fails type-check.

   No data import here: the plugin loads this from vite.config.js. */

type PersonalFile = typeof import("../../data/personal.json");

const pick = <T extends object, K extends keyof T>(
   source: T,
   keys: readonly K[],
): Pick<T, K> =>
   Object.fromEntries(keys.map((key) => [key, source[key]])) as Pick<T, K>;

export const slicePersonal = (personal: PersonalFile) => ({
   ...pick(personal, [
      "name",
      "role",
      "role_label",
      "intro",
      "hero_taglines",
      "headline",
      "hero_greeting",
      "social_profiles",
   ]),
   site: pick(personal.site, ["resume_url"]),
});

export const sliceUi = (ui: UiCopy) => ({
   ...pick(ui, [
      "new_tab",
      "profile_label",
      "skip_link",
      "error",
      "section",
      "nav",
      "hero",
      "motion",
      "back_to_top",
      "common",
   ]),
   // The hero's fallback when the CV viewer chunk fails to load.
   cv: pick(ui.cv, ["load_failed"]),
});

/** Each section's nav label and its desktop "More" menu blurb. */
export const sliceSections = (sections: SectionCopyMap) =>
   Object.fromEntries(
      Object.entries(sections).map(([id, copy]) => [
         id,
         pick(copy, ["nav", "blurb"]),
      ]),
   ) as Record<ContentSectionId, Pick<SectionCopyMap[string], "nav" | "blurb">>;

export type PersonalShell = ReturnType<typeof slicePersonal>;
export type UiShell = ReturnType<typeof sliceUi>;
export type SectionsShell = ReturnType<typeof sliceSections>;
