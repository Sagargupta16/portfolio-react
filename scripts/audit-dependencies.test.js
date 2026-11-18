import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { checkAudit } from "./audit-dependencies.js";

const known = {
   github_advisory_id: "GHSA-fc5q-39xc-vjpf",
   module_name: "picomatch",
   severity: "high",
   vulnerable_versions: "<=4.0.7",
   patched_versions: null,
   patched_versions_unpublished: true,
   findings: [{ version: "4.0.7" }],
};

const report = (...issues) => ({
   advisories: { ...issues },
   metadata: {
      vulnerabilities: {
         high: issues.filter((item) => item.severity === "high").length,
         critical: issues.filter((item) => item.severity === "critical").length,
      },
   },
});

beforeEach(() => vi.spyOn(console, "log").mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

it("accepts a clean audit or the one finding with a verified local patch", () => {
   const verify = vi.fn();
   checkAudit(report(), 0, verify);
   expect(verify).not.toHaveBeenCalled();
   checkAudit(report(known), 1, verify);
   expect(verify).toHaveBeenCalledOnce();
   expect(() =>
      checkAudit(report(known), 1, () => {
         throw new Error("Unpatched installation");
      }),
   ).toThrow("Unpatched installation");
});

it("blocks new findings, changed scope, mixed versions and available fixes", () => {
   const verify = vi.fn();
   const other = { ...known, github_advisory_id: "another-advisory" };
   for (const result of [
      report(other),
      report(known, other),
      report({ ...known, severity: "critical" }),
      report({ ...known, module_name: "another-package" }),
      report({ ...known, vulnerable_versions: "<=4.1.0" }),
      report({ ...known, findings: [...known.findings, { version: "4.0.6" }] }),
      report({ ...known, patched_versions: ">=4.0.8" }),
   ]) {
      expect(() => checkAudit(result, 1, verify)).toThrow();
   }
   expect(verify).not.toHaveBeenCalled();
});

it("rejects missing registry results and contradictory exit statuses", () => {
   expect(() =>
      checkAudit({ error: { message: "registry unavailable" } }, 1),
   ).toThrow();
   expect(() => checkAudit({ advisories: {}, metadata: {} }, 0)).toThrow();
   expect(() => checkAudit(report(), 1)).toThrow();
   expect(() => checkAudit(report(known), 0)).toThrow();
});
