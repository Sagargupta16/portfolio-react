#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const loadJson = (relativePath) => {
   try {
      return JSON.parse(readFileSync(resolve(ROOT, relativePath), "utf8"));
   } catch (error) {
      errors.push(`${relativePath}: ${error.message}`);
      return null;
   }
};

const fail = (path, message) => errors.push(`${path}: ${message}`);
const isRecord = (value) =>
   value !== null && typeof value === "object" && !Array.isArray(value);
const isNonEmptyString = (value) =>
   typeof value === "string" && value.trim().length > 0;
const isStringArray = (value) =>
   Array.isArray(value) && value.every(isNonEmptyString);

const requireRecord = (value, path) => {
   if (!isRecord(value)) {
      fail(path, "must be an object");
      return false;
   }
   return true;
};

const requireArray = (value, path) => {
   if (!Array.isArray(value)) {
      fail(path, "must be an array");
      return false;
   }
   return true;
};

const requireString = (value, path) => {
   if (!isNonEmptyString(value)) fail(path, "must be a non-empty string");
};

const requireStringArray = (value, path) => {
   if (!isStringArray(value))
      fail(path, "must be an array of non-empty strings");
};

const requireStringRecord = (value, path) => {
   if (!requireRecord(value, path)) return;
   if (Object.keys(value).length === 0) fail(path, "must not be empty");
   for (const [key, entry] of Object.entries(value)) {
      requireString(entry, `${path}.${key}`);
   }
};

// A copy template: a non-empty string whose `{name}` placeholders are all
// ones the component fills.
const requireTemplate = (value, path, allowed = []) => {
   requireString(value, path);
   for (const [, name] of String(value ?? "").matchAll(/\{(\w+)\}/g)) {
      if (!allowed.includes(name)) {
         fail(
            path,
            `unknown placeholder {${name}}; allowed: ${allowed.join(", ") || "none"}`,
         );
      }
   }
};

// Copy fields a component reads from one data record: field -> the
// placeholders that field may use, or a nested group of such fields.
const requireCopy = (record, path, fields) => {
   if (!requireRecord(record, path)) return;
   for (const [field, allowed] of Object.entries(fields)) {
      if (Array.isArray(allowed)) {
         requireTemplate(record[field], `${path}.${field}`, allowed);
      } else {
         requireCopy(record[field], `${path}.${field}`, allowed);
      }
   }
};

// A title or line that may mark ONE word as *accent* (AccentText).
const requireOneAccent = (value, path) => {
   const stars = String(value).split("*").length - 1;
   if (stars !== 0 && stars !== 2) {
      fail(path, "may mark at most one *accent* word");
   }
};

// Optional engineering brief on projects and engagements.
const checkCaseStudy = (value, path) => {
   if (value === undefined) return;
   if (!requireRecord(value, path)) return;
   for (const field of ["problem", "built", "outcome"]) {
      requireString(value[field], `${path}.${field}`);
   }
   requireStringArray(value.decisions, `${path}.decisions`);
};

const requireUnique = (items, key, path) => {
   const seen = new Set();
   for (const [index, item] of items.entries()) {
      const value = item?.[key];
      if (value === undefined || value === null || value === "") {
         fail(`${path}[${index}].${key}`, "is required");
      } else if (seen.has(value)) {
         fail(
            `${path}[${index}].${key}`,
            `duplicates ${JSON.stringify(value)}`,
         );
      }
      seen.add(value);
   }
};

const requireUrl = (value, path, protocols = ["https:"]) => {
   try {
      const url = new URL(value);
      if (!protocols.includes(url.protocol)) {
         fail(path, `must use ${protocols.join(" or ")}`);
      }
   } catch {
      fail(path, "must be a valid URL");
   }
};

const requireUrlOnHost = (value, path, hostname, pathPrefix = "/") => {
   let url;
   try {
      url = new URL(value);
   } catch {
      fail(path, "must be a valid URL");
      return;
   }
   if (url.protocol !== "https:") fail(path, "must use https:");
   if (url.hostname !== hostname) fail(path, `must be hosted on ${hostname}`);
   if (!url.pathname.startsWith(pathPrefix)) {
      fail(path, `must have a path starting with ${pathPrefix}`);
   }
};

const requireIsoDate = (value, path) => {
   if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
      fail(path, "must use YYYY-MM-DD format");
   }
};

// Keys a source file registers, one per match of `pattern` (group 1 is the
// key), so data and code cannot drift apart.
const readSourceKeys = (path, pattern) => {
   try {
      const source = readFileSync(resolve(ROOT, path), "utf8");
      return new Set([...source.matchAll(pattern)].map((match) => match[1]));
   } catch (error) {
      fail(path, error.message);
      return new Set();
   }
};

// A data map keyed by registered ids: every id needs an entry, and every
// entry needs a registered id. Returns the entries to check field by field.
const requireKeyedEntries = (record, path, ids, source) => {
   if (!requireRecord(record, path)) return [];
   if (ids.size === 0) fail(source, "no ids found; check its pattern");
   for (const id of ids) {
      if (!(id in record)) fail(`${path}.${id}`, `is required by ${source}`);
   }
   for (const id of Object.keys(record)) {
      if (!ids.has(id)) fail(`${path}.${id}`, `is not an id in ${source}`);
   }
   return Object.entries(record).filter(([id]) => ids.has(id));
};

const validateEntityArray = (items, path, requiredFields) => {
   if (!requireArray(items, path)) return;
   requireUnique(items, "id", path);
   for (const [index, item] of items.entries()) {
      const itemPath = `${path}[${index}]`;
      if (!requireRecord(item, itemPath)) continue;
      for (const field of requiredFields) {
         requireString(item[field], `${itemPath}.${field}`);
      }
   }
};

