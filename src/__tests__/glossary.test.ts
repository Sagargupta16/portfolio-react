import { describe, expect, it } from "vitest";
import { GLOSSARY, segmentGloss } from "@utils/glossary";
import personalData from "../../data/personal.json";
import projectsData from "../../data/projects.json";
import experienceData from "../../data/experience.json";

const marked = (text: string) =>
   segmentGloss(text)
      .filter((segment) => segment.term)
      .map(({ at, text: part, term }) => ({ at, text: part, term }));

// En and em dash, built from code points so this file stays plain ASCII.
const DASHES = [0x2013, 0x2014].map((code) => String.fromCodePoint(code));

describe("segmentGloss", () => {
   it("returns no segments for an empty string and one plain run without terms", () => {
      expect(segmentGloss("")).toEqual([]);
      expect(segmentGloss("Plain words only.")).toEqual([
         { at: 0, text: "Plain words only." },
      ]);
   });

   it("covers the whole string with offsets that line up", () => {
      const text = "Terraform, CI/CD and MLOps on SageMaker, then Terraform.";
      const parts = segmentGloss(text);
      expect(parts.map((segment) => segment.text).join("")).toBe(text);
      for (const { at, text: part } of parts)
         expect(text.slice(at, at + part.length)).toBe(part);
   });

   it("marks only the first occurrence of each term", () => {
      expect(segmentGloss("Terraform plans, more Terraform")).toEqual([
         { at: 0, text: "Terraform", term: "Terraform" },
         { at: 9, text: " plans, more Terraform" },
      ]);
      expect(marked("SCPs here, SCP there")).toEqual([
         { at: 0, text: "SCPs", term: "SCP" },
      ]);
   });

   it("matches whole words only", () => {
      expect(marked("YOUR team, OUR OU")).toEqual([
         { at: 15, text: "OU", term: "OU" },
      ]);
      expect(marked("ROUTE MCPs Bedrocks")).toEqual([]);
      expect(marked("DevOps/MLOps (aws-samples)")).toEqual([
         { at: 0, text: "DevOps", term: "DevOps" },
         { at: 7, text: "MLOps", term: "MLOps" },
         { at: 14, text: "aws-samples", term: "aws-samples" },
      ]);
   });

   it("prefers the longest surface form", () => {
      expect(marked("AWS Organizations, then Organizations")).toEqual([
         { at: 0, text: "AWS Organizations", term: "AWS Organizations" },
      ]);
      expect(marked("on Amazon SageMaker")).toEqual([
         { at: 3, text: "Amazon SageMaker", term: "SageMaker" },
      ]);
   });

   it("is case-sensitive so acronyms do not match ordinary words", () => {
      expect(marked("awslabs/mcp and Guardrails")).toEqual([]);
   });
});

describe("glossary entries", () => {
   it("only defines terms that occur in the site copy", () => {
      const copy = JSON.stringify([personalData, projectsData, experienceData]);
      const found = new Set(marked(copy).map((segment) => segment.term));
      for (const { term } of GLOSSARY) expect(found.has(term), term).toBe(true);
   });

   it("keeps each definition to one short plain sentence", () => {
      for (const { term, definition } of GLOSSARY) {
         expect(definition.split(/\s+/).length, term).toBeLessThanOrEqual(22);
         expect(
            DASHES.some((dash) => definition.includes(dash)),
            term,
         ).toBe(false);
         expect(definition.endsWith("."), term).toBe(true);
      }
   });

   it("never maps one surface form to two terms", () => {
      const forms = GLOSSARY.flatMap(({ match }) => match);
      expect(new Set(forms).size).toBe(forms.length);
   });
});
