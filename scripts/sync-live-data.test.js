import { appendFileSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { writeJson } from "./lib/write-json.js";

vi.mock("node:fs", async (original) => ({
   ...(await original()),
   readFileSync: vi.fn(),
   appendFileSync: vi.fn(),
}));
vi.mock("./lib/write-json.js", () => ({ writeJson: vi.fn() }));

const peakHighlight = { derived_from: "leetcode_peak", value: "2166" };
const otherHighlight = { derived_from: "aws_samples", value: "3" };
const repoApi = "https://api.github.com/repos/fixture/versionless";

const runSync = async ({
   leetcodeWorks = true,
   discussionsWork = true,
   repoStatus = 200,
   stored = {},
} = {}) => {
   vi.resetModules();
   writeJson.mockClear();
   appendFileSync.mockClear();
   const files = {
      "news.json": [],
      "projects.json": {},
      "achievements.json": {
         coding_platform_stats: { leetcode: { best_rating: "2166" } },
      },
      "personal.json": { highlights: [otherHighlight, peakHighlight] },
      ...stored,
   };
   readFileSync.mockImplementation((file) =>
      JSON.stringify(files[basename(file)]),
   );
   vi.stubGlobal("fetch", async (url) => {
      if (url === repoApi || url.startsWith(`${repoApi}/`)) {
         return Response.json(
            {},
            { status: url === repoApi ? repoStatus : 404 },
         );
      }
      if (url === "https://api.github.com/graphql" && discussionsWork) {
         return Response.json({
            data: { search: { nodes: [], pageInfo: { hasNextPage: false } } },
         });
      }
      if (url === "https://leetcode.com/graphql" && leetcodeWorks) {
         return Response.json({
            data: {
               matchedUser: {
                  submitStatsGlobal: {
                     acSubmissionNum: [
                        { difficulty: "All", count: 100 },
                        { difficulty: "Easy", count: 30 },
                        { difficulty: "Medium", count: 50 },
                        { difficulty: "Hard", count: 20 },
                     ],
                  },
               },
               userContestRanking: {
                  attendedContestsCount: 1,
                  topPercentage: 2.5,
                  badge: { name: "Guardian" },
               },
               userContestRankingHistory: [
                  {
                     attended: true,
                     rating: 2166.7,
                     ranking: 100,
                     contest: { startTime: 1_780_000_000 },
                  },
               ],
            },
         });
      }
      throw new Error("upstream unavailable");
   });
   await import("./sync-live-data.js");
   return Object.fromEntries(
      writeJson.mock.calls.map(([file, data]) => [basename(file), data]),
   );
};

beforeEach(() => {
   vi.stubEnv("GITHUB_TOKEN", "fixture");
   vi.stubEnv("GITHUB_OUTPUT", "action-output");
   vi.spyOn(console, "log").mockImplementation(() => {});
   vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
   vi.unstubAllEnvs();
   vi.unstubAllGlobals();
   vi.restoreAllMocks();
});

it("writes a new rounded peak to both the stats and its public highlight", async () => {
   const written = await runSync();
   expect(
      written["achievements.json"].coding_platform_stats.leetcode.best_rating,
   ).toBe("2167");
   expect(written["personal.json"].highlights).toEqual([
      otherHighlight,
      { ...peakHighlight, value: "2167" },
   ]);
   expect(appendFileSync).toHaveBeenCalledWith(
      "action-output",
      "complete=true\n",
   );
   expect(await runSync({ stored: written })).toEqual({});
   expect(appendFileSync).toHaveBeenCalledWith(
      "action-output",
      "complete=true\n",
   );
});

it("marks changes from a partial refresh before they reach an existing PR", async () => {
   const written = await runSync({ discussionsWork: false });
   expect(written["personal.json"].highlights[1].value).toBe("2167");
   expect(appendFileSync).toHaveBeenCalledWith(
      "action-output",
      "complete=false\n",
   );
});

it("distinguishes an outage with no changes from a complete refresh", async () => {
   const written = await runSync({
      leetcodeWorks: false,
      discussionsWork: false,
   });
   expect(written).toEqual({});
   expect(appendFileSync).toHaveBeenCalledWith(
      "action-output",
      "complete=false\n",
   );
});

it.each([
   [200, true],
   [404, false],
])(
   "checks a repo returning %i when its release and manifests are absent",
   async (repoStatus, complete) => {
      const written = await runSync({
         repoStatus,
         stored: {
            "projects.json": {
               featured_projects: [
                  {
                     github: "https://github.com/fixture/versionless",
                     status: "active",
                  },
               ],
            },
            "achievements.json": { coding_platform_stats: {} },
         },
      });
      expect(written).toEqual({});
      expect(appendFileSync).toHaveBeenCalledWith(
         "action-output",
         `complete=${complete}\n`,
      );
   },
);
