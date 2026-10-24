#!/usr/bin/env node

/**
 * Refreshes the parts of data/*.json that can be derived from live public APIs:
 *
 *   projects.json  open_source_contributions  status, merged_at, stars (GitHub REST)
 *   projects.json  community_discussions      "accepted" when the user's answer is accepted,
 *                                             plus newly accepted answers (GitHub GraphQL)
 *   projects.json  <group>[].version          active and beta projects: the higher of the
 *                                             latest release tag and the root manifest
 *                                             version, written only when it is higher
 *                                             than the stored one (GitHub REST); for a
 *                                             project whose live link is an npm package
 *                                             page, the registry's latest dist-tag (npm)
 *   achievements.json  coding_platform_stats.leetcode  solved, hard, contests, best rating,
 *                                             best rank, badge, top %, solved by difficulty,
 *                                             rating per attended contest (LeetCode GraphQL)
 *   achievements.json  coding_platform_stats.github    contributions, pull requests and longest
 *                                             streak over the last year, top languages
 *                                             (GitHub GraphQL)
 *
 * Writes only when something changed and prints a one-line summary per change.
 * A source that fails (rate limit, LeetCode blocking a CI IP) is skipped, never zeroed.
 * Written files are in the repo's Prettier format, so they pass `pnpm format:check`
 * without a separate formatting step.
 *
 * Usage: node scripts/sync-live-data.js
 * Env:   GITHUB_TOKEN (required for GraphQL), GITHUB_USER (default Sagargupta16),
 *        LEETCODE_USER (default sagargupta1610)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS_PATH = resolve(__dirname, "../data/projects.json");
const NEWS_PATH = resolve(__dirname, "../data/news.json");
const ACHIEVEMENTS_PATH = resolve(__dirname, "../data/achievements.json");
const GITHUB_USER = process.env.GITHUB_USER || "Sagargupta16";
const LEETCODE_USER = process.env.LEETCODE_USER || "sagargupta1610";
const TOKEN = process.env.GITHUB_TOKEN || "";
const ME = GITHUB_USER.toLowerCase();
// Own repos and the user's org: Q&A there is self-hosted, not community help.
const SKIP_DISCUSSION_OWNERS = new Set([ME, "mca-nitw"]);
const STAR_DRIFT = 0.05;
const LANGUAGE_DRIFT = 2; // percentage points

const changes = [];
const note = (msg) => changes.push(msg);
// API text is untrusted: drop control characters and cap the length before logging.
const isControl = (ch) => {
   const code = ch.codePointAt(0);
   return code < 0x20 || code === 0x7f;
};
const clean = (value) =>
   Array.from(String(value), (ch) => (isControl(ch) ? " " : ch))
      .join("")
      .slice(0, 300);
const warn = (what, err) =>
   console.warn(`skip ${clean(what)}: ${clean(err?.message ?? err)}`);

// Format like `pnpm format` so a written file passes format:check as is.
async function writeJson(path, data) {
   const options = await resolveConfig(path);
   const text = await format(JSON.stringify(data, null, 3), {
      ...options,
      filepath: path,
   });
   writeFileSync(path, text, "utf8");
}

const ghHeaders = {
   Accept: "application/vnd.github+json",
   "User-Agent": "portfolio-sync",
   ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

/** GET a JSON URL; a failed response throws an Error carrying its status. */
async function getJson(url, headers) {
   const res = await fetch(url, { headers });
   if (!res.ok) {
      const error = new Error(`GET ${url} -> ${res.status}`);
      error.status = res.status;
      throw error;
   }
   return res.json();
}

const ghRest = (path) => getJson(`https://api.github.com${path}`, ghHeaders);

async function ghGraphql(query, variables) {
   if (!TOKEN) throw new Error("GITHUB_TOKEN is required for GraphQL");
   const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...ghHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
   });
   const body = await res.json();
   if (!res.ok || body.errors) throw new Error(`GraphQL -> ${res.status}`);
   return body.data;
}

// ---------- open-source PRs ----------

