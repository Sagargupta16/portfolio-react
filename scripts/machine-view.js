// Machine view: plain-text copies of the portfolio for AI agents and tools.
// buildMachineFiles(rootDir) reads data/*.json and returns a Map of
// relative path -> file content (llms.txt, index.md, sagar-gupta.vcf).
// vite.config.js writes these into build/ and serves them in dev.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://sagargupta.online/portfolio-react/";
const DATA_FILES = [
   "personal",
   "experience",
   "projects",
   "skills",
   "achievements",
   "education",
   "news",
   "services",
   "sections",
   "glossary",
   "annotations",
   "ui",
];

// Generated text stays plain: every dash punctuation char (en/em dash
// included) becomes "-", emoji are dropped.
const DASHES = /\p{Pd}/gu;
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
const clean = (value) =>
   String(value ?? "")
      .replaceAll(DASHES, "-")
      .replaceAll(EMOJI, "")
      .replaceAll(/\s{2,}/g, " ")
      .trim();

// The site drops the leading emoji token from each about line.
const stripLeadToken = (text) => clean(String(text).replace(/^\S+\s/, ""));

// Fallback label for a data key: "clients_served" -> "Clients served". Keys
// that read badly alone take their label from data/ instead.
const titleCase = (key) => {
   const words = key.replaceAll("_", " ");
   return words[0].toUpperCase() + words.slice(1);
};

// Each key reads its Stats tile label (personal.stats), so the two surfaces
// cannot drift; personal.impact_labels can override one for the machine view.
const impactLabel = (key, personal) => {
   const label =
      personal.impact_labels?.[key] ?? personal.stats?.tiles?.[key]?.label;
   return label ? clean(label) : titleCase(key);
};

// personal.impact as "Label: value" lines; clients_note rides on clients_served.
const impactLines = (personal) => {
   const impact = personal.impact ?? {};
   return Object.entries(impact)
      .filter(([key]) => key !== "clients_note")
      .map(([key, value]) => {
         const note =
            key === "clients_served" && impact.clients_note
               ? ` (${clean(impact.clients_note)})`
               : "";
         return `- ${impactLabel(key, personal)}: ${clean(value)}${note}`;
      });
};

// The site's section headings (data/sections.json) in page order, each
// linking its anchor. The *accent* markup is dropped from the title.
const sectionLines = (sections = {}) =>
   Object.entries(sections).map(
      ([id, copy]) =>
         `- [${clean(copy.title).replaceAll("*", "")}](${SITE}#${id}): ${clean(copy.subtitle)}`,
   );

// personal.highlights as "Label: value (note)" lines.
const highlightLines = (highlights = []) =>
   highlights.map((h) => {
      const note = h.note ? ` (${clean(h.note)})` : "";
      return `- ${clean(h.label)}: ${clean(h.value)}${note}`;
   });

// One coding-platform field as text. The chart series print as a summary
// (counts per difficulty, first and last rated contest) instead of raw data.
const platformFact = ([key, value]) => {
   const label = key.replaceAll("_", " ");
   if (key === "rating_history") {
      const [firstDate, firstRating] = value[0] ?? [];
      const [lastDate, lastRating] = value.at(-1) ?? [];
      return `${label} ${firstRating} (${firstDate}) to ${lastRating} (${lastDate})`;
   }
   let text = clean(value);
   if (key === "languages") {
      text = value.map((l) => `${clean(l.name)} ${l.percent}%`).join(", ");
   } else if (value !== null && typeof value === "object") {
      text = Object.entries(value)
         .map(([k, v]) => `${k} ${clean(v)}`)
         .join(", ");
   }
   return `${label} ${text}`;
};

const sortedValues = (record) =>
   Object.keys(record ?? {})
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => record[key]);

