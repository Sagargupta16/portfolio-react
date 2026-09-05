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

const requireIsoDate = (value, path) => {
   if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
      fail(path, "must use YYYY-MM-DD format");
   }
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

if (requireRecord(personal, "data/personal.json")) {
   for (const field of [
      "name",
      "title",
      "location",
      "intro",
      "role_label",
      "headline",
      "availability",
   ]) {
      requireString(personal[field], `personal.${field}`);
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
      for (const field of [
         "clients_served",
         "clients_note",
         "workloads_migrated",
         "aws_accounts",
         "security_controls",
      ]) {
         requireString(personal.impact[field], `personal.impact.${field}`);
      }
   }
   if (requireRecord(personal.site, "personal.site")) {
      requireStringArray(personal.site.tech_stack, "personal.site.tech_stack");
   }
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

if (requireRecord(skills, "skills")) {
   for (const [category, values] of Object.entries(skills)) {
      requireStringArray(values, `skills.${category}`);
   }
}

validateEntityArray(services, "services", ["title"]);
if (Array.isArray(services)) {
   for (const [index, service] of services.entries()) {
      requireStringArray(service?.list, `services[${index}].list`);
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
      }
   }
   requireUnique(allProjects, "id", "projects.all_categories");

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
      "level",
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
      requireIsoDate(
         badge.issueDate,
         `achievements.all_badges[${index}].issueDate`,
      );
      if (badge.expiryDate) {
         requireIsoDate(
            badge.expiryDate,
            `achievements.all_badges[${index}].expiryDate`,
         );
      }
      requireUrl(badge.badgeUrl, `achievements.all_badges[${index}].badgeUrl`);
      requireUrl(badge.imageUrl, `achievements.all_badges[${index}].imageUrl`);
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
      resolve(ROOT, "src/pages/portfolio/covers/coverRegistry.ts"),
      "utf8",
   );
   const coverIds = [...coverSource.matchAll(/^\s+(\d+):\s*\{/gm)].map(
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