const personal = loadJson("data/personal.json");
const education = loadJson("data/education.json");
const experience = loadJson("data/experience.json");
const skills = loadJson("data/skills.json");
const services = loadJson("data/services.json");
const projects = loadJson("data/projects.json");
const achievements = loadJson("data/achievements.json");
const contact = loadJson("data/contact.json");
const news = loadJson("data/news.json");
const sections = loadJson("data/sections.json");
const ui = loadJson("data/ui.json");
const glossary = loadJson("data/glossary.json");
const annotations = loadJson("data/annotations.json");

const NEWS_TYPES = new Set([
   "launch",
   "oss",
   "community",
   "cert",
   "award",
   "work",
   "education",
]);
if (requireArray(news, "news")) {
   const seen = new Set();
   news.forEach((item, index) => {
      const path = `news[${index}]`;
      if (!requireRecord(item, path)) return;
      if (!/^\d{4}-\d{2}(-\d{2})?$/.test(item.date ?? "")) {
         fail(`${path}.date`, "must use YYYY-MM or YYYY-MM-DD");
      }
      if (!NEWS_TYPES.has(item.type)) {
         fail(`${path}.type`, `must be one of ${[...NEWS_TYPES].join(", ")}`);
      }
      requireString(item.text, `${path}.text`);
      if (typeof item.text === "string" && item.text.length > 160) {
         fail(`${path}.text`, "keep news lines under 160 characters");
      }
      if (item.link !== undefined) requireUrl(item.link, `${path}.link`);
      if (
         item.impact !== undefined &&
         !["major", "minor"].includes(item.impact)
      ) {
         fail(`${path}.impact`, 'must be "major" or "minor" (omit for normal)');
      }
      const key = `${item.date}|${item.text}`;
      if (seen.has(key)) fail(path, "duplicate news item");
      seen.add(key);
      // Newest first, compared by month so exact-day and month-only items can mix.
      const prev = news[index - 1];
      if (
         prev &&
         String(prev.date).slice(0, 7) < String(item.date).slice(0, 7)
      ) {
         fail(path, "news must be sorted newest first");
      }
   });
}

if (requireRecord(personal, "data/personal.json")) {
   for (const field of [
      "name",
      "title",
      "location",
      "intro",
      "role_label",
      "headline",
      "hero_greeting",
      "availability",
      "role",
      "employer",
      "timezone",
   ]) {
      requireString(personal[field], `personal.${field}`);
   }
   requireStringArray(personal.hero_taglines, "personal.hero_taglines");
   if (
      Array.isArray(personal.hero_taglines) &&
      personal.hero_taglines.length === 0
   ) {
      fail("personal.hero_taglines", "must contain at least one tagline");
   }
   if (requireRecord(personal.contact, "personal.contact")) {
      requireString(personal.contact.github, "personal.contact.github");
   }
   if (requireArray(personal.languages, "personal.languages")) {
      for (const [index, language] of personal.languages.entries()) {
         requireString(language?.name, `personal.languages[${index}].name`);
         requireString(language?.level, `personal.languages[${index}].level`);
      }
   }
   if (requireArray(personal.social_profiles, "personal.social_profiles")) {
      requireUnique(personal.social_profiles, "id", "personal.social_profiles");
      for (const [index, profile] of personal.social_profiles.entries()) {
         requireString(
            profile?.name,
            `personal.social_profiles[${index}].name`,
         );
         requireString(
            profile?.icon,
            `personal.social_profiles[${index}].icon`,
         );
         requireUrl(profile?.link, `personal.social_profiles[${index}].link`);
      }
   }
   if (requireRecord(personal.about, "personal.about")) {
      for (const [key, value] of Object.entries(personal.about)) {
         requireString(value, `personal.about.${key}`);
      }
   }
   if (requireRecord(personal.impact, "personal.impact")) {
      for (const field of ["clients_served", "clients_note", "years_at_aws"]) {
         requireString(personal.impact[field], `personal.impact.${field}`);
      }
   }
   // Machine-view labels for impact keys that read badly alone.
   if (personal.impact_labels !== undefined) {
      requireStringRecord(personal.impact_labels, "personal.impact_labels");
      for (const key of Object.keys(personal.impact_labels ?? {})) {
         if (!(key in (personal.impact ?? {}))) {
            fail(
               `personal.impact_labels.${key}`,
               "is not a personal.impact key",
            );
         }
      }
   }
   if (requireRecord(personal.site, "personal.site")) {
      requireStringArray(personal.site.tech_stack, "personal.site.tech_stack");
   }
}

// Stats band copy (personal.stats): a heading per group and a label per
// derived tile. Notes are templates; each may only name the placeholders
// StatsBand.tsx fills for that tile.
const STATS_GROUPS = [
   "highlights",
   "impact",
   "delivery",
   "open_source",
   "competitive",
];
const STATS_TILE_PLACEHOLDERS = {
   clients_served: [],
   years_at_aws: [],
   speaker_certs: [],
   talks: [],
   projects: ["featured"],
   certifications: [],
   badges: [],
   podium: ["first", "second", "third"],
   merged_prs: ["repos", "count"],
   stars: [],
   repos: ["big"],
   answers: ["accepted", "helpful"],
   leetcode_rating: ["badge", "top"],
   problems_solved: ["leetcode", "gfg"],
   contests: ["rank"],
   hard_solved: [],
};
const MERGED_PRS_NOTES = ["note_coauthored_one", "note_coauthored_many"];