function loadData(rootDir) {
   const read = (name) =>
      JSON.parse(readFileSync(join(rootDir, "data", `${name}.json`), "utf8"));
   const data = Object.fromEntries(
      DATA_FILES.map((name) => [name, read(name)]),
   );
   // contact.json: only the email and the booking link leave this function.
   const options = read("contact").contact_options ?? [];
   const email = options
      .find((o) => o.link?.startsWith("mailto:"))
      ?.link.slice("mailto:".length);
   // Exact host match: a substring check would accept evil.example/cal.com.
   const booking = options.find((o) => hostOf(o.link) === "cal.com")?.link;
   return { ...data, contact: { email, booking } };
}

const hostOf = (url) => {
   try {
      return new URL(url).hostname;
   } catch {
      return "";
   }
};

const socialLink = (personal, name) =>
   personal.social_profiles?.find((p) => p.name === name)?.link;

const link = (label, url) => (url ? `[${label}](${url})` : "");

function projectLine(project, { long }) {
   const head = [
      `**${clean(project.title)}**`,
      project.date && `(${clean(project.date)})`,
      // Skip the marker when the description already opens with it.
      project.organization === "aws-samples" &&
         !project.description?.startsWith("Published by AWS") &&
         "- Published by AWS",
   ]
      .filter(Boolean)
      .join(" ");
   const links = [link("GitHub", project.github), link("Live", project.live)]
      .filter(Boolean)
      .join(" | ");
   const description = clean(project.description);
   const summary = long
      ? description
      : (/^.+?[.!?](\s|$)/.exec(description)?.[0] ?? description).trim();
   const lines = [`- ${head}: ${summary}`];
   if (project.tools_tech?.length) {
      lines.push(`  - Tech: ${project.tools_tech.map(clean).join(", ")}`);
   }
   const brief = project.case_study;
   if (long && brief) {
      lines.push(
         `  - Problem: ${clean(brief.problem)}`,
         `  - What I built: ${clean(brief.built)}`,
         `  - Key decisions: ${brief.decisions.map(clean).join("; ")}`,
         `  - Outcome: ${clean(brief.outcome)}`,
      );
   }
   if (links) lines.push(`  - Links: ${links}`);
   return lines.join("\n");
}

function contactLines({ personal, contact }) {
   const linkedin = socialLink(personal, "LinkedIn");
   const github = socialLink(personal, "GitHub");
   return [
      contact.email && `- Email: ${contact.email}`,
      linkedin && `- LinkedIn: ${linkedin}`,
      github && `- GitHub: ${github}`,
      contact.booking && `- Schedule a chat: ${contact.booking}`,
   ].filter(Boolean);
}

const isActive = (cert, today) => !cert.expiryDate || cert.expiryDate >= today;

// index.md is built one section at a time; each block returns its lines,
// ending on the blank line that separates it from the next.

const bullets = (record) =>
   sortedValues(record).map((bullet) => `- ${clean(bullet)}`);

const aboutBlock = (personal) => [
   "## About",
   "",
   ...Object.values(personal.about ?? {}).map(
      (line) => `- ${stripLeadToken(line)}`,
   ),
   "",
];

const impactBlock = (personal) => [
   "## Impact",
   "",
   ...impactLines(personal),
   ...highlightLines(personal.highlights),
   "",
];

function engagementLines(project) {
   const date = project.date ? ` (${clean(project.date)})` : "";
   const skills = project.skills?.length
      ? [`- Skills: ${project.skills.map(clean).join(", ")}`]
      : [];
   return [
      `#### ${clean(project.name)}${date}`,
      "",
      ...bullets(project.description),
      ...skills,
      "",
   ];
}

function jobLines(job) {
   const extras = [
      ...(job.internal_contributions ?? []),
      ...(job.internal_achievements ?? []),
   ];
   const recognition = extras.length
      ? [
           "#### Samples, reviews, talks and recognition",
           "",
           ...extras.map(
              (item) => `- ${clean(item.title)} (${clean(item.year)})`,
           ),
           "",
        ]
      : [];
   return [
      `### ${clean(job.title)}, ${clean(job.company)}`,
      "",
      [job.date, job.location, job.position]
         .filter(Boolean)
         .map(clean)
         .join(" | "),
      "",
      ...(job.summary ? [clean(job.summary), ""] : []),
      ...(job.projects ?? []).flatMap(engagementLines),
      ...recognition,
   ];
}

