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
// Own repos and the user's org: Q&A there is self-hosted, not community help.
const SKIP_DISCUSSION_OWNERS = new Set([GITHUB_USER.toLowerCase(), "mca-nitw"]);

const changes = [];
const note = (msg) => changes.push(msg);

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
   if (!res.ok || body.errors)
      throw new Error(
         `GraphQL -> ${res.status} ${JSON.stringify(body.errors ?? "")}`,
      );
   return body.data;
}

// ---------- open-source PRs ----------

async function syncPullRequests(prs) {
   const stars = new Map();
   for (const pr of prs) {
      const m = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/.exec(pr.url || "");
      if (!m) continue;
      const [, owner, repo, number] = m;
      try {
         const live = await ghRest(`/repos/${owner}/${repo}/pulls/${number}`);
         const status = live.merged_at
            ? "merged"
            : live.state === "open"
              ? "open"
              : "closed";
         const mergedAt = live.merged_at
            ? live.merged_at.slice(0, 10)
            : pr.merged_at;
         if (status !== pr.status)
            note(`PR ${owner}/${repo}#${number}: ${pr.status} -> ${status}`);
         if (status === "merged" && mergedAt !== pr.merged_at)
            note(`PR ${owner}/${repo}#${number}: merged_at -> ${mergedAt}`);
         pr.status = status;
         if (status === "merged") pr.merged_at = mergedAt;

         const key = `${owner}/${repo}`.toLowerCase();
         if (!stars.has(key))
            stars.set(
               key,
               (await ghRest(`/repos/${owner}/${repo}`)).stargazers_count,
            );
         const s = stars.get(key);
         // Only move stars by more than 5% so routine drift does not make noisy PRs.
         if (
            typeof pr.stars !== "number" ||
            Math.abs(s - pr.stars) / Math.max(pr.stars, 1) > 0.05
         ) {
            note(`stars ${owner}/${repo}: ${pr.stars} -> ${s}`);
            pr.stars = s;
         }
      } catch (err) {
         console.warn(`skip PR ${pr.url}: ${err.message}`);
      }
   }
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

async function syncDiscussions(list) {
   const me = GITHUB_USER.toLowerCase();
   const known = new Map(
      list.map((d) => [discussionKey(d.repo, discussionNumber(d.url)), d]),
   );

   for (const d of list) {
      const [owner, repo] = d.repo.split("/");
      try {
         const data = await ghGraphql(DISCUSSION, {
            o: owner,
            r: repo,
            n: discussionNumber(d.url),
         });
         const answeredByMe =
            data.repository?.discussion?.answer?.author?.login?.toLowerCase() ===
            me;
         if (answeredByMe && d.status !== "accepted") {
            note(
               `discussion ${d.repo}#${discussionNumber(d.url)}: ${d.status} -> accepted`,
            );
            d.status = "accepted";
         }
      } catch (err) {
         console.warn(`skip discussion ${d.url}: ${err.message}`);
      }
   }

   try {
      let cursor = null;
      do {
         const { search } = await ghGraphql(SEARCH, {
            q: `commenter:${GITHUB_USER}`,
            c: cursor,
         });
         for (const n of search.nodes) {
            if (!n?.repository) continue;
            const repo = n.repository.nameWithOwner;
            const owner = repo.split("/")[0].toLowerCase();
            const accepted = n.answer?.author?.login?.toLowerCase() === me;
            const selfAsked = n.author?.login?.toLowerCase() === me;
            if (!accepted || selfAsked || SKIP_DISCUSSION_OWNERS.has(owner))
               continue;
            if (known.has(discussionKey(repo, n.number))) continue;
            const entry = {
               repo,
               title: n.title,
               url: n.url,
               status: "accepted",
            };
            // Keep accepted answers grouped ahead of the "helpful" ones.
            const firstHelpful = list.findIndex((d) => d.status !== "accepted");
            list.splice(
               firstHelpful === -1 ? list.length : firstHelpful,
               0,
               entry,
            );
            known.set(discussionKey(repo, n.number), entry);
            note(`discussion added: ${repo}#${n.number} (accepted)`);
         }
         cursor = search.pageInfo.hasNextPage
            ? search.pageInfo.endCursor
            : null;
      } while (cursor);
   } catch (err) {
      console.warn(`skip discussion search: ${err.message}`);
   }
}

// ---------- LeetCode ----------

const LEETCODE = `query($u:String!){
  matchedUser(username:$u){ submitStatsGlobal { acSubmissionNum { difficulty count } } }
  userContestRanking(username:$u){ attendedContestsCount topPercentage badge { name } }
  userContestRankingHistory(username:$u){ attended rating ranking } }`;

const floorTo = (n, step) => `${Math.floor(n / step) * step}+`;

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
      const next = {
         problems_solved: floorTo(solved.All, 100),
         hard_solved: floorTo(solved.Hard, 10),
         contests: String(ranking.attendedContestsCount),
         // LeetCode displays rating rounded down; keep the same convention.
         best_rating: String(
            Math.floor(Math.max(...attended.map((x) => x.rating))),
         ),
         best_contest_rank: String(Math.min(...attended.map((x) => x.ranking))),
         badge: ranking.badge?.name || lc.badge,
         top_percentage: `${ranking.topPercentage.toFixed(1)}%`,
      };
      for (const [k, v] of Object.entries(next)) {
         if (lc[k] !== v) {
            note(`leetcode ${k}: ${lc[k]} -> ${v}`);
            lc[k] = v;
         }
      }
   } catch (err) {
      console.warn(`skip LeetCode: ${err.message}`);
   }
}

// ---------- main ----------

const projects = JSON.parse(readFileSync(PROJECTS_PATH, "utf8"));
const achievements = JSON.parse(readFileSync(ACHIEVEMENTS_PATH, "utf8"));
const before = JSON.stringify([projects, achievements]);

await syncPullRequests(projects.open_source_contributions || []);
await syncDiscussions(projects.community_discussions || []);
if (achievements.coding_platform_stats?.leetcode)
   await syncLeetcode(achievements.coding_platform_stats.leetcode);

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
   console.log(`${changes.length} change(s):\n- ${changes.join("\n- ")}`);
}
