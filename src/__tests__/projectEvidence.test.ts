import { describe, expect, it } from "vitest";
import { getEvidence } from "@utils/projectEvidence";
import { getFeaturedProjects } from "@data/projects";

const GH = "https://github.com/example/repo";
const LIVE = "https://example.com";

describe("getEvidence", () => {
   it("marks aws-samples projects as published by AWS", () => {
      expect(
         getEvidence({ organization: "aws-samples", github: GH, live: "" }),
      ).toEqual([{ kind: "aws", label: "Published by AWS" }]);
   });

   it("adds a live badge after the AWS badge when both apply", () => {
      expect(
         getEvidence({ organization: "aws-samples", github: GH, live: LIVE }),
      ).toEqual([
         { kind: "aws", label: "Published by AWS" },
         { kind: "live", label: "Live" },
      ]);
   });

   it("shows only live for a deployed personal project", () => {
      expect(getEvidence({ github: GH, live: LIVE })).toEqual([
         { kind: "live", label: "Live" },
      ]);
   });

   it("falls back to open source when there is a repo but no live URL", () => {
      expect(getEvidence({ github: GH, live: "" })).toEqual([
         { kind: "source", label: "Open source" },
      ]);
      expect(getEvidence({ github: GH, live: "#" })).toEqual([
         { kind: "source", label: "Open source" },
      ]);
   });

   it("returns nothing when there is neither a repo nor a live URL", () => {
      expect(getEvidence({ github: "", live: "#" })).toEqual([]);
   });

   it("never returns more than two badges for real project data", () => {
      const featured = getFeaturedProjects();
      for (const project of featured) {
         expect(getEvidence(project).length).toBeLessThanOrEqual(2);
      }
      const awsIds = featured
         .filter((p) => getEvidence(p)[0]?.kind === "aws")
         .map((p) => p.id);
      expect(awsIds).toEqual(expect.arrayContaining([49, 52]));
   });
});