const positionLines = (role) => [
   `### ${clean(role.title)}, ${clean(role.company)}`,
   "",
   clean(role.date),
   "",
   ...bullets(role.description),
   "",
];

const experienceBlock = (experience) => [
   "## Experience",
   "",
   ...(experience.professional_experience ?? []).flatMap(jobLines),
   ...(experience.positions_of_responsibility ?? []).flatMap(positionLines),
];

const PROJECT_GROUPS = [
   ["collaborative_projects", "Collaborative"],
   ["other_projects", "Other"],
   ["community_projects", "Community and tools"],
];

const projectsBlock = (projects) => [
   "## Projects",
   "",
   "### Featured",
   "",
   ...(projects.featured_projects ?? []).map((project) =>
      projectLine(project, { long: true }),
   ),
   "",
   ...PROJECT_GROUPS.filter(([key]) => projects[key]?.length).flatMap(
      ([key, label]) => [
         `### ${label}`,
         "",
         ...projects[key].map((project) =>
            projectLine(project, { long: false }),
         ),
         "",
      ],
   ),
];

function openSourceBlock(projects) {
   const prs = (projects.open_source_contributions ?? []).map((pr) => {
      const merged = pr.merged_at ? `, ${pr.merged_at}` : "";
      return `- ${clean(pr.repo)}: [${clean(pr.title)}](${pr.url}) (${clean(pr.status)}${merged})`;
   });
   const answers = (projects.community_discussions ?? []).map(
      (item) =>
         `- ${clean(item.repo)}: [${clean(item.title)}](${item.url}) (${clean(item.status)})`,
   );
   return [
      "## Open source contributions",
      "",
      ...prs,
      "",
      ...(answers.length ? ["### Community answers", "", ...answers, ""] : []),
   ];
}

// Category labels come from skills.json `categories`, as on the site.
const skillsBlock = (skills) => [
   "## Skills",
   "",
   ...Object.entries(skills)
      .filter(([key, list]) => key !== "hero_stack" && Array.isArray(list))
      .map(([key, list]) => {
         const label = skills.categories?.[key]?.label ?? titleCase(key);
         return `- ${clean(label)}: ${list.map(clean).join(", ")}`;
      }),
   "",
];

const certificationsBlock = ({ achievements, today }) => [
   "## Certifications",
   "",
   ...(achievements.certifications ?? [])
      .filter((cert) => isActive(cert, today))
      .map((cert) => {
         const expiry = cert.expiryDate ? `, expires ${cert.expiryDate}` : "";
         return `- ${link(clean(cert.name), cert.badgeUrl)}, ${clean(cert.issuer)}. Issued ${cert.issueDate}${expiry}`;
      }),
   "",
];

// Platform names come from the Stats cards' copy (personal.stats.platforms).
const platformLine =
   (platforms) =>
   ([platform, stats]) => {
      const facts = Object.entries(stats)
         .filter(([key]) => key !== "url" && key !== "username")
         .map(platformFact)
         .join(", ");
      const name = platforms?.[platform]?.label;
      return `- ${link(name ? clean(name) : titleCase(platform), stats.url)}: ${facts}`;
   };

const achievementsBlock = ({ achievements, personal }) => [
   "## Achievements",
   "",
   ...(achievements.achievements ?? []).map(
      (item) =>
         `- ${clean(item.title)}, ${clean(item.organizer)} (${clean(item.date)})`,
   ),
   ...Object.entries(achievements.coding_platform_stats ?? {}).map(
      platformLine(personal.stats?.platforms),
   ),
   "",
];

