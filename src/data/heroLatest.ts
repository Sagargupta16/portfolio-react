import latest from "virtual:hero-latest";

/** The hero's LATEST line: the newest merged upstream PR and the newest
 *  project with a live link. Picked at build time from projects.json by
 *  heroLatestPlugin.js, so the hero never loads the projects data itself. */
export const getHeroLatest = () => latest;
