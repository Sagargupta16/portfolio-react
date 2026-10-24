/* Plain-language definitions for the cloud jargon in the site copy, plus the
   splitter GlossText uses to mark terms. The entries live in
   data/glossary.json; every term must occur in data/personal.json,
   data/projects.json or data/experience.json (the glossary test enforces it).
   Surface forms match case-sensitively and as whole words, so "OU" never
   matches inside "YOUR". */
import glossaryData from "../../data/glossary.json";

interface GlossEntry {
   term: string;
   match: string[];
   definition: string;
}

export const GLOSSARY: GlossEntry[] = glossaryData;

export const GLOSSARY_BY_TERM = new Map(
   GLOSSARY.map((entry) => [entry.term, entry]),
);

interface GlossSegment {
   at: number;
   text: string;
   term?: string;
}

const FORM_TO_TERM = new Map(
   GLOSSARY.flatMap(({ term, match }) =>
      match.map((form) => [form, term] as const),
   ),
);

const escapeRegExp = (value: string) =>
   value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/* Longest form first so "AWS Organizations" wins over "Organizations" and
   "SCPs" over "SCP"; the lookarounds keep matches to whole words. */
const GLOSS_PATTERN = new RegExp(
   "(?<![A-Za-z0-9])(?:" +
      [...FORM_TO_TERM.keys()]
         .sort((a, b) => b.length - a.length)
         .map(escapeRegExp)
         .join("|") +
      ")(?![A-Za-z0-9])",
   "g",
);

/* Splits text into plain runs and glossed runs, with string offsets for
   stable React keys. Only the first occurrence of each term is marked;
   repeats stay in the surrounding plain run. */
export const segmentGloss = (text: string): GlossSegment[] => {
   const out: GlossSegment[] = [];
   const seen = new Set<string>();
   let cursor = 0;
   for (const match of text.matchAll(GLOSS_PATTERN)) {
      const term = FORM_TO_TERM.get(match[0]);
      if (!term || seen.has(term)) continue;
      seen.add(term);
      if (match.index > cursor)
         out.push({ at: cursor, text: text.slice(cursor, match.index) });
      out.push({ at: match.index, text: match[0], term });
      cursor = match.index + match[0].length;
   }
   if (cursor < text.length) out.push({ at: cursor, text: text.slice(cursor) });
   return out;
};