function liveStatus(pr) {
   if (pr.merged_at) return "merged";
   return pr.state === "open" ? "open" : "closed";
}

// ---------- news (data/news.json, newest first) ----------

const news = JSON.parse(readFileSync(NEWS_PATH, "utf8"));

/** Add one item unless its link is already in the news; keeps newest-first by month. */
function addNews(item) {
   if (item.link && news.some((n) => n.link === item.link)) return;
   const at = news.findIndex(
      (n) => n.date.slice(0, 7) <= item.date.slice(0, 7),
   );
   news.splice(at === -1 ? news.length : at, 0, item);
   note(`news added: ${item.date} ${item.text.slice(0, 60)}`);
}

// Same tiers as the seeded history: docs PRs are minor, code into 20K+ star repos is major.
function prImpact(entry) {
   if (/\bdoc(s|ument)/i.test(entry.title)) return "minor";
   return (entry.stars ?? 0) >= 20000 ? "major" : undefined;
}

function prNews(entry) {
   const stars =
      entry.stars >= 1000 ? ` (${Math.round(entry.stars / 1000)}K stars)` : "";
   const impact = prImpact(entry);
   return {
      date: entry.merged_at,
      type: "oss",
      text: `Merged into ${entry.repo}${stars}: ${entry.title}`.slice(0, 159),
      link: entry.url,
      ...(impact ? { impact } : {}),
   };
}

function applyPrState(entry, live, ref) {
   const status = liveStatus(live);
   const newlyMerged = status === "merged" && entry.status !== "merged";
   if (status !== entry.status) note(`PR ${ref}: ${entry.status} -> ${status}`);
   entry.status = status;
   if (status !== "merged") return;
   if (newlyMerged)
      addNews(prNews({ ...entry, merged_at: live.merged_at.slice(0, 10) }));
   const mergedAt = live.merged_at.slice(0, 10);
   if (mergedAt !== entry.merged_at)
      note(`PR ${ref}: merged_at -> ${mergedAt}`);
   entry.merged_at = mergedAt;
}

/** Set one repo's live star count on all of its entries, or on none. */
function applyStars(entries, stars, repo) {
   const drift = (entry) =>
      Math.abs(stars - entry.stars) / Math.max(Number(entry.stars) || 1, 1);
   // Only move stars by more than 5% so routine drift does not make noisy PRs.
   const settled = entries.every(
      (entry) => typeof entry.stars === "number" && drift(entry) <= STAR_DRIFT,
   );
   if (settled) return;
   note(`stars ${repo}: ${entries[0].stars} -> ${stars}`);
   for (const entry of entries) entry.stars = stars;
}

async function syncPullRequests(prs) {
   const parsed = prs
      .map((entry) => ({
         entry,
         m: /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/.exec(entry.url || ""),
      }))
      .filter((x) => x.m);
   const repos = [...new Set(parsed.map(({ m }) => `${m[1]}/${m[2]}`))];

   const starsByRepo = new Map(
      await Promise.all(
         repos.map(async (repo) => {
            try {
               return [repo, (await ghRest(`/repos/${repo}`)).stargazers_count];
            } catch (err) {
               warn(`stars ${repo}`, err);
               return [repo, null];
            }
         }),
      ),
   );

   await Promise.all(
      parsed.map(async ({ entry, m }) => {
         const repo = `${m[1]}/${m[2]}`;
         try {
            const live = await ghRest(`/repos/${repo}/pulls/${m[3]}`);
            applyPrState(entry, live, `${repo}#${m[3]}`);
         } catch (err) {
            warn(`PR ${entry.url}`, err);
         }
      }),
   );

   // Stars belong to the repo, not the PR: set them per repo, so one failed
   // PR fetch cannot leave a repo's entries disagreeing (the validator
   // rejects that and the week's sync would be lost).
   for (const repo of repos) {
      const stars = starsByRepo.get(repo);
      const entries = parsed
         .filter(({ m }) => `${m[1]}/${m[2]}` === repo)
         .map(({ entry }) => entry);
      if (stars !== null) applyStars(entries, stars, repo);
   }
}

