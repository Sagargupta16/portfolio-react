/* The numbers the About lines quote ({placeholders} in personal.json about),
   derived from data/achievements.json so the copy never drifts from the
   synced stats the Stats band shows. One module for the page (About.tsx)
   and the build (machine-view.js), like news-hash.js. */

/** The placeholders an About line may use (validate-data checks this list). */
export const ABOUT_FACT_KEYS = [
   "active_aws_certs",
   "lc_peak",
   "lc_top",
   "problems_solved",
   "lc_contests",
];

const count = (value) => Number.parseInt(value ?? "", 10) || 0;

// Active until the end of its expiry day (UTC), as certStatus.ts counts it.
const isActive = (cert, now) =>
   !cert.expiryDate ||
   new Date(`${cert.expiryDate}T23:59:59Z`).getTime() >= now.getTime();

/** Facts for the About placeholders, as of `now`. */
export const aboutFacts = (achievements, now = new Date()) => {
   const certs = achievements?.certifications ?? [];
   const platforms = achievements?.coding_platform_stats ?? {};
   const leetcode = platforms.leetcode ?? {};
   const gfg = platforms.geeksforgeeks ?? {};
   return {
      active_aws_certs: certs.filter(
         (cert) =>
            /Amazon Web Services|AWS/.test(cert.issuer ?? "") &&
            isActive(cert, now),
      ).length,
      lc_peak: leetcode.best_rating ?? "",
      lc_top: leetcode.top_percentage ?? "",
      problems_solved: `${count(leetcode.problems_solved) + count(gfg.problems_solved)}+`,
      lc_contests: leetcode.contests ?? "",
   };
};

/** Fills an About line's {placeholders}; an unknown one is left as written. */
export const fillAbout = (line, facts) =>
   String(line).replaceAll(/\{(\w+)\}/g, (whole, key) =>
      Object.hasOwn(facts, key) ? String(facts[key]) : whole,
   );
