#!/usr/bin/env node

/**
 * Fetches badges from Credly public API and updates achievements.json
 * with separated certifications and learning badges.
 *
 * Follows every page of the API. Refuses to write when the result has no
 * badges or fewer than achievements.json already lists, so a bad API answer
 * cannot wipe the section; set CREDLY_ALLOW_FEWER=1 when a badge really was
 * removed. The file is written in the repo's Prettier format, so it passes
 * `pnpm format:check` as is.
 *
 * Usage: node scripts/sync-credly.js
 *
 * Env: CREDLY_USERNAME (default: sagar-gupta.f8eb96cc), CREDLY_ALLOW_FEWER
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../data/achievements.json");
const CREDLY_USERNAME = process.env.CREDLY_USERNAME || "sagar-gupta.f8eb96cc";
const API_URL = `https://www.credly.com/users/${CREDLY_USERNAME}/badges.json`;
const ALLOW_FEWER = process.env.CREDLY_ALLOW_FEWER === "1";
// Credly serves 48 badges a page; this caps a next_page_url that never ends.
const MAX_PAGES = 20;

// Patterns that identify a full industry certification (not a learning badge)
const CERTIFICATION_PATTERNS = [
   /certified/i,
   /hashicorp certified/i,
   /terraform associate/i,
];

function isCertification(badgeOrName) {
   const badge = typeof badgeOrName === "string" ? null : badgeOrName;
   const name =
      typeof badgeOrName === "string"
         ? badgeOrName
         : badge?.badge_template?.name || "";
   const category = badge?.badge_template?.type_category || "";
   if (/certification/i.test(category)) return true;
   return CERTIFICATION_PATTERNS.some((pattern) => pattern.test(name));
}

// Credly's own level scale. It is authoritative whenever a template declares
// one; the issuer tier in the badge name is only a fallback for templates that
// leave the field empty or "N/A".
const CREDLY_LEVELS = ["Foundational", "Intermediate", "Advanced"];

function mapLevel(badge) {
   const declaredLevel = (badge.badge_template?.level || "")
      .trim()
      .toLowerCase();
   const credlyLevel = CREDLY_LEVELS.find(
      (level) => level.toLowerCase() === declaredLevel,
   );
   if (credlyLevel) return credlyLevel;

   const name = badge.badge_template?.name || "";
   if (/professional/i.test(name)) return "Professional";
   if (/associate/i.test(name)) return "Associate";
   if (/foundational|practitioner/i.test(name)) return "Foundational";
   return null;
}

function formatDate(dateStr) {
   if (!dateStr) return null;
   return dateStr.slice(0, 10); // "2025-07-07T00:00:00.000+00:00" -> "2025-07-07"
}

function getIssuerName(badge) {
   const entities =
      badge.issuer?.entities || badge.badge_template?.issuer?.entities || [];
   if (!Array.isArray(entities) || entities.length === 0) return "Unknown";
   const primary = entities.find((e) => e.primary) ?? entities[0];
   return primary?.entity?.name ?? "Unknown";
}

function getBadgeType(badge) {
   const name = badge.badge_template?.name || "";
   if (isCertification(badge)) return "Industry Certification";
   if (/knowledge/i.test(name)) return "Knowledge Badge";
   if (/partner/i.test(name)) return "Partner Badge";
   if (/proficient|well-architected/i.test(name)) return "Proficiency Badge";
   if (/educate/i.test(name)) return "Learning Badge";
   if (/intermediate|foundational.*l[12]\d{2}/i.test(name))
      return "Training Badge";
   return "Training Badge";
}

function transformBadge(badge, id) {
   // Credly badge names carry en/em dashes; house style forbids them
   const name = (badge.badge_template?.name || "").replace(/[–—]/g, "-");
   const type = getBadgeType(badge);
   const entry = {
      id,
      name,
      type,
      issuer: getIssuerName(badge),
      issueDate: formatDate(badge.issued_at_date || badge.issued_at),
      badgeId: badge.id,
      badgeUrl: `https://www.credly.com/badges/${badge.id}`,
   };

   const level = mapLevel(badge);
   if (level) entry.level = level;

   const expiry = formatDate(badge.expires_at_date || badge.expires_at);
   if (expiry) entry.expiryDate = expiry;

   const imageUrl =
      badge.image_url || badge.image?.url || badge.badge_template?.image?.url;
   if (imageUrl) entry.imageUrl = imageUrl;

   return entry;
}

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Retries by recursion so each attempt waits for the previous backoff.
async function fetchPage(url, attempt = 1) {
   try {
      const res = await fetch(url, {
         signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) {
         const json = await res.json();
         const badges = json.data || json;
         if (!Array.isArray(badges)) {
            throw new TypeError(
               "Credly response did not contain a badge array (shape changed?)",
            );
         }
         return { badges, metadata: json.metadata ?? {} };
      }
      const retriable = res.status >= 500 || res.status === 429;
      const msg = `Credly API returned ${res.status}: ${res.statusText}`;
      const error = new Error(msg);
      error.retriable = retriable;
      throw error;
   } catch (err) {
      if (err.retriable === false || attempt === MAX_RETRIES) throw err;
      console.warn(`  attempt ${attempt} error: ${err.message}, retrying…`);
      await sleep(INITIAL_BACKOFF_MS * 2 ** (attempt - 1));
      return fetchPage(url, attempt + 1);
   }
}

// Paginate with recursion so each page waits for the previous one. Only
// Credly's own next_page_url is followed.
async function fetchBadges(url = API_URL, found = [], page = 1) {
   const { badges, metadata } = await fetchPage(url);
   found.push(...badges);
   const next = metadata.next_page_url;
   if (!next) {
      const total = metadata.total_count;
      if (typeof total === "number" && found.length < total) {
         throw new Error(
            `Credly listed ${total} badges but sent ${found.length}`,
         );
      }
      return found;
   }
   if (page >= MAX_PAGES) throw new Error(`more than ${MAX_PAGES} pages`);
   const nextUrl = new URL(next);
   if (nextUrl.origin !== new URL(API_URL).origin) {
      throw new Error(`unexpected next_page_url host ${nextUrl.host}`);
   }
   return fetchBadges(nextUrl.href, found, page + 1);
}

// A short or empty answer (an API hiccup, a shape change) must never shrink
// the section; CREDLY_ALLOW_FEWER=1 accepts a real removal, never an empty list.
function assertNotFewer(next, existing) {
   const current =
      (existing.certifications?.length ?? 0) +
      (existing.learning_badges?.length ?? 0);
   if (next === 0) throw new Error("Credly gave 0 badges; refusing to write");
   if (next < current && !ALLOW_FEWER) {
      throw new Error(
         `Credly gave ${next} badges, achievements.json has ${current}; ` +
            "refusing to write (set CREDLY_ALLOW_FEWER=1 if a badge was removed)",
      );
   }
}

// Format like `pnpm format` so the written file passes format:check as is.
async function writeJson(path, data) {
   const options = await resolveConfig(path);
   const text = await format(JSON.stringify(data, null, 3), {
      ...options,
      filepath: path,
   });
   writeFileSync(path, text, "utf8");
}

async function main() {
   console.log("Fetching badges from Credly API…");
   const badges = await fetchBadges();
   console.log(`Fetched ${badges.length} badges from Credly`);

   // Separate certifications from learning badges
   const certifications = [];
   const learningBadges = [];
   let certId = 1;
   let badgeId = 1;

   // Sort by issue date descending (newest first)
   const sorted = [...badges].sort((a, b) => {
      const dateA = a.issued_at_date || a.issued_at || "";
      const dateB = b.issued_at_date || b.issued_at || "";
      return dateB.localeCompare(dateA);
   });

   for (const badge of sorted) {
      // Skip revoked badges
      if (badge.state === "revoked") continue;

      if (isCertification(badge)) {
         certifications.push(transformBadge(badge, certId++));
      } else {
         learningBadges.push(transformBadge(badge, badgeId++));
      }
   }

   console.log(`  Certifications: ${certifications.length}`);
   console.log(`  Learning badges: ${learningBadges.length}`);

   // Read existing data to preserve achievements and coding stats
   let existing = {};
   try {
      existing = JSON.parse(readFileSync(DATA_PATH, "utf8"));
   } catch {
      console.log("No existing achievements.json found, creating new one");
   }
   assertNotFewer(certifications.length + learningBadges.length, existing);

   const updated = {
      certifications,
      learning_badges: learningBadges,
      achievements: existing.achievements || [],
      coding_platform_stats: existing.coding_platform_stats || {},
   };

   await writeJson(DATA_PATH, updated);
   console.log(`Updated ${DATA_PATH}`);

   // Summary
   console.log("\n--- Certifications ---");
   for (const c of certifications) {
      console.log(`  ${c.name} (${c.issuer}) - ${c.issueDate}`);
   }
   console.log("\n--- Learning Badges ---");
   for (const b of learningBadges) {
      console.log(`  ${b.name} (${b.issuer}) - ${b.issueDate}`);
   }
}

try {
   await main();
} catch (err) {
   console.error("Failed to sync Credly badges:", err.message);
   process.exit(1);
}