// ---------- discussions ----------

const DISCUSSION = `query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){
  discussion(number:$n){ answer { author { login } } } } }`;
const SEARCH = `query($q:String!,$c:String){ search(type:DISCUSSION, query:$q, first:50, after:$c){
  pageInfo { hasNextPage endCursor }
  nodes { ... on Discussion { number title url author { login } repository { nameWithOwner }
          answer { author { login } createdAt } } } } }`;

const discussionNumber = (url) =>
   Number(/discussions\/(\d+)/.exec(url || "")?.[1]);
const discussionKey = (repo, n) => `${repo.toLowerCase()}#${n}`;
const answeredByMe = (d) => d?.answer?.author?.login?.toLowerCase() === ME;

async function refreshKnownDiscussions(list) {
   await Promise.all(
      list.map(async (d) => {
         const [owner, repo] = d.repo.split("/");
         const n = discussionNumber(d.url);
         try {
            const data = await ghGraphql(DISCUSSION, { o: owner, r: repo, n });
            if (
               answeredByMe(data.repository?.discussion) &&
               d.status !== "accepted"
            ) {
               note(`discussion ${d.repo}#${n}: ${d.status} -> accepted`);
               d.status = "accepted";
            }
         } catch (err) {
            warn(`discussion ${d.url}`, err);
         }
      }),
   );
}

// Paginate with recursion so each page waits for the previous cursor.
async function searchCommented(cursor = null, found = []) {
   const { search } = await ghGraphql(SEARCH, {
      q: `commenter:${GITHUB_USER}`,
      c: cursor,
   });
   found.push(...search.nodes.filter((n) => n?.repository));
   return search.pageInfo.hasNextPage
      ? searchCommented(search.pageInfo.endCursor, found)
      : found;
}

function isNewAcceptedAnswer(node, known) {
   const repo = node.repository.nameWithOwner;
   const owner = repo.split("/")[0].toLowerCase();
   const selfAsked = node.author?.login?.toLowerCase() === ME;
   return (
      answeredByMe(node) &&
      !selfAsked &&
      !SKIP_DISCUSSION_OWNERS.has(owner) &&
      !known.has(discussionKey(repo, node.number))
   );
}

async function addNewAcceptedDiscussions(list) {
   const known = new Set(
      list.map((d) => discussionKey(d.repo, discussionNumber(d.url))),
   );
   let nodes;
   try {
      nodes = await searchCommented();
   } catch (err) {
      warn("discussion search", err);
      return;
   }
   for (const node of nodes.filter((n) => isNewAcceptedAnswer(n, known))) {
      const repo = node.repository.nameWithOwner;
      // Keep accepted answers grouped ahead of the "helpful" ones.
      const firstHelpful = list.findIndex((d) => d.status !== "accepted");
      list.splice(firstHelpful === -1 ? list.length : firstHelpful, 0, {
         repo,
         title: node.title,
         url: node.url,
         status: "accepted",
      });
      known.add(discussionKey(repo, node.number));
      addNews({
         date: node.answer.createdAt.slice(0, 10),
         type: "community",
         text: `Accepted answer on ${repo}: ${node.title}`.slice(0, 159),
         link: node.url,
         impact: "minor",
      });
      note(`discussion added: ${repo}#${node.number} (accepted)`);
   }
}

// ---------- LeetCode ----------

const LEETCODE = `query($u:String!){
  matchedUser(username:$u){ submitStatsGlobal { acSubmissionNum { difficulty count } } }
  userContestRanking(username:$u){ attendedContestsCount topPercentage badge { name } }
  userContestRankingHistory(username:$u){ attended rating ranking contest { startTime } } }`;

const floorTo = (n, step) => `${Math.floor(n / step) * step}+`;
// LeetCode's own profile page rounds to the nearest point (Math.round, so
// 2165.70 shows as 2166). The portfolio, the profile README card, the resume
// and FACTS.md all follow it; change them together if this ever changes.
const displayRating = (rating) => Math.round(rating);