const checkStatTile = (copy, key, path) => {
   if (!requireRecord(copy, path)) return;
   requireString(copy.label, `${path}.label`);
   if (key === "merged_prs") {
      for (const field of MERGED_PRS_NOTES) {
         requireString(copy[field], `${path}.${field}`);
      }
   }
   for (const [field, note] of Object.entries(copy)) {
      if (field.startsWith("note")) {
         requireTemplate(
            note,
            `${path}.${field}`,
            STATS_TILE_PLACEHOLDERS[key],
         );
      }
   }
};

// Platform card copy (personal.stats.platforms), field by field with the
// placeholders each card fills. The machine view reuses every `label`.
const PLATFORM_COPY = {
   github: {
      label: [],
      contributions: [],
      pull_requests: [],
      longest_streak: [],
      streak_value: ["days"],
      updated: ["date"],
      languages: [],
      profile_label: ["username"],
      // The contribution heatmap (src/pages/stats/calendarData.ts).
      calendar: {
         label: [],
         current: [],
         less: [],
         more: [],
         loading: [],
         summary: ["label", "current", "days"],
         days_one: ["count"],
         days_many: ["count"],
         tip: ["what", "when"],
         contributions_none: [],
         contributions_one: ["count"],
         contributions_many: ["count"],
      },
   },
   leetcode: {
      label: [],
      profile_label: ["username"],
      top: ["top"],
      best_rating: [],
      problems_solved: [],
      contests: [],
      rating_peak: ["rating"],
      rating_contests: ["count"],
      rating_summary: [
         "first",
         "first_year",
         "last",
         "last_year",
         "count",
         "peak",
      ],
      difficulty: [],
      easy: [],
      medium: [],
      hard: [],
   },
   geeksforgeeks: { label: [], caption: [] },
   hackerrank: { label: [], caption: ["cpp"] },
};

if (personal && requireRecord(personal.stats, "personal.stats")) {
   const { headings, tiles, platforms } = personal.stats;
   if (requireRecord(platforms, "personal.stats.platforms")) {
      requireString(
         platforms.link_label,
         "personal.stats.platforms.link_label",
      );
      for (const [platform, fields] of Object.entries(PLATFORM_COPY)) {
         requireCopy(
            platforms[platform],
            `personal.stats.platforms.${platform}`,
            fields,
         );
      }
   }
   if (requireRecord(headings, "personal.stats.headings")) {
      for (const group of STATS_GROUPS) {
         requireString(headings[group], `personal.stats.headings.${group}`);
      }
   }
   const tileEntries = requireKeyedEntries(
      tiles,
      "personal.stats.tiles",
      new Set(Object.keys(STATS_TILE_PLACEHOLDERS)),
      "src/pages/stats/StatsBand.tsx",
   );
   for (const [key, copy] of tileEntries) {
      checkStatTile(copy, key, `personal.stats.tiles.${key}`);
   }
}

