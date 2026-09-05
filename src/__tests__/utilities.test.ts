import { describe, expect, it } from "vitest";
import { credlyThumb } from "@utils/credlyThumb";
import { isPresent, splitDateRange } from "@utils/dateRange";
import {
   getCategoryColors,
   isValidUrl,
   parseDate,
} from "@pages/portfolio/portfolioConstants";

describe("shared utilities", () => {
   it("splits date ranges and recognizes current roles", () => {
      expect(splitDateRange("August 2024 - Present")).toEqual({
         start: "August 2024",
         end: "Present",
      });
      expect(splitDateRange("2024")).toEqual({ start: "2024" });
      expect(isPresent("August 2024 - present ")).toBe(true);
      expect(isPresent("May 2023 - July 2023")).toBe(false);
   });

   it("parses known project months and safely falls back for unknown input", () => {
      expect(parseDate("September 2026").getFullYear()).toBe(2026);
      expect(parseDate("September 2026").getMonth()).toBe(8);
      expect(parseDate("Unknown nope").getFullYear()).toBe(1900);
   });

   it("rejects empty project links and falls back for unknown categories", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("#")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(getCategoryColors("missing")).toEqual(getCategoryColors("Others"));
   });

   it("resizes only exact Credly image hosts", () => {
      const image = "https://images.credly.com/images/id/image.png";
      expect(credlyThumb(image, 220)).toBe(
         "https://images.credly.com/size/220x220/images/id/image.png",
      );
      expect(
         credlyThumb("https://images.credly.com.evil.example/images/id.png"),
      ).toBe("https://images.credly.com.evil.example/images/id.png");
      expect(credlyThumb("not a URL")).toBe("not a URL");
   });
});
