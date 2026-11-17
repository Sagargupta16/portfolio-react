/** Types for about-facts.js, so src/ can import it without allowJs. */
export const ABOUT_FACT_KEYS: readonly string[];

export interface AboutFacts {
   active_aws_certs: number;
   lc_peak: string;
   lc_top: string;
   problems_solved: string;
   lc_contests: string;
}

export function aboutFacts(
   achievements: {
      certifications?: { issuer?: string; expiryDate?: string }[];
      coding_platform_stats?: Record<
         string,
         {
            best_rating?: string;
            top_percentage?: string;
            problems_solved?: string;
            contests?: string;
         }
      >;
   },
   now?: Date,
): AboutFacts;

export function fillAbout(line: string, facts: AboutFacts): string;