function leetcodeFields(data, fallbackBadge) {
   const solved = Object.fromEntries(
      data.matchedUser.submitStatsGlobal.acSubmissionNum.map((x) => [
         x.difficulty,
         x.count,
      ]),
   );
   const ranking = data.userContestRanking;
   const attended = data.userContestRankingHistory.filter((x) => x.attended);
   if (!attended.length || !solved.All)
      throw new Error("empty profile response");
   // One [date, rating] pair per attended contest, oldest first: the day it
   // started and the rating after it. Pairs keep the stored series to one
   // line per contest; the chart is all it feeds.
   const history = attended.map((x) => [
      new Date(x.contest.startTime * 1000).toISOString().slice(0, 10),
      displayRating(x.rating),
   ]);
   return {
      problems_solved: floorTo(solved.All, 100),
      hard_solved: floorTo(solved.Hard, 10),
      contests: String(ranking.attendedContestsCount),
      best_rating: String(Math.max(...history.map(([, rating]) => rating))),
      best_contest_rank: String(Math.min(...attended.map((x) => x.ranking))),
      badge: ranking.badge?.name || fallbackBadge,
      top_percentage: `${ranking.topPercentage.toFixed(1)}%`,
      solved_by_difficulty: {
         easy: solved.Easy,
         medium: solved.Medium,
         hard: solved.Hard,
      },
      rating_history: history,
   };
}

/** Short form of a value for the change summary: arrays print their length. */
const describe = (value) =>
   Array.isArray(value) ? `${value.length} entries` : JSON.stringify(value);

/** Copy fields onto target, noting each one that actually changed. */
function applyFields(target, fields, label) {
   let changed = false;
   for (const [k, v] of Object.entries(fields)) {
      if (JSON.stringify(target[k]) === JSON.stringify(v)) continue;
      note(`${label} ${k}: ${describe(target[k])} -> ${describe(v)}`);
      target[k] = v;
      changed = true;
   }
   return changed;
}

async function syncLeetcode(lc) {
   try {
      const res = await fetch("https://leetcode.com/graphql", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Referer: "https://leetcode.com",
            "User-Agent": "portfolio-sync",
         },
         body: JSON.stringify({
            query: LEETCODE,
            variables: { u: LEETCODE_USER },
         }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { data } = await res.json();
      applyFields(lc, leetcodeFields(data, lc.badge), "leetcode");
   } catch (err) {
      warn("LeetCode", err);
   }
}

// ---------- GitHub profile stats ----------

// Computed the way the profile README's card computes them
// (community/github-stats-card-action, github_stats_card.py), so the two
// surfaces agree: languages by code size across the public, non-fork repos
// the user owns; contributions, PRs and streaks from the last year's
// contribution calendar.
const GH_REPOS = `repositories(ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,first:100,after:$c){
  pageInfo { hasNextPage endCursor }
  nodes { languages(first:10,orderBy:{field:SIZE,direction:DESC}){ edges { size node { name } } } } }`;
const GH_STATS = `query($u:String!,$c:String){ user(login:$u){ ${GH_REPOS}
  contributionsCollection { totalPullRequestContributions
    contributionCalendar { totalContributions weeks { contributionDays { contributionCount } } } } } }`;
const GH_REPO_PAGE = `query($u:String!,$c:String){ user(login:$u){ ${GH_REPOS} } }`;
const TOP_LANGUAGES = 6;

async function ownedRepos(page, found = []) {
   found.push(...page.nodes);
   if (!page.pageInfo.hasNextPage) return found;
   const { user } = await ghGraphql(GH_REPO_PAGE, {
      u: GITHUB_USER,
      c: page.pageInfo.endCursor,
   });
   return ownedRepos(user.repositories, found);
}

function longestStreak(days) {
   let longest = 0;
   let run = 0;
   for (const count of days) {
      run = count ? run + 1 : 0;
      longest = Math.max(longest, run);
   }
   return longest;
}

function topLanguages(repos) {
   const sizes = new Map();
   for (const repo of repos) {
      for (const { size, node } of repo.languages.edges) {
         sizes.set(node.name, (sizes.get(node.name) ?? 0) + size);
      }
   }
   const total = [...sizes.values()].reduce((a, b) => a + b, 0) || 1;
   return [...sizes]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_LANGUAGES)
      .map(([name, size]) => ({
         name,
         percent: Math.round((size * 1000) / total) / 10,
      }));
}

