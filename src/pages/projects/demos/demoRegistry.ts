import type { ComponentType } from "react";
import { lazy } from "react";
import { getSectionCopy } from "@data/sections";

export interface ProjectDemoProps {
   accent: string;
   isMobile: boolean;
}

interface ProjectDemo {
   /** Section label shown above the demo in the project modal. */
   label: string;
   Demo: ComponentType<ProjectDemoProps>;
}

// Lazy so each demo is its own chunk, fetched only when its modal opens.
const PipelineBeams = lazy(() => import("./PipelineBeams"));
const TerminalDemo = lazy(() => import("./TerminalDemo"));
const BlueGreenCompare = lazy(() => import("./BlueGreenCompare"));

/** Case-study demo per project id (ids from data/projects.json). Each label
 *  is projects.modal.demos in data/sections.json, keyed by the same id;
 *  validate-data.js reads the ids below and checks the two match. */
const DEMO_BY_ID: Record<number, ComponentType<ProjectDemoProps>> = {
   49: PipelineBeams, // SageMaker MLOps
   52: TerminalDemo, // Organizations governance
   13: BlueGreenCompare, // Blue Green AWS Terraform
};

const DEMO_LABELS = getSectionCopy("projects").modal.demos;

export const getProjectDemo = (id: number): ProjectDemo | undefined => {
   const Demo = DEMO_BY_ID[id];
   return Demo && { label: DEMO_LABELS[id], Demo };
};