function schoolLines(school) {
   const facts = [
      school.cgpa && `- CGPA: ${clean(school.cgpa)}`,
      ...(school.achievements ?? []).map((item) => `- ${clean(item)}`),
   ].filter(Boolean);
   return [
      `### ${clean(school.title)}`,
      "",
      [school.institution, school.location, school.date]
         .filter(Boolean)
         .map(clean)
         .join(" | "),
      "",
      ...(facts.length ? [...facts, ""] : []),
   ];
}

const educationBlock = (education) => [
   "## Education",
   "",
   ...(education ?? []).flatMap(schoolLines),
];

const servicesBlock = (services) => [
   "## Focus areas",
   "",
   ...(services ?? []).map(
      (service) =>
         `- ${clean(service.title)}: ${(service.list ?? []).map(clean).join(", ")}`,
   ),
   "",
];

function newsBlock(news) {
   const recent = [...(news ?? [])]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 10);
   return [
      "## Recent news",
      "",
      ...recent.map((item) => {
         const text = clean(item.text);
         return `- ${item.date}: ${item.link ? link(text, item.link) : text}`;
      }),
      "",
   ];
}

function buildMarkdown(d) {
   const { personal } = d;
   return [
      `# ${clean(personal.name)}`,
      "",
      `${clean(personal.title)}. ${clean(personal.location)}.`,
      "",
      clean(personal.intro),
      "",
      "## Sections",
      "",
      ...sectionLines(d.sections),
      "",
      ...aboutBlock(personal),
      ...impactBlock(personal),
      ...experienceBlock(d.experience),
      ...projectsBlock(d.projects),
      ...openSourceBlock(d.projects),
      ...skillsBlock(d.skills),
      ...certificationsBlock(d),
      ...achievementsBlock(d),
      ...educationBlock(d.education),
      ...servicesBlock(d.services),
      ...newsBlock(d.news),
      "## Contact",
      "",
      ...contactLines(d),
      "",
      clean(d.ui.footer.disclaimer),
      "",
   ].join("\n");
}

function buildLlmsTxt(d) {
   const { personal, projects, achievements, today } = d;
   const activeCerts = (achievements.certifications ?? []).filter((c) =>
      isActive(c, today),
   );
   const awsSamples = (projects.featured_projects ?? []).filter(
      (p) => p.organization === "aws-samples",
   );
   const merged = (projects.open_source_contributions ?? []).filter(
      (p) => p.status === "merged",
   );
   const mergedRepos = [...new Set(merged.map((p) => clean(p.repo)))];
   const facts = [
      ...impactLines(personal),
      ...highlightLines(personal.highlights),
      awsSamples.length > 0 &&
         `- Published by AWS (aws-samples): ${awsSamples.map((p) => clean(p.title)).join(", ")}`,
      merged.length > 0 &&
         `- Merged open source PRs: ${merged.length}, in ${mergedRepos.join(", ")}`,
      activeCerts.length > 0 &&
         `- Active certifications: ${activeCerts.map((c) => clean(c.name)).join(", ")}`,
   ].filter(Boolean);

   return [
      `# ${clean(personal.name)}`,
      "",
      `> ${clean(personal.title)}, based in ${clean(personal.location)}. ${clean(personal.intro)}`,
      "",
      ...facts,
      "",
      "## Pages",
      "",
      `- [Full profile](${SITE}index.md): the whole portfolio as Markdown`,
      `- [Resume](${SITE}resume.pdf): PDF resume`,
      `- [vCard](${SITE}sagar-gupta.vcf): contact card`,
      `- [Website](${SITE}): interactive portfolio`,
      "",
      "## Sections",
      "",
      ...sectionLines(d.sections),
      "",
      "## Data",
      "",
      ...DATA_FILES.map((name) => `- [${name}.json](${SITE}data/${name}.json)`),
      "",
      "## Contact",
      "",
      ...contactLines(d),
      "",
      clean(d.ui.footer.disclaimer),
      "",
   ].join("\n");
}