/** Relative move above STAR_DRIFT (5%), or no previous number at all. */
const drifted = (before, after) =>
   typeof before !== "number" ||
   Math.abs(after - before) / Math.max(before, 1) > STAR_DRIFT;

/** Top languages reordered, or any share moved by LANGUAGE_DRIFT points. */
const languagesMoved = (before = [], after = []) =>
   before.map((l) => l.name).join() !== after.map((l) => l.name).join() ||
   after.some(
      (l, i) =>
         Math.abs(l.percent - (before[i]?.percent ?? 0)) >= LANGUAGE_DRIFT,
   );

// Each stat has its own gate, and only a stat that crosses it is written:
// a streak move must not carry small contribution or PR moves along.
const GITHUB_GATES = {
   contributions: drifted,
   pull_requests: drifted,
   longest_streak: drifted,
   languages: languagesMoved,
};

const movedGithubStats = (gh, fields) =>
   Object.fromEntries(
      Object.entries(fields).filter(([k, v]) => GITHUB_GATES[k](gh[k], v)),
   );

async function syncGithubStats(gh) {
   try {
      const { user } = await ghGraphql(GH_STATS, { u: GITHUB_USER, c: null });
      const cc = user.contributionsCollection;
      const days = cc.contributionCalendar.weeks.flatMap((w) =>
         w.contributionDays.map((d) => d.contributionCount),
      );
      const fields = {
         contributions: cc.contributionCalendar.totalContributions,
         pull_requests: cc.totalPullRequestContributions,
         longest_streak: longestStreak(days),
         languages: topLanguages(await ownedRepos(user.repositories)),
      };
      // Contributions tick up daily; like stars, only a real move rewrites the
      // card, so most weeks open no PR. The date moves only with the numbers.
      if (applyFields(gh, movedGithubStats(gh, fields), "github")) {
         gh.fetched = new Date().toISOString().slice(0, 10);
      }
   } catch (err) {
      warn("GitHub stats", err);
   }
}

// ---------- project versions ----------

const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/i;
const parseVersion = (value) => {
   const m = SEMVER.exec(String(value ?? "").trim());
   return m ? m.slice(1).map(Number) : null;
};
const newer = (a, b) => {
   const i = a.findIndex((n, k) => n !== b[k]);
   return i !== -1 && a[i] > b[i];
};

// Root manifests that carry a version, checked in order; first hit wins.
const MANIFESTS = [
   ["package.json", (t) => JSON.parse(t).version],
   ["pyproject.toml", (t) => /^version\s*=\s*"([^"]+)"/m.exec(t)?.[1]],
   [
      ".claude-plugin/marketplace.json",
      (t) => {
         const d = JSON.parse(t);
         return d.metadata?.version ?? d.version;
      },
   ],
   [".claude-plugin/plugin.json", (t) => JSON.parse(t).version],
];

// Only a 404 means "not there". Any other failure (a 403 or 429 rate limit,
// a 5xx) throws, so the project is skipped this week instead of falling back
// to a lower version from the other source.
const unless404 = (err, fallback) => {
   if (err.status === 404) return fallback;
   throw err;
};

/** A repo file's base64 content, or undefined when the file does not exist. */
async function repoFile(repo, file) {
   try {
      return (await ghRest(`/repos/${repo}/contents/${file}`)).content;
   } catch (err) {
      return unless404(err, undefined);
   }
}

/** The version a manifest declares, or null (0.0.0 and unparsable count as none). */
function manifestField(read, content) {
   try {
      const v = parseVersion(read(Buffer.from(content, "base64").toString()));
      return v?.some((n) => n > 0) ? v : null;
   } catch {
      return null;
   }
}

