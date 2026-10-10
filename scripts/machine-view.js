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

// Labels the site uses where the key alone reads badly.
const LABELS = {
   cloud_devops: "Cloud & DevOps",
   ai_ml: "AI / Machine Learning",
   backend: "Backend & Databases",
   tools_platforms: "Tools & Platforms",
   cs_fundamentals: "CS fundamentals",
   aws_accounts: "AWS accounts",
   leetcode: "LeetCode",
   geeksforgeeks: "GeeksforGeeks",
   hackerrank: "HackerRank",
};
const titleCase = (key) => {
   if (LABELS[key]) return LABELS[key];
   const words = key.split("_").join(" ");
   return words[0].toUpperCase() + words.slice(1);
};

// personal.impact as "Label: value" lines; clients_note rides on clients_served.
const impactLines = (impact = {}) =>
   Object.entries(impact)
      .filter(([key]) => key !== "clients_note")
      .map(([key, value]) => {
         const note =
            key === "clients_served" && impact.clients_note
               ? ` (${clean(impact.clients_note)})`
               : "";
         return `- ${titleCase(key)}: ${clean(value)}${note}`;
      });

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
      : (description.match(/^.+?[.!?](\s|$)/)?.[0] ?? description).trim();
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
      contact.booking && `- Book a call: ${contact.booking}`,
   ].filter(Boolean);
}

const isActive = (cert, today) => !cert.expiryDate || cert.expiryDate >= today;

function buildMarkdown(d) {
   const { personal, experience, projects, skills, achievements, today } = d;
   const out = [`# ${clean(personal.name)}`, ""];
   out.push(`${clean(personal.title)}. ${clean(personal.location)}.`, "");
   out.push(clean(personal.intro), "");

   out.push("## About", "");
   for (const line of Object.values(personal.about ?? {})) {
      out.push(`- ${stripLeadToken(line)}`);
   }
   out.push("");

   out.push("## Impact", "", ...impactLines(personal.impact), "");

   out.push("## Experience", "");
   for (const job of experience.professional_experience ?? []) {
      out.push(`### ${clean(job.title)}, ${clean(job.company)}`, "");
      out.push(
         [job.date, job.location, job.position]
            .filter(Boolean)
            .map(clean)
            .join(" | "),
         "",
      );
      if (job.summary) out.push(clean(job.summary), "");
      for (const project of job.projects ?? []) {
         const date = project.date ? ` (${clean(project.date)})` : "";
         out.push(`#### ${clean(project.name)}${date}`, "");
         for (const bullet of sortedValues(project.description)) {
            out.push(`- ${clean(bullet)}`);
         }
         if (project.skills?.length) {
            out.push(`- Skills: ${project.skills.map(clean).join(", ")}`);
         }
         out.push("");
      }
      const extras = [
         ...(job.internal_contributions ?? []),
         ...(job.internal_achievements ?? []),
      ];
      if (extras.length) {
         out.push("#### Internal contributions and recognition", "");
         for (const item of extras) {
            out.push(`- ${clean(item.title)} (${clean(item.year)})`);
         }
         out.push("");
      }
   }
   for (const role of experience.positions_of_responsibility ?? []) {
      out.push(`### ${clean(role.title)}, ${clean(role.company)}`, "");
      out.push(clean(role.date), "");
      for (const bullet of sortedValues(role.description)) {
         out.push(`- ${clean(bullet)}`);
      }
      out.push("");
   }

   out.push("## Projects", "", "### Featured", "");
   for (const project of projects.featured_projects ?? []) {
      out.push(projectLine(project, { long: true }));
   }
   out.push("");
   for (const [key, label] of [
      ["collaborative_projects", "Collaborative"],
      ["other_projects", "Other"],
      ["community_projects", "Community and tools"],
   ]) {
      if (!projects[key]?.length) continue;
      out.push(`### ${label}`, "");
      for (const project of projects[key]) {
         out.push(projectLine(project, { long: false }));
      }
      out.push("");
   }

   out.push("## Open source contributions", "");
   for (const pr of projects.open_source_contributions ?? []) {
      const merged = pr.merged_at ? `, ${pr.merged_at}` : "";
      out.push(
         `- ${clean(pr.repo)}: [${clean(pr.title)}](${pr.url}) (${clean(pr.status)}${merged})`,
      );
   }
   out.push("");
   if (projects.community_discussions?.length) {
      out.push("### Community answers", "");
      for (const item of projects.community_discussions) {
         out.push(
            `- ${clean(item.repo)}: [${clean(item.title)}](${item.url}) (${clean(item.status)})`,
         );
      }
      out.push("");
   }

   out.push("## Skills", "");
   for (const [key, list] of Object.entries(skills)) {
      if (key === "hero_stack" || !Array.isArray(list)) continue;
      out.push(`- ${titleCase(key)}: ${list.map(clean).join(", ")}`);
   }
   out.push("");

   out.push("## Certifications", "");
   for (const cert of achievements.certifications ?? []) {
      if (!isActive(cert, today)) continue;
      const expiry = cert.expiryDate ? `, expires ${cert.expiryDate}` : "";
      out.push(
         `- ${link(clean(cert.name), cert.badgeUrl)}, ${clean(cert.issuer)}. Issued ${cert.issueDate}${expiry}`,
      );
   }
   out.push("");

   out.push("## Achievements", "");
   for (const item of achievements.achievements ?? []) {
      out.push(
         `- ${clean(item.title)}, ${clean(item.organizer)} (${clean(item.date)})`,
      );
   }
   for (const [platform, stats] of Object.entries(
      achievements.coding_platform_stats ?? {},
   )) {
      const facts = Object.entries(stats)
         .filter(([key]) => key !== "url" && key !== "username")
         .map(([key, value]) => `${key.replaceAll("_", " ")} ${clean(value)}`)
         .join(", ");
      out.push(`- ${link(titleCase(platform), stats.url)}: ${facts}`);
   }
   out.push("");

   out.push("## Education", "");
   for (const school of d.education ?? []) {
      out.push(`### ${clean(school.title)}`, "");
      out.push(
         [school.institution, school.location, school.date]
            .filter(Boolean)
            .map(clean)
            .join(" | "),
         "",
      );
      const facts = [
         school.cgpa && `- CGPA: ${clean(school.cgpa)}`,
         ...(school.achievements ?? []).map((item) => `- ${clean(item)}`),
      ].filter(Boolean);
      if (facts.length) out.push(...facts, "");
   }

   out.push("## Services", "");
   for (const service of d.services ?? []) {
      const list = (service.list ?? []).map(clean).join(", ");
      out.push(`- ${clean(service.title)}: ${list}`);
   }
   out.push("");

   out.push("## Recent news", "");
   const news = [...(d.news ?? [])]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 10);
   for (const item of news) {
      const text = clean(item.text);
      out.push(`- ${item.date}: ${item.link ? link(text, item.link) : text}`);
   }
   out.push("");

   out.push("## Contact", "", ...contactLines(d), "");
   return out.join("\n");
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
      ...impactLines(personal.impact),
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
      "## Data",
      "",
      ...DATA_FILES.map((name) => `- [${name}.json](${SITE}data/${name}.json)`),
      "",
      "## Contact",
      "",
      ...contactLines(d),
      "",
   ].join("\n");
}

// vCard 3.0 (RFC 2426): escape text values, fold lines at 75 octets, CRLF.
const vEscape = (value) =>
   clean(value)
      .replaceAll("\\", "\\\\")
      .replaceAll("\n", "\\n")
      .replaceAll(",", "\\,")
      .replaceAll(";", "\\;");

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
