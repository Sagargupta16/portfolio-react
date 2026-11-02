/* Modules a Vite plugin in vite.config.js supplies at build time. */

declare module "virtual:hero-latest" {
   const latest: {
      /** Newest merged upstream PR; null when none has merged. */
      pr: { repo: string; number: string; url: string } | null;
      /** Newest project with a live link; null when none has one. */
      project: { title: string; live: string } | null;
   };
   export default latest;
}

/* The first-load fields of data/personal.json, ui.json and sections.json,
   as copyShellSlices.ts picks them. */
declare module "virtual:copy-shell" {
   export const personal: import("@data/copyShellSlices").PersonalShell;
   export const ui: import("@data/copyShellSlices").UiShell;
   export const sections: import("@data/copyShellSlices").SectionsShell;
}
