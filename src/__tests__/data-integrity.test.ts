import { describe, expect, it } from "vitest";
import { getCertifications, getLearningBadges } from "@data/achievements";
import { getContactOptions, getEmailConfig } from "@data/contact";
import {
   getCollaborativeProjects,
   getCommunityDiscussions,
   getCommunityProjects,
   getFeaturedProjects,
   getOpenSourceContributions,
   getOtherProjects,
} from "@data/projects";
import { getProjectCover } from "@pages/portfolio/covers/coverRegistry";

const allProjects = [
   ...getFeaturedProjects(),
   ...getCollaborativeProjects(),
   ...getOtherProjects(),
   ...getCommunityProjects(),
];

describe("portfolio data invariants", () => {
   it("keeps project IDs unique and every project mapped to a cover", () => {
      expect(allProjects).toHaveLength(44);
      expect(new Set(allProjects.map((project) => project.id)).size).toBe(
         allProjects.length,
      );
      for (const project of allProjects) {
         expect(getProjectCover(project.id, project.title)).toBeDefined();
      }
   });

   it("uses valid project and contact URLs", () => {
      for (const project of allProjects) {
         expect(() => new URL(project.github)).not.toThrow();
         if (project.live && project.live !== "#") {
            expect(() => new URL(project.live)).not.toThrow();
         }
      }
      for (const option of getContactOptions()) {
         expect(() => new URL(option.link)).not.toThrow();
      }
   });

   it("keeps contribution statuses, merge dates, and stars coherent", () => {
      const starsByRepo = new Map<string, number>();
      for (const contribution of getOpenSourceContributions()) {
         expect(["merged", "open", "closed"]).toContain(contribution.status);
         expect(contribution.stars).toBeGreaterThanOrEqual(0);
         if (starsByRepo.has(contribution.repo)) {
            expect(contribution.stars).toBe(starsByRepo.get(contribution.repo));
         } else {
            starsByRepo.set(contribution.repo, contribution.stars);
         }
         if (
            contribution.status === "merged" &&
            contribution.url.includes("/pull/")
         ) {
            expect(contribution.merged_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
         }
      }
   });

   it("keeps discussion and credential identifiers unique", () => {
      const discussions = getCommunityDiscussions();
      expect(new Set(discussions.map((item) => item.url)).size).toBe(
         discussions.length,
      );
      for (const discussion of discussions) {
         expect(["accepted", "helpful"]).toContain(discussion.status);
      }

      const badges = [...getCertifications(), ...getLearningBadges()];
      expect(new Set(badges.map((badge) => badge.badgeId)).size).toBe(
         badges.length,
      );
      for (const badge of badges) {
         expect(badge.imageUrl).toMatch(/^https:\/\/images\.credly\.com\//);
         expect(badge.badgeUrl).toMatch(
            /^https:\/\/www\.credly\.com\/badges\//,
         );
      }
   });

   it("ships a compilable contact validation pattern", () => {
      const config = getEmailConfig();
      expect(() => new RegExp(config.validation_pattern)).not.toThrow();
   });
});
