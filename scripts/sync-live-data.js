#!/usr/bin/env node

/**
 * Refreshes the parts of data/*.json that can be derived from live public APIs:
 *
 *   projects.json  open_source_contributions  status, merged_at, stars (GitHub REST)
 *   projects.json  community_discussions      "accepted" when the user's answer is accepted,
 *                                             plus newly accepted answers (GitHub GraphQL)
 *   achievements.json  coding_platform_stats.leetcode  solved, hard, contests, best rating,
 *                                             best rank, badge, top % (LeetCode GraphQL)
 *
 * Writes only when something changed and prints a one-line summary per change.
 * A source that fails (rate limit, LeetCode blocking a CI IP) is skipped, never zeroed.
 *
 * Usage: node scripts/sync-live-data.js
 * Env:   GITHUB_TOKEN (required for GraphQL), GITHUB_USER (default Sagargupta16),
 *        LEETCODE_USER (default sagargupta1610)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS_PATH = resolve(__dirname, "../data/projects.json");
const ACHIEVEMENTS_PATH = resolve(__dirname, "../data/achievements.json");
const GITHUB_USER = process.env.GITHUB_USER || "Sagargupta16";
const LEETCODE_USER = process.env.LEETCODE_USER || "sagargupta1610";
const TOKEN = process.env.GITHUB_TOKEN || "";
const ME = GITHUB_USER.toLowerCase();
// Own repos and the user's org: Q&A there is self-hosted, not community help.
const SKIP_DISCUSSION_OWNERS = new Set([ME, "mca-nitw"]);
const STAR_DRIFT = 0.05;

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

const ghHeaders = {
   Accept: "application/vnd.github+json",
   "User-Agent": "portfolio-sync",
   ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function ghRest(path) {
   const res = await fetch(`https://api.github.com${path}`, {
      headers: ghHeaders,
   });
   if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
   return res.json();
}

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

function applyPrState(entry, live, ref) {
   const status = liveStatus(live);
   if (status !== entry.status) note(`PR ${ref}: ${entry.status} -> ${status}`);
   entry.status = status;
   if (status !== "merged") return;
   const mergedAt = live.merged_at.slice(0, 10);
   if (mergedAt !== entry.merged_at)
      note(`PR ${ref}: merged_at -> ${mergedAt}`);
   entry.merged_at = mergedAt;
}

function applyStars(entry, stars, repo) {
   const drift =
      Math.abs(stars - entry.stars) / Math.max(Number(entry.stars) || 1, 1);
   // Only move stars by more than 5% so routine drift does not make noisy PRs.
   if (typeof entry.stars === "number" && drift <= STAR_DRIFT) return;
   note(`stars ${repo}: ${entry.stars} -> ${stars}`);
   entry.stars = stars;
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
            const stars = starsByRepo.get(repo);
            if (stars !== null) applyStars(entry, stars, repo);
         } catch (err) {
            warn(`PR ${entry.url}`, err);
         }
      }),
   );
}

// ---------- discussions ----------

const DISCUSSION = `query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){
  discussion(number:$n){ answer { author { login } } } } }`;
const SEARCH = `query($q:String!,$c:String){ search(type:DISCUSSION, query:$q, first:50, after:$c){
  pageInfo { hasNextPage endCursor }
  nodes { ... on Discussion { number title url author { login } repository { nameWithOwner }
          answer { author { login } } } } } }`;

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
      note(`discussion added: ${repo}#${node.number} (accepted)`);
   }
}

// ---------- LeetCode ----------

const LEETCODE = `query($u:String!){
  matchedUser(username:$u){ submitStatsGlobal { acSubmissionNum { difficulty count } } }
  userContestRanking(username:$u){ attendedContestsCount topPercentage badge { name } }
  userContestRankingHistory(username:$u){ attended rating ranking } }`;

const floorTo = (n, step) => `${Math.floor(n / step) * step}+`;

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
   return {
      problems_solved: floorTo(solved.All, 100),
      hard_solved: floorTo(solved.Hard, 10),
      contests: String(ranking.attendedContestsCount),
      // LeetCode displays rating rounded down; keep the same convention.
      best_rating: String(
         Math.floor(Math.max(...attended.map((x) => x.rating))),
      ),
      best_contest_rank: String(Math.min(...attended.map((x) => x.ranking))),
      badge: ranking.badge?.name || fallbackBadge,
      top_percentage: `${ranking.topPercentage.toFixed(1)}%`,
   };
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
      for (const [k, v] of Object.entries(leetcodeFields(data, lc.badge))) {
         if (lc[k] === v) continue;
         note(`leetcode ${k}: ${lc[k]} -> ${v}`);
         lc[k] = v;
      }
   } catch (err) {
      warn("LeetCode", err);
   }
}

// ---------- main ----------

const projects = JSON.parse(readFileSync(PROJECTS_PATH, "utf8"));
const achievements = JSON.parse(readFileSync(ACHIEVEMENTS_PATH, "utf8"));
const before = JSON.stringify([projects, achievements]);

await syncPullRequests(projects.open_source_contributions || []);
await refreshKnownDiscussions(projects.community_discussions || []);
await addNewAcceptedDiscussions(projects.community_discussions || []);
if (achievements.coding_platform_stats?.leetcode) {
   await syncLeetcode(achievements.coding_platform_stats.leetcode);
}

if (JSON.stringify([projects, achievements]) === before) {
   console.log("No changes.");
} else {
   writeFileSync(
      PROJECTS_PATH,
      JSON.stringify(projects, null, 3) + "\n",
      "utf8",
   );
   writeFileSync(
      ACHIEVEMENTS_PATH,
      JSON.stringify(achievements, null, 3) + "\n",
      "utf8",
   );
   console.log(
      `${changes.length} change(s):\n- ${changes.map(clean).join("\n- ")}`,
   );
}