// Recursion keeps the lookups in order: the first manifest with a version wins.
async function manifestVersion(repo, index = 0) {
   if (index === MANIFESTS.length) return null;
   const [file, read] = MANIFESTS[index];
   const content = await repoFile(repo, file);
   const v = content === undefined ? null : manifestField(read, content);
   return v ?? manifestVersion(repo, index + 1);
}

async function releaseVersion(repo) {
   try {
      return parseVersion(
         (await ghRest(`/repos/${repo}/releases/latest`)).tag_name,
      );
   } catch (err) {
      return unless404(err, null);
   }
}

// An npm package page names the package, scoped ("@scope/name") or not.
const NPM_PAGE =
   /^https:\/\/(?:www\.)?npmjs\.com\/package\/((?:@[\w.-]+\/)?[\w.-]+)\/?$/;

async function npmVersion(name) {
   const tags = await getJson(
      `https://registry.npmjs.org/-/package/${encodeURIComponent(name)}/dist-tags`,
      { Accept: "application/json", "User-Agent": "portfolio-sync" },
   );
   return parseVersion(tags.latest);
}

// A release tag can lag the manifest (or not exist), so take the higher one.
async function latestVersion(repo) {
   const [release, manifest] = await Promise.all([
      releaseVersion(repo),
      manifestVersion(repo),
   ]);
   if (!release || !manifest) return release ?? manifest;
   return newer(release, manifest) ? release : manifest;
}

// A card whose live link is an npm page shows what that link installs: the
// registry's latest dist-tag is authoritative and may move the version down.
// Every other card takes the GitHub version, and only when it is higher, so a
// failed lookup that lands on an older tag can never downgrade it.
async function syncProjectVersion(project) {
   const npm = NPM_PAGE.exec(project.live ?? "")?.[1];
   const v = npm
      ? await npmVersion(npm)
      : await latestVersion(project.github.replace("https://github.com/", ""));
   const version = v?.join(".");
   if (!version || version === project.version) return;
   const stored = parseVersion(project.version);
   if (!npm && stored && !newer(v, stored)) return;
   note(`${project.title} version ${project.version ?? "none"} -> ${version}`);
   project.version = version;
}

async function syncProjectVersions(list) {
   const shipping = list.filter(
      (p) =>
         p.status !== "complete" &&
         (NPM_PAGE.test(p.live ?? "") ||
            p.github?.startsWith("https://github.com/")),
   );
   await Promise.all(
      shipping.map((project) =>
         syncProjectVersion(project).catch((err) =>
            warn(`${project.title} version`, err),
         ),
      ),
   );
}

// ---------- main ----------

const projects = JSON.parse(readFileSync(PROJECTS_PATH, "utf8"));
const achievements = JSON.parse(readFileSync(ACHIEVEMENTS_PATH, "utf8"));
const before = JSON.stringify([projects, achievements, news]);

await syncPullRequests(projects.open_source_contributions || []);
await refreshKnownDiscussions(projects.community_discussions || []);
await addNewAcceptedDiscussions(projects.community_discussions || []);
await syncProjectVersions(
   [
      "featured_projects",
      "collaborative_projects",
      "other_projects",
      "community_projects",
   ].flatMap((group) => projects[group] || []),
);
if (achievements.coding_platform_stats?.leetcode) {
   await syncLeetcode(achievements.coding_platform_stats.leetcode);
}
if (achievements.coding_platform_stats?.github) {
   await syncGithubStats(achievements.coding_platform_stats.github);
}

if (JSON.stringify([projects, achievements, news]) === before) {
   console.log("No changes.");
} else {
   await writeJson(NEWS_PATH, news);
   await writeJson(PROJECTS_PATH, projects);
   await writeJson(ACHIEVEMENTS_PATH, achievements);
   console.log(
      `${changes.length} change(s):\n- ${changes.map(clean).join("\n- ")}`,
   );
}
