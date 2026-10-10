import { describe, expect, it } from "vitest";
import {
   bucketLevels,
   buildCalendar,
   describeCalendar,
   formatDayTip,
   parseContributions,
   summarize,
   type ContributionDay,
} from "@pages/stats/calendarData";

const days = (start: string, counts: number[]): ContributionDay[] => {
   const first = Date.parse(`${start}T00:00:00Z`);
   return counts.map((count, i) => ({
      date: new Date(first + i * 86_400_000).toISOString().slice(0, 10),
      count,
   }));
};

describe("contribution calendar helpers", () => {
   it("keeps the current streak running across the year boundary", () => {
      // Dec 29 .. Jan 3: active Dec 30 through Jan 2, then a quiet today.
      expect(
         summarize(days("2025-12-29", [0, 2, 1, 5, 3, 0])).currentStreak,
      ).toBe(4);
      // Active through today, Dec 30 .. Jan 2.
      expect(summarize(days("2025-12-29", [0, 2, 1, 5, 3])).currentStreak).toBe(
         4,
      );
   });

   it("ends the current streak at a quiet day before today", () => {
      expect(
         summarize(days("2026-01-01", [3, 3, 3, 0, 0, 1, 2])).currentStreak,
      ).toBe(2);
      // Only today may be quiet; two quiet days end the streak.
      expect(summarize(days("2026-01-01", [4, 0, 0])).currentStreak).toBe(0);
   });

   it("breaks a streak on a missing date", () => {
      const gap: ContributionDay[] = [
         { date: "2026-02-01", count: 1 },
         { date: "2026-02-02", count: 1 },
         { date: "2026-02-04", count: 1 },
      ];
      expect(summarize(gap).currentStreak).toBe(1);
   });

   it("buckets levels by quartile of the active days", () => {
      expect(bucketLevels([0, 1, 2, 3, 4, 5, 6, 7, 8])).toEqual([
         0, 1, 1, 2, 2, 3, 3, 4, 4,
      ]);
      // One outlier does not flatten everything else to level 1.
      expect(bucketLevels([1, 2, 3, 4, 2000])).toEqual([1, 1, 2, 3, 4]);
      expect(bucketLevels([6, 6, 6, 0])).toEqual([1, 1, 1, 0]);
      expect(bucketLevels([0, 0])).toEqual([0, 0]);
   });

   it("handles empty data", () => {
      expect(summarize([])).toEqual({ currentStreak: 0 });
      expect(bucketLevels([])).toEqual([]);
      const model = buildCalendar([]);
      expect(model.cells).toEqual([]);
      expect(model.weeks).toBe(0);
      expect(model.months).toEqual([]);
      expect(summarize(days("2026-01-01", [0, 0])).currentStreak).toBe(0);
   });

   it("lays days out in Sunday-first week columns with month labels", () => {
      // 2025-10-08 is a Wednesday: three empty slots lead the first column.
      const model = buildCalendar(days("2025-10-08", Array(60).fill(1)));
      expect(model.lead).toBe(3);
      expect(model.cells[0]).toMatchObject({ col: 0, row: 3 });
      expect(model.cells[4]).toMatchObject({ col: 1, row: 0 });
      expect(model.weeks).toBe(9);
      expect(model.months.map((m) => m.label)).toEqual(["Oct", "Nov"]);
   });

   it("words tooltips and the summary for people", () => {
      expect(formatDayTip({ date: "2026-09-29", count: 12 })).toBe(
         "12 contributions on Sep 29, 2026",
      );
      expect(formatDayTip({ date: "2026-09-29", count: 1 })).toBe(
         "1 contribution on Sep 29, 2026",
      );
      expect(formatDayTip({ date: "2026-09-29", count: 0 })).toBe(
         "No contributions on Sep 29, 2026",
      );
      expect(describeCalendar({ currentStreak: 1 })).toBe(
         "Daily GitHub contributions over the last year. Current streak 1 day.",
      );
      expect(describeCalendar({ currentStreak: 0 })).toBe(
         "Daily GitHub contributions over the last year. Current streak 0 days.",
      );
   });

   it("parses the API payload and rejects anything else", () => {
      expect(
         parseContributions({
            total: { lastYear: 3 },
            contributions: [
               { date: "2026-01-02", count: 2, level: 1 },
               { date: "2026-01-01", count: 1, level: 1 },
               { date: "bad", count: 4 },
            ],
         }),
      ).toEqual([
         { date: "2026-01-01", count: 1 },
         { date: "2026-01-02", count: 2 },
      ]);
      expect(() => parseContributions({ error: "Not found" })).toThrow();
      expect(() => parseContributions(null)).toThrow();
   });
});
