import BADGE_ART from "./badgeArt.json";

// Credly's scale (Foundational / Intermediate / Advanced) and the issuer-tier
// fallback (Associate / Professional) share ranks so mixed data sorts sanely.
export const LEVEL_ORDER: Record<string, number> = {
   Foundational: 0,
   Associate: 1,
   Intermediate: 1,
   Professional: 2,
   Advanced: 2,
};

/* Optical size of Credly artwork (badgeArt.json): the share of the square
   image box each issuer's artwork fills, from the measured alpha bounds of the
   220px thumbnails (2026-11-14), certifications and learning badges apart
   since one issuer draws both, plus name prefixes whose art differs. The art
   box is scaled so every badge reads `target` tall. Every issuer in
   data/achievements.json needs a row: validate-data fails on one that has
   none, so a Credly sync with a new issuer cannot shrink or grow it unseen. */
export type BadgeKind = "certification" | "badge";

export const badgeArtScale = (
   kind: BadgeKind,
   { issuer, name }: { issuer: string; name: string },
): number => {
   const prefixed =
      kind === "badge"
         ? Object.entries(BADGE_ART.badge_prefix).find(([prefix]) =>
              name.startsWith(prefix),
           )?.[1]
         : undefined;
   const byIssuer: Record<string, number> = BADGE_ART[kind];
   const height = prefixed ?? byIssuer[issuer] ?? BADGE_ART.target;
   return BADGE_ART.target / height;
};

/** A podium finish: a "1st", "2nd" or "3rd" Place title ("1st Place - X"). */
export const isPodium = (title: string): boolean =>
   /^(?:1st|2nd|3rd) Place - /.test(title);
