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