// Section copy (data/sections.json), one entry per section id registered in
// src/constants/sections.ts and in page order (the machine view lists them
// as written): its nav label and heading. A title may mark ONE word as
// *accent*. Some sections also carry the copy their components read beyond
// the heading: group -> field -> the placeholders that field may use, or a
// nested group.
const SECTION_EXTRAS = {
   about: {
      facts: {
         based_in: [],
         role: [],
         role_value: ["role", "employer"],
         education: [],
         education_value: ["degree"],
         languages: [],
      },
   },
   experience: {
      subsections: { positions: [] },
      links: {
         source: [],
         source_label: ["name"],
         details: [],
         details_label: ["company"],
      },
      card: { responsibilities: [], present: [], active_role: [] },
      modal: {
         close: [],
         contributions: [],
         achievements: [],
         skills: [],
         full_details: [],
      },
   },
   education: {
      extras: { achievements_one: ["count"], achievements_many: ["count"] },
   },
   projects: {
      subsections: { open_source: [] },
      links: {
         details: [],
         source: [],
         live: [],
         view_source: [],
         details_label: ["title"],
         source_label: ["title"],
         live_label: ["title"],
      },
      search: {
         placeholder: [],
         label: [],
         clear: [],
         summary: ["shown", "total"],
         order_spotlight: [],
         order_newest: [],
         empty_title: [],
         empty_body: ["total"],
         reset: [],
         filter_label: [],
         filter_count_one: ["filter", "count"],
         filter_count_many: ["filter", "count"],
      },
      card: { spotlight: [], evidence_label: [] },
      project_status: { active: [], beta: [], complete: [] },
      evidence: { aws: [], live: [], source: [] },
      open_source: {
         merged: [],
         open: [],
         closed: [],
         accepted: ["count"],
         helpful: ["count"],
      },
      contribution_status: { merged: [], open: [], closed: [] },
      discussion_status: { accepted: [], helpful: [] },
      modal: {
         close: [],
         glance: [],
         tech: [],
         features: [],
         contributors: [],
         copy_link: [],
         link_copied: [],
         copy_failed: [],
      },
   },
   achievements: {
      subsections: { certifications: [], badges: [], competitions: [] },
      certifications: {
         active_count: ["count"],
         credential: ["name"],
         level: ["level"],
         expired: ["when"],
         expires: ["when"],
      },
      competitions: { podium: [], other: [], rank: [], place: [] },
   },
   stats: { subsections: { platforms: [] } },
   news: {
      filters: {
         all: [],
         group_label: [],
         show_all: ["count"],
         show_less: [],
      },
   },
   contact: {
      vcard: { label: [], hint: [] },
      form: {
         name: [],
         name_placeholder: [],
         email: [],
         email_placeholder: [],
         message: [],
         message_placeholder: [],
         send: [],
         send_label: [],
         sending_label: [],
         invalid_email: [],
         send_failed: [],
         send_timeout: [],
      },
      sent: { title: [], thanks: ["name"], again: [] },
   },
};
// Single fields beyond the heading: section -> field -> placeholders.
const SECTION_FIELDS = {
   services: { cta: [], cta_label: ["title"] },
   contact: { card_label: ["title", "value"] },
};
const SECTIONS_SOURCE = "src/constants/sections.ts";
const sectionIds = readSourceKeys(
   SECTIONS_SOURCE,
   /^[ \t]+\{ id: "([a-z-]+)",/gm,
);
const sectionEntries = requireKeyedEntries(
   sections,
   "sections",
   sectionIds,
   SECTIONS_SOURCE,
);
if (sectionEntries.map(([id]) => id).join() !== [...sectionIds].join()) {
   fail(
      "sections",
      `must list the sections in page order (${SECTIONS_SOURCE})`,
   );
}
for (const [id, copy] of sectionEntries) {
   const path = `sections.${id}`;
   if (!requireRecord(copy, path)) continue;
   requireString(copy.nav, `${path}.nav`);
   requireString(copy.title, `${path}.title`);
   requireString(copy.subtitle, `${path}.subtitle`);
   if (copy.blurb !== undefined) requireString(copy.blurb, `${path}.blurb`);
   for (const [group, fields] of Object.entries(SECTION_EXTRAS[id] ?? {})) {
      requireCopy(copy[group], `${path}.${group}`, fields);
   }
   for (const [field, allowed] of Object.entries(SECTION_FIELDS[id] ?? {})) {
      requireTemplate(copy[field], `${path}.${field}`, allowed);
   }
   requireOneAccent(copy.title, `${path}.title`);
}

// Labels keyed by ids that code registers: every id needs a label and every
// label needs an id.
const requireKeyedLabels = (record, path, ids, source) => {
   for (const [key, label] of requireKeyedEntries(record, path, ids, source)) {
      requireString(label, `${path}.${key}`);
   }
};
const PROJECT_FILTERS_SOURCE = "src/pages/projects/projectConstants.ts";
requireKeyedLabels(
   sections?.projects?.filters,
   "sections.projects.filters",
   readSourceKeys(PROJECT_FILTERS_SOURCE, /^[ \t]+"([A-Z][a-z]+)",$/gm),
   PROJECT_FILTERS_SOURCE,
);
const DEMO_REGISTRY = "src/pages/projects/demos/demoRegistry.ts";
requireKeyedLabels(
   sections?.projects?.modal?.demos,
   "sections.projects.modal.demos",
   readSourceKeys(DEMO_REGISTRY, /^[ \t]+(\d+): [A-Z]\w+,/gm),
   DEMO_REGISTRY,
);
// News type chips and row labels, one per type news.json may use.
for (const [type, copy] of requireKeyedEntries(
   sections?.news?.types,
   "sections.news.types",
   NEWS_TYPES,
   "the news types",
)) {
   requireCopy(copy, `sections.news.types.${type}`, { chip: [], label: [] });
}

// Site chrome copy (data/ui.json): field -> the placeholders it may use.
const UI_COPY = {
   new_tab: ["label"],
   profile_label: ["name"],
   skip_link: [],
   error: { title: [], body: [], refresh: [], refresh_label: [] },
   section: {
      loading: ["label"],
      unavailable: ["label"],
      unavailable_body: [],
      refresh: [],
   },
   nav: {
      label: [],
      home: [],
      top_label: [],
      navigate_label: ["label"],
      notes: [],
      notes_label: [],
      palette_label: [],
      palette_key: [],
      contact: [],
      more: [],
      menu_open: [],
      menu_close: [],
      menu_label: [],
      menu_dismiss: [],
   },
   hero: {
      projects_cta: [],
      cv_cta: [],
      pdf_cta: [],
      latest: [],
      latest_pr: ["repo", "number"],
      latest_project: ["title"],
      scroll: [],
      scroll_label: [],
   },
   footer: {
      copyright: ["year", "name"],
      disclaimer: [],
      site: [],
      site_label: [],
      social: [],
      social_label: [],
      download_cv: [],
      easter_egg: [],
      end_line: [],
      hold_copy: ["email"],
      copied: [],
      copy_failed: [],
      slide: [],
      slide_label: [],
      slide_sent: [],
      vitals: [],
      vitals_label: [],
      vitals_pending: [],
      vitals_pending_inp: [],
      visitor_gap: ["time", "gap"],
      gap_hours: ["count"],
      gap_minutes: ["count"],
      gap_ahead: ["span"],
      gap_behind: ["span"],
      built_with: [],
      build: [],
      machine_link_label: ["file", "label"],
      // One per file scripts/machine-view.js writes for the status bar.
      machine_links: { "index.md": [], "llms.txt": [], "rss.xml": [] },
   },
   motion: {
      modes: { full: [], reduced: [] },
      button: ["mode"],
      label: ["mode", "next"],
      title: ["mode", "next"],
   },
   back_to_top: [],
   toast_dismiss: [],
   case_study: {
      problem: [],
      built: [],
      decisions: [],
      outcome: [],
      inspect: [],
   },
   notes: {
      pin_label: ["index", "title"],
      close: [],
      previous: [],
      next: [],
      count_one: ["count"],
      count_many: ["count"],
      start: [],
      turn_off: [],
   },
   palette: {
      label: [],
      prompt: [],
      placeholder: [],
      close_key: [],
      empty: [],
      groups: {
         go: [],
         actions: [],
         under_the_hood: [],
         projects: [],
         elsewhere: [],
      },
      rows: {
         home: { keywords: [], command: [], hint: [] },
         section: { keywords: ["id", "label"], command: ["id"] },
         email: {
            keywords: ["email"],
            command: [],
            copied: [],
            failed: [],
         },
         cv: { keywords: [], command: [], hint: [] },
         booking: { keywords: [], command: [], hint: [] },
         motion: {
            keywords: [],
            command: ["mode"],
            hint_full: [],
            hint_reduced: [],
         },
         notes: {
            keywords: [],
            command: ["state"],
            hint_show: [],
            hint_hide: [],
         },
         llms: { keywords: [], command: [], hint: [] },
         markdown: { keywords: [], command: [], hint: [] },
         rss: { keywords: [], command: [], hint: [] },
         vcard: { keywords: [], command: [], hint: [] },
         project: { keywords: ["title"], command: ["slug"] },
         profile: { keywords: ["name"], command: ["slug"] },
      },
   },
   cv: {
      title: [],
      close: [],
      unavailable: [],
      download_instead: [],
      view_label: [],
      view_web: [],
      view_pages: [],
      pages_one: ["count"],
      pages_many: ["count"],
      loading: [],
      zoom_out: [],
      zoom_in: [],
      open_pdf: [],
      download: [],
      download_short: [],
      page_alt: ["page", "pages"],
      sheet_label: ["name"],
   },
};
requireCopy(ui, "ui", UI_COPY);
requireOneAccent(ui?.footer?.end_line, "ui.footer.end_line");

// Glossary (data/glossary.json): every surface form maps to one term.
if (requireArray(glossary, "glossary")) {
   requireUnique(glossary, "term", "glossary");
   const forms = new Set();
   for (const [index, entry] of glossary.entries()) {
      const path = `glossary[${index}]`;
      if (!requireRecord(entry, path)) continue;
      requireString(entry.definition, `${path}.definition`);
      requireStringArray(entry.match, `${path}.match`);
      if (!Array.isArray(entry.match)) continue;
      if (entry.match.length === 0) fail(`${path}.match`, "must not be empty");
      for (const form of entry.match) {
         if (forms.has(form)) {
            fail(`${path}.match`, `${JSON.stringify(form)} is already mapped`);
         }
         forms.add(form);
      }
   }
}

// "How it's built" notes (data/annotations.json), keyed by the pin ids in
// src/constants/annotations.ts.
const ANNOTATIONS_SOURCE = "src/constants/annotations.ts";
for (const [id, copy] of requireKeyedEntries(
   annotations,
   "annotations",
   readSourceKeys(ANNOTATIONS_SOURCE, /\bid: "([a-z-]+)"/g),
   ANNOTATIONS_SOURCE,
)) {
   if (!requireRecord(copy, `annotations.${id}`)) continue;
   requireString(copy.title, `annotations.${id}.title`);
   requireString(copy.body, `annotations.${id}.body`);
}

validateEntityArray(education, "education", [
   "date",
   "title",
   "institution",
   "location",
]);
if (Array.isArray(education)) {
   for (const [index, item] of education.entries()) {
      requireStringArray(item?.skills, `education[${index}].skills`);
      if (item?.achievements !== undefined) {
         requireStringArray(
            item.achievements,
            `education[${index}].achievements`,
         );
      }
   }
}

// Engagement scene keys, read from the registry so data and code cannot drift.
const SCENE_REGISTRY = "src/pages/experience/scenes/sceneRegistry.ts";
const sceneKeys = readSourceKeys(
   SCENE_REGISTRY,
   /^[ \t]+"([a-z-]+)":[ \t]*lazy\(/gm,
);

const checkScene = (value, path) => {
   if (value === undefined) return;
   if (!sceneKeys.has(value)) {
      fail(
         path,
         `unknown scene ${JSON.stringify(value)}; registered: ${[...sceneKeys].join(", ")}`,
      );
   }
};

if (requireRecord(experience, "experience")) {
   validateEntityArray(
      experience.professional_experience,
      "experience.professional_experience",
      ["date", "title", "company", "location", "summary"],
   );
   const professional = experience.professional_experience;
   if (Array.isArray(professional)) {
      const contributionTypes = new Set(["talk", "publication", "program"]);
      for (const [index, job] of professional.entries()) {
         const jobPath = `experience.professional_experience[${index}]`;
         checkScene(job.scene, `${jobPath}.scene`);
         if (
            job.projects !== undefined &&
            requireArray(job.projects, `${jobPath}.projects`)
         ) {
            for (const [projectIndex, project] of job.projects.entries()) {
               const projectPath = `${jobPath}.projects[${projectIndex}]`;
               requireString(project?.name, `${projectPath}.name`);
               requireStringRecord(
                  project?.description,
                  `${projectPath}.description`,
               );
               requireStringArray(project?.skills, `${projectPath}.skills`);
               if (project?.link)
                  requireUrl(project.link, `${projectPath}.link`);
               checkCaseStudy(project?.case_study, `${projectPath}.case_study`);
               checkScene(project?.scene, `${projectPath}.scene`);
            }
         }
         for (const field of [
            "internal_contributions",
            "internal_achievements",
         ]) {
            const entries = job[field];
            if (
               entries === undefined ||
               !requireArray(entries, `${jobPath}.${field}`)
            )
               continue;
            for (const [entryIndex, entry] of entries.entries()) {
               const entryPath = `${jobPath}.${field}[${entryIndex}]`;
               requireString(entry?.title, `${entryPath}.title`);
               if (!contributionTypes.has(entry?.type)) {
                  fail(
                     `${entryPath}.type`,
                     "must be talk, publication, or program",
                  );
               }
               if (
                  entry?.count !== undefined &&
                  !(Number.isInteger(entry.count) && entry.count > 0)
               ) {
                  fail(`${entryPath}.count`, "must be a positive integer");
               }
            }
         }
      }
   }

   const positions = experience.positions_of_responsibility;
   validateEntityArray(positions, "experience.positions_of_responsibility", [
      "date",
      "title",
      "company",
      "location",
      "summary",
   ]);
   if (Array.isArray(positions)) {
      for (const [index, position] of positions.entries()) {
         const path = `experience.positions_of_responsibility[${index}]`;
         requireStringRecord(position?.description, `${path}.description`);
         requireStringArray(position?.skills, `${path}.skills`);
      }
   }
}

const PRIMARY_SKILL_CATEGORIES = [
   "aws",
   "devops",
   "ai_ml",
   "ai_tools",
   "languages",
   "frontend",
   "backend",
   "tools_platforms",
];
const HERO_STACK_PATH = "skills.hero_stack";
const HERO_STACK_MIN = 10;
const HERO_STACK_MAX = 14;
// Top-level skills.json keys that are not skill categories.
const SKILLS_META_KEYS = new Set(["hero_stack", "categories"]);

if (requireRecord(skills, "skills")) {
   const categoryKeys = new Set();
   for (const [category, values] of Object.entries(skills)) {
      if (category === "categories") continue;
      requireStringArray(values, `skills.${category}`);
      if (!SKILLS_META_KEYS.has(category)) categoryKeys.add(category);
   }
   // Every category the site or the machine view renders needs a label.
   for (const [key, copy] of requireKeyedEntries(
      skills.categories,
      "skills.categories",
      categoryKeys,
      "the skill category arrays",
   )) {
      if (requireRecord(copy, `skills.categories.${key}`)) {
         requireString(copy.label, `skills.categories.${key}.label`);
      }
   }
   // hero_stack names the glyphs floating behind the hero. Each must be a
   // primary-category skill so the field never shows a name the Skills
   // section does not, and the list stays inside the slot budget.
   const heroStack = skills.hero_stack;
   if (heroStack !== undefined && requireArray(heroStack, HERO_STACK_PATH)) {
      if (
         heroStack.length < HERO_STACK_MIN ||
         heroStack.length > HERO_STACK_MAX
      ) {
         fail(
            HERO_STACK_PATH,
            `must list ${HERO_STACK_MIN} to ${HERO_STACK_MAX} skills`,
         );
      }
      const primarySkills = new Set(
         PRIMARY_SKILL_CATEGORIES.flatMap((category) =>
            Array.isArray(skills[category]) ? skills[category] : [],
         ),
      );
      const seen = new Set();
      for (const [index, name] of heroStack.entries()) {
         const path = `${HERO_STACK_PATH}[${index}]`;
         if (!primarySkills.has(name)) {
            fail(path, `${JSON.stringify(name)} is not a primary skill`);
         }
         if (seen.has(name)) fail(path, `duplicates ${JSON.stringify(name)}`);
         seen.add(name);
      }
   }
}

// Service keys pick the card's icon and canvas; read the registered ones from
// ServiceAnimation's map so a missing or unknown key fails here instead of
// silently dropping the art.
const SERVICE_ANIMATIONS = "src/pages/services/ServiceAnimation.tsx";
const serviceKeys = readSourceKeys(
   SERVICE_ANIMATIONS,
   /^[ \t]+"([a-z-]+)":[ \t]*\w+Anim,$/gm,
);

validateEntityArray(services, "services", ["key", "title"]);
if (Array.isArray(services)) {
   requireUnique(services, "key", "services");
   for (const [index, service] of services.entries()) {
      requireStringArray(service?.list, `services[${index}].list`);
      if (service?.key && !serviceKeys.has(service.key)) {
         fail(
            `services[${index}].key`,
            `unknown key ${JSON.stringify(service.key)}; registered: ${[...serviceKeys].join(", ")}`,
         );
      }
   }
}

const PROJECT_STATUSES = new Set(["active", "beta", "complete"]);
const SEMVER = /^\d+\.\d+\.\d+$/;

function checkStatus(project, path) {
   if (!PROJECT_STATUSES.has(project?.status)) {
      fail(`${path}.status`, "must be active, beta, or complete");
   }
   if (project?.version !== undefined && !SEMVER.test(project.version)) {
      fail(`${path}.version`, "must be a bare semver like 2.28.1");
   }
}

const projectCategories = [
   "featured_projects",
   "collaborative_projects",
   "other_projects",
   "community_projects",
];
const allProjects = [];
if (requireRecord(projects, "projects")) {
   for (const category of projectCategories) {
      const items = projects[category];
      if (!requireArray(items, `projects.${category}`)) continue;
      allProjects.push(...items);
      for (const [index, project] of items.entries()) {
         const path = `projects.${category}[${index}]`;
         for (const field of ["title", "description", "date", "github"]) {
            requireString(project?.[field], `${path}.${field}`);
         }
         requireStringArray(project?.tools_tech, `${path}.tools_tech`);
         requireStringArray(project?.features, `${path}.features`);
         requireUrl(project?.github, `${path}.github`);
         if (project?.live && project.live !== "#") {
            requireUrl(project.live, `${path}.live`);
         }
         checkCaseStudy(project?.case_study, `${path}.case_study`);
         checkStatus(project, path);
      }
   }
   requireUnique(allProjects, "id", "projects.all_categories");

   const spotlightId = projects.spotlight_project_id;
   if (
      spotlightId !== undefined &&
      spotlightId !== null &&
      (!Number.isInteger(spotlightId) ||
         !Array.isArray(projects.featured_projects) ||
         !projects.featured_projects.some(
            (project) => project?.id === spotlightId,
         ))
   ) {
      fail(
         "projects.spotlight_project_id",
         "must be null or the numeric id of a featured project",
      );
   }

   const contributions = projects.open_source_contributions;
   if (requireArray(contributions, "projects.open_source_contributions")) {
      requireUnique(contributions, "url", "projects.open_source_contributions");
      const statuses = new Set(["merged", "open", "closed"]);
      const starCountsByRepo = new Map();
      for (const [index, contribution] of contributions.entries()) {
         const path = `projects.open_source_contributions[${index}]`;
         requireString(contribution?.repo, `${path}.repo`);
         requireString(contribution?.title, `${path}.title`);
         requireUrl(contribution?.url, `${path}.url`);
         if (!statuses.has(contribution?.status)) {
            fail(`${path}.status`, "must be merged, open, or closed");
         }
         if (
            contribution?.status === "merged" &&
            contribution?.url?.includes("/pull/") &&
            !contribution?.merged_at
         ) {
            fail(`${path}.merged_at`, "is required for merged pull requests");
         }
         if (contribution?.merged_at) {
            requireIsoDate(contribution.merged_at, `${path}.merged_at`);
         }
         if (!Number.isInteger(contribution?.stars) || contribution.stars < 0) {
            fail(`${path}.stars`, "must be a non-negative integer");
         } else if (
            starCountsByRepo.has(contribution.repo) &&
            starCountsByRepo.get(contribution.repo) !== contribution.stars
         ) {
            fail(
               `${path}.stars`,
               `must match other ${contribution.repo} entries`,
            );
         } else {
            starCountsByRepo.set(contribution.repo, contribution.stars);
         }
      }
   }

   const discussions = projects.community_discussions;
   if (requireArray(discussions, "projects.community_discussions")) {
      requireUnique(discussions, "url", "projects.community_discussions");
      const statuses = new Set(["accepted", "helpful"]);
      for (const [index, discussion] of discussions.entries()) {
         const path = `projects.community_discussions[${index}]`;
         requireString(discussion?.repo, `${path}.repo`);
         requireString(discussion?.title, `${path}.title`);
         requireUrl(discussion?.url, `${path}.url`);
         if (!statuses.has(discussion?.status)) {
            fail(`${path}.status`, "must be accepted or helpful");
         }
      }
   }
}

// Highlights restate counts kept elsewhere in data/. derived_from names the
// count a value must equal, derived the way the profile README derives it,
// so the tile cannot drift from the entries behind it.
const HIGHLIGHT_COUNTS = {
   aws_samples: () =>
      String(
         allProjects.filter((p) => p?.organization === "aws-samples").length,
      ),
   tfc_ambassador: () => {
      const titles = (experience?.professional_experience ?? []).flatMap(
         (job) => (job?.internal_achievements ?? []).map((a) => a?.title),
      );
      const count = titles
         .map((title) => /^(\d+)x TFC Ambassador\b/.exec(title ?? "")?.[1])
         .find(Boolean);
      return count ? `${count}x` : "(no Nx TFC Ambassador entry)";
   },
   // Merged pull requests only, as the Stats open-source tile counts them.
   merged_prs: () =>
      String(
         (projects?.open_source_contributions ?? []).filter(
            (c) => c?.status === "merged" && c?.url?.includes("/pull/"),
         ).length,
      ),
};

const checkHighlight = (item, path) => {
   if (!requireRecord(item, path)) return;
   requireString(item.value, `${path}.value`);
   requireString(item.label, `${path}.label`);
   if (item.note !== undefined) requireString(item.note, `${path}.note`);
   if (item.derived_from === undefined) return;
   const derive = HIGHLIGHT_COUNTS[item.derived_from];
   if (!derive) {
      fail(
         `${path}.derived_from`,
         `must be one of ${Object.keys(HIGHLIGHT_COUNTS).join(", ")}`,
      );
   } else if (derive() !== item.value) {
      fail(`${path}.value`, `must equal the derived count ${derive()}`);
   }
};

if (personal && requireArray(personal.highlights, "personal.highlights")) {
   for (const [index, item] of personal.highlights.entries()) {
      checkHighlight(item, `personal.highlights[${index}]`);
   }
}

const isCount = (value) => Number.isInteger(value) && value >= 0;

// LeetCode chart data: exact solved counts and one [date, rating] pair per
// attended contest. The peak of the series is the rating the tiles show.
const checkSolvedSplit = (solved, path) => {
   if (solved === undefined || !requireRecord(solved, path)) return;
   for (const level of ["easy", "medium", "hard"]) {
      if (!isCount(solved[level])) fail(`${path}.${level}`, "must be a count");
   }
};

const isRatingPair = (pair) =>
   Array.isArray(pair) &&
   pair.length === 2 &&
   /^\d{4}-\d{2}-\d{2}$/.test(String(pair[0])) &&
   isCount(pair[1]);

const checkRatingHistory = (stats, path) => {
   const history = stats.rating_history;
   if (
      history === undefined ||
      !requireArray(history, `${path}.rating_history`)
   ) {
      return;
   }
   if (!history.every(isRatingPair)) {
      fail(`${path}.rating_history`, "must hold [YYYY-MM-DD, rating] pairs");
      return;
   }
   if (history.some(([date], i) => i > 0 && date < history[i - 1][0])) {
      fail(`${path}.rating_history`, "must be sorted oldest first");
   }
   const peak = Math.max(...history.map(([, rating]) => rating));
   if (history.length > 0 && String(peak) !== stats.best_rating) {
      fail(`${path}.best_rating`, `must equal the history peak ${peak}`);
   }
};

const checkLeetcodeSeries = (stats, path) => {
   checkSolvedSplit(stats.solved_by_difficulty, `${path}.solved_by_difficulty`);
   checkRatingHistory(stats, path);
};

// GitHub numbers from the weekly sync, as the profile README's card shows them.
const checkGithubStats = (stats, path) => {
   if (stats.fetched === undefined) return;
   requireIsoDate(stats.fetched, `${path}.fetched`);
   for (const field of ["contributions", "pull_requests", "longest_streak"]) {
      if (!isCount(stats[field])) fail(`${path}.${field}`, "must be a count");
   }
   if (!requireArray(stats.languages, `${path}.languages`)) return;
   for (const [index, language] of stats.languages.entries()) {
      requireString(language?.name, `${path}.languages[${index}].name`);
      const percent = language?.percent;
      if (typeof percent !== "number" || percent < 0 || percent > 100) {
         fail(`${path}.languages[${index}].percent`, "must be 0-100");
      }
   }
};

if (requireRecord(achievements, "achievements")) {
   const certifications = achievements.certifications;
   const badges = achievements.learning_badges;
   validateEntityArray(certifications, "achievements.certifications", [
      "name",
      "type",
      "issuer",
      "issueDate",
      "badgeId",
      "badgeUrl",
      "imageUrl",
   ]);
   validateEntityArray(badges, "achievements.learning_badges", [
      "name",
      "type",
      "issuer",
      "issueDate",
      "badgeId",
      "badgeUrl",
      "imageUrl",
   ]);
   const allBadges = [
      ...(Array.isArray(certifications) ? certifications : []),
      ...(Array.isArray(badges) ? badges : []),
   ];
   requireUnique(allBadges, "badgeId", "achievements.all_badges");
   for (const [index, badge] of allBadges.entries()) {
      const badgePath = `achievements.all_badges[${index}]`;
      requireIsoDate(badge.issueDate, `${badgePath}.issueDate`);
      if (badge.expiryDate) {
         requireIsoDate(badge.expiryDate, `${badgePath}.expiryDate`);
      }
      if (badge.level !== undefined) {
         requireString(badge.level, `${badgePath}.level`);
      }
      // Mirror the hosts src/__tests__/data-integrity.test.ts enforces so the
      // weekly Credly bot cannot commit data that the deploy gate rejects.
      requireUrlOnHost(
         badge.badgeUrl,
         `${badgePath}.badgeUrl`,
         "www.credly.com",
         "/badges/",
      );
      requireUrlOnHost(
         badge.imageUrl,
         `${badgePath}.imageUrl`,
         "images.credly.com",
      );
   }
   validateEntityArray(achievements.achievements, "achievements.achievements", [
      "title",
      "organizer",
      "date",
      "type",
   ]);
   if (
      requireRecord(
         achievements.coding_platform_stats,
         "achievements.coding_platform_stats",
      )
   ) {
      for (const [platform, stats] of Object.entries(
         achievements.coding_platform_stats,
      )) {
         requireString(
            stats?.username,
            `achievements.coding_platform_stats.${platform}.username`,
         );
         requireUrl(
            stats?.url,
            `achievements.coding_platform_stats.${platform}.url`,
         );
         // The cards and the machine view name a platform from its copy.
         if (!isNonEmptyString(personal?.stats?.platforms?.[platform]?.label)) {
            fail(
               `achievements.coding_platform_stats.${platform}`,
               `needs a name at personal.stats.platforms.${platform}.label`,
            );
         }
      }
      const { leetcode, github } = achievements.coding_platform_stats;
      if (isRecord(leetcode)) {
         checkLeetcodeSeries(
            leetcode,
            "achievements.coding_platform_stats.leetcode",
         );
      }
      if (isRecord(github)) {
         checkGithubStats(github, "achievements.coding_platform_stats.github");
      }
   }
}

if (requireRecord(contact, "contact")) {
   validateEntityArray(contact.contact_options, "contact.contact_options", [
      "icon",
      "title",
      "value",
      "link",
      "message",
   ]);
   if (Array.isArray(contact.contact_options)) {
      for (const [index, option] of contact.contact_options.entries()) {
         requireUrl(option.link, `contact.contact_options[${index}].link`, [
            "https:",
            "mailto:",
         ]);
      }
   }
   if (requireRecord(contact.email_config, "contact.email_config")) {
      for (const field of [
         "service_id",
         "template_id",
         "public_key",
         "validation_pattern",
      ]) {
         requireString(
            contact.email_config[field],
            `contact.email_config.${field}`,
         );
      }
      try {
         new RegExp(contact.email_config.validation_pattern);
      } catch {
         fail(
            "contact.email_config.validation_pattern",
            "must be a valid regular expression",
         );
      }
   }
}

try {
   const coverSource = readFileSync(
      resolve(ROOT, "src/pages/projects/covers/coverRegistry.ts"),
      "utf8",
   );
   const coverIds = [...coverSource.matchAll(/^[ \t]+(\d+):[ \t]*\{/gm)].map(
      (match) => Number(match[1]),
   );
   requireUnique(
      coverIds.map((id) => ({ id })),
      "id",
      "project covers",
   );
   const projectIds = new Set(allProjects.map((project) => project.id));
   const registeredIds = new Set(coverIds);
   for (const id of projectIds) {
      if (!registeredIds.has(id))
         fail("project covers", `missing project id ${id}`);
   }
   for (const id of registeredIds) {
      if (!projectIds.has(id))
         fail("project covers", `orphan project id ${id}`);
   }
} catch (error) {
   fail("project covers", error.message);
}

if (errors.length > 0) {
   console.error(`Data validation failed with ${errors.length} error(s):`);
   for (const error of errors) console.error(`- ${error}`);
   process.exit(1);
}

console.log(
   `Data validation passed: ${allProjects.length} projects, ${achievements.certifications.length} certifications, ${achievements.learning_badges.length} learning badges.`,
);
