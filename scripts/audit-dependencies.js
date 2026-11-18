import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, join } from "node:path";

const advisoryId = "GHSA-fc5q-39xc-vjpf";
const patchedVersion = "4.0.7";

function pnpm(args) {
   const cli = process.env.npm_execpath || "pnpm";
   const command = /\.[cm]?js$/i.test(cli) ? [process.execPath, cli] : [cli];
   const result = spawnSync(command[0], [...command.slice(1), ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
   });
   if (result.error) throw result.error;
   return result;
}

function verifyInstalledMatchers() {
   // The registry caps its dependency paths. Ask pnpm for every distinct
   // installation in the graph and exercise each actual package on disk.
   const list = pnpm([
      "list",
      "picomatch",
      "--depth",
      "Infinity",
      "--parseable",
   ]);
   assert.equal(list.status, 0, "Could not enumerate installed dependencies");
   const directories = list.stdout
      .split(/\r?\n/)
      .filter((directory) => basename(directory) === "picomatch");
   const require = createRequire(import.meta.url);
   let patched = 0;
   for (const directory of directories) {
      const { name, version } = JSON.parse(
         readFileSync(join(directory, "package.json"), "utf8"),
      );
      assert.equal(name, "picomatch");
      // A copy at another version carries no patch. checkAudit has already
      // failed if the advisory names one, so a newer copy here is unaffected.
      if (version !== patchedVersion) continue;
      patched += 1;
      const match = require(directory);
      for (const pattern of ["+(ab)", "*(ab)"]) {
         assert.throws(() => match(pattern), {
            name: "SyntaxError",
            message: "Repeated extglobs are disabled in this build",
         });
      }
      assert.ok(match("**/*.js")("scripts/check.js"));
   }
   assert.ok(patched, "Missing patched picomatch installation");
}

export function checkAudit(report, status, verify = verifyInstalledMatchers) {
   const counts = report.metadata?.vulnerabilities;
   assert.ok(
      !report.error &&
         report.advisories &&
         Number.isInteger(counts?.high) &&
         Number.isInteger(counts?.critical),
      `Invalid pnpm audit report: ${JSON.stringify(report.error ?? counts)}`,
   );
   const findings = Object.values(report.advisories).filter(
      ({ severity }) => severity === "high" || severity === "critical",
   );
   for (const issue of findings) {
      console.log(
         `${issue.severity}: ${issue.module_name} ${issue.github_advisory_id} (${issue.vulnerable_versions})`,
      );
   }
   if (status === 0 && !counts.high && !counts.critical && !findings.length) {
      console.log("No high or critical advisories.");
      return;
   }
   const [issue] = findings;
   assert.ok(
      status === 1 &&
         counts.high === 1 &&
         counts.critical === 0 &&
         findings.length === 1 &&
         issue.severity === "high" &&
         issue.github_advisory_id === advisoryId &&
         issue.module_name === "picomatch" &&
         issue.vulnerable_versions?.replaceAll(" ", "") ===
            `<=${patchedVersion}` &&
         issue.patched_versions === null &&
         issue.patched_versions_unpublished === true &&
         issue.findings?.length &&
         issue.findings.every(({ version }) => version === patchedVersion),
      "Dependency audit failed. Review the reported advisories and any published fixes.",
   );
   verify();
   console.log(
      `${advisoryId}: verified that every installed picomatch ${patchedVersion} rejects repeated extglobs.`,
   );
}

if (import.meta.main) {
   const audit = pnpm(["audit", "--audit-level=high", "--json"]);
   checkAudit(JSON.parse(audit.stdout), audit.status);
}
