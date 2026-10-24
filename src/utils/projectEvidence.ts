import type { Project, ProjectStatus } from "@/types";
import { getSectionCopy } from "@data/sections";
import { hasProjectUrl } from "@utils/projectMetadata";

const COPY = getSectionCopy("projects");

type EvidenceKind = "aws" | "live" | "source";

interface Evidence {
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

   if (isAws) badges.push({ kind: "aws", label: COPY.evidence.aws });
   if (isLive) badges.push({ kind: "live", label: COPY.evidence.live });
   if (!isAws && !isLive && hasProjectUrl(project.github)) {
      badges.push({ kind: "source", label: COPY.evidence.source });
   }

   return badges.slice(0, MAX_BADGES);
};

export const STATUS_LABEL: Record<ProjectStatus, string> = COPY.project_status;
