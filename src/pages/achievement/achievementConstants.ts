// Credly's scale (Foundational / Intermediate / Advanced) and the issuer-tier
// fallback (Associate / Professional) share ranks so mixed data sorts sanely.
export const LEVEL_ORDER: Record<string, number> = {
   Foundational: 0,
   Associate: 1,
   Intermediate: 1,
   Professional: 2,
   Advanced: 2,
};
