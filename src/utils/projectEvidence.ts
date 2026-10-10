import type { Project } from "@/types";
import { hasProjectUrl } from "@utils/projectMetadata";

export type EvidenceKind = "aws" | "live" | "source";

export interface Evidence {
   kind: EvidenceKind;
   label: string;
}

const MAX_BADGES = 2;

/**
 * Proof badges for a project card, derived only from existing fields:
 * an aws-samples organization, a real live URL, or (when neither applies)
 * a public GitHub repo. At most two, in that order.
 */
export const getEvidence = (
   project: Pick<Project, "organization" | "live" | "github">,
): Evidence[] => {
   const isAws = project.organization === "aws-samples";
   const isLive = hasProjectUrl(project.live);
   const badges: Evidence[] = [];

   if (isAws) badges.push({ kind: "aws", label: "Published by AWS" });
   if (isLive) badges.push({ kind: "live", label: "Live" });
   if (!isAws && !isLive && hasProjectUrl(project.github)) {
      badges.push({ kind: "source", label: "Open source" });
   }

   return badges.slice(0, MAX_BADGES);
};