// vCard 3.0 (RFC 2426): escape text values, fold lines at 75 octets, CRLF.
const vEscape = (value) =>
   clean(value)
      .replaceAll("\\", String.raw`\\`)
      .replaceAll("\n", String.raw`\n`)
      .replaceAll(",", String.raw`\,`)
      .replaceAll(";", String.raw`\;`);

function fold(line) {
   const parts = [];
   let current = "";
   let bytes = 0;
   for (const char of line) {
      const size = Buffer.byteLength(char);
      // Continuation lines start with one space, which counts toward 75.
      const limit = parts.length === 0 ? 75 : 74;
      if (bytes + size > limit) {
         parts.push(current);
         current = "";
         bytes = 0;
      }
      current += char;
      bytes += size;
   }
   parts.push(current);
   return parts.join("\r\n ");
}

function buildVcard({ personal, contact }) {
   const name = clean(personal.name);
   const [given, ...family] = name.split(" ");
   const place = clean(personal.location)
      .split(",")
      .map((s) => s.trim());
   const locality = place[0] ?? "";
   const country = place.length > 1 ? place.at(-1) : "";
   const linkedin = socialLink(personal, "LinkedIn");
   const github = socialLink(personal, "GitHub");
   const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${vEscape(name)}`,
      `N:${vEscape(family.join(" "))};${vEscape(given)};;;`,
      `TITLE:${vEscape(personal.title)}`,
      `ORG:${vEscape(personal.employer)}`,
      contact.email && `EMAIL;TYPE=INTERNET:${contact.email}`,
      `URL:${SITE}`,
      linkedin && `X-SOCIALPROFILE;TYPE=linkedin:${linkedin}`,
      github && `X-SOCIALPROFILE;TYPE=github:${github}`,
      `ADR;TYPE=WORK:;;;${vEscape(locality)};;;${vEscape(country)}`,
      `NOTE:${vEscape(personal.intro)}`,
      "END:VCARD",
   ].filter(Boolean);
   return lines.map(fold).join("\r\n") + "\r\n";
}

const xmlEscape = (text) =>
   String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

// News dates are "YYYY-MM" or "YYYY-MM-DD"; a month-only item counts as the 1st.
const rfc822 = (date) => {
   const [y, m = "01", d = "01"] = date.split("-");
   return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))).toUTCString();
};

// Same FNV-1a over date + text the News section uses for its commit hashes,
// so each item keeps one stable guid across builds.
const newsHash = (item) => {
   let h = 0x811c9dc5;
   for (const ch of `${item.date}${item.text}`) {
      h ^= ch.codePointAt(0) ?? 0;
      h = Math.imul(h, 0x01000193);
   }
   return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
};

function buildRss({ personal, news }) {
   const items = [...news]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 40)
      .map((item) => {
         const text = clean(item.text);
         const link = item.link || `${SITE}#news`;
         return [
            "    <item>",
            `      <title>${xmlEscape(text)}</title>`,
            `      <link>${xmlEscape(link)}</link>`,
            `      <guid isPermaLink="false">news-${newsHash(item)}</guid>`,
            `      <pubDate>${rfc822(item.date)}</pubDate>`,
            `      <category>${xmlEscape(item.type)}</category>`,
            "    </item>",
         ].join("\n");
      });
   return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
      "  <channel>",
      `    <title>${xmlEscape(clean(personal.name))}: news</title>`,
      `    <link>${SITE}#news</link>`,
      `    <atom:link href="${SITE}rss.xml" rel="self" type="application/rss+xml" />`,
      `    <description>${xmlEscape(clean(personal.intro))}</description>`,
      "    <language>en</language>",
      ...items,
      "  </channel>",
      "</rss>",
      "",
   ].join("\n");
}

export function buildMachineFiles(rootDir) {
   const today = new Date().toISOString().slice(0, 10);
   const data = { ...loadData(rootDir), today };
   return new Map([
      ["llms.txt", buildLlmsTxt(data)],
      ["index.md", buildMarkdown(data)],
      ["sagar-gupta.vcf", buildVcard(data)],
      ["rss.xml", buildRss(data)],
   ]);
}
