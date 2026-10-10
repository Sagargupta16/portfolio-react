/* Plain-language definitions for the cloud jargon in the site copy, plus the
   splitter GlossText uses to mark terms. Every entry must occur in
   data/personal.json, data/projects.json or data/experience.json (the
   glossary test enforces it). Surface forms match case-sensitively and as
   whole words, so "OU" never matches inside "YOUR". */

export interface GlossEntry {
   term: string;
   match: string[];
   definition: string;
}

export const GLOSSARY: GlossEntry[] = [
   {
      term: "Terraform",
      match: ["Terraform"],
      definition:
         "A HashiCorp tool that describes cloud infrastructure as code, so environments can be reviewed, versioned and rebuilt identically.",
   },
   {
      term: "CI/CD",
      match: ["CI/CD"],
      definition:
         "Continuous integration and delivery: every code change is automatically built, tested and shipped through the same repeatable pipeline.",
   },
   {
      term: "DevOps",
      match: ["DevOps"],
      definition:
         "A way of working where the people who build software also automate how it is tested, deployed and run.",
   },
   {
      term: "MLOps",
      match: ["MLOps"],
      definition:
         "DevOps practices applied to machine learning: automating how models are trained, checked, deployed and monitored once live.",
   },
   {
      term: "SageMaker",
      match: ["Amazon SageMaker", "SageMaker"],
      definition:
         "Amazon's managed service for building, training and hosting machine learning models without running the servers yourself.",
   },
   {
      term: "Bedrock",
      match: ["Amazon Bedrock", "AWS Bedrock", "Bedrock"],
      definition:
         "An AWS service that gives applications access to large language models from Anthropic, Amazon and others through one API.",
   },
   {
      term: "Control Tower",
      match: ["AWS Control Tower", "Control Tower"],
      definition:
         "An AWS service that sets up and governs a multi-account environment from a standard baseline of accounts, policies and logging.",
   },
   {
      term: "Landing zone",
      match: ["Landing Zone", "landing zone"],
      definition:
         "The prepared starting point of a multi-account AWS setup: core accounts, networking, identity and security controls in place first.",
   },
   {
      term: "AWS Organizations",
      match: ["AWS Organizations", "Organizations"],
      definition:
         "The AWS service that groups many accounts under one management account for central billing, structure and policy.",
   },
   {
      term: "OU",
      match: ["OUs", "OU"],
      definition:
         "Organizational unit: a folder in AWS Organizations that groups accounts so one policy can apply to all of them.",
   },
   {
      term: "SCP",
      match: ["SCPs", "SCP"],
      definition:
         "Service control policy: an AWS Organizations rule that caps what accounts in its scope may do, even their administrators.",
   },
   {
      term: "Guardrails",
      match: ["guardrails", "guardrail"],
      definition:
         "Automated rules that prevent or flag risky configurations, like public storage or missing encryption, across every account.",
   },
   {
      term: "Drift",
      match: ["drift"],
      definition:
         "When live data stops resembling the data a model was trained on, so its predictions quietly get worse.",
   },
   {
      term: "EventBridge",
      match: ["Amazon EventBridge", "EventBridge"],
      definition:
         "An AWS service that routes events, such as an alarm firing, to the code or workflow that should react.",
   },
   {
      term: "MCP",
      match: ["MCP"],
      definition:
         "Model Context Protocol: an open standard that lets AI assistants call external tools and data through one common interface.",
   },
   {
      term: "aws-samples",
      match: ["aws-samples"],
      definition:
         "The official AWS GitHub organization for example code that AWS reviews and publishes for customers to reuse.",
   },
   {
      term: "Prescriptive Guidance",
      match: ["AWS Prescriptive Guidance", "Prescriptive Guidance"],
      definition:
         "AWS's library of vetted strategies, guides and architecture patterns for common migration and modernization problems.",
   },
];

export const GLOSSARY_BY_TERM = new Map(
   GLOSSARY.map((entry) => [entry.term, entry]),
);

export interface GlossSegment {
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
   String.raw`(?<![A-Za-z0-9])(?:` +
      [...FORM_TO_TERM.keys()]
         .sort((a, b) => b.length - a.length)
         .map(escapeRegExp)
         .join("|") +
      String.raw`)(?![A-Za-z0-9])`,
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
