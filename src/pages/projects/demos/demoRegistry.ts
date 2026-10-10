import type { ComponentType } from "react";
import { lazy } from "react";

export interface ProjectDemoProps {
   accent: string;
   isMobile: boolean;
}

export interface ProjectDemo {
   /** Section label shown above the demo in the project modal. */
   label: string;
   Demo: ComponentType<ProjectDemoProps>;
}

// Lazy so each demo is its own chunk, fetched only when its modal opens.
const PipelineBeams = lazy(() => import("./PipelineBeams"));
const TerminalDemo = lazy(() => import("./TerminalDemo"));
const BlueGreenCompare = lazy(() => import("./BlueGreenCompare"));

/** Case-study demo per project id (ids from data/projects.json). */
const DEMO_BY_ID: Record<number, ProjectDemo> = {
   49: { label: "How it works", Demo: PipelineBeams }, // SageMaker MLOps
   52: { label: "How it runs", Demo: TerminalDemo }, // Organizations governance
   13: { label: "How the cutover works", Demo: BlueGreenCompare }, // Blue Green AWS Terraform
};

export const getProjectDemo = (id: number): ProjectDemo | undefined =>
   DEMO_BY_ID[id];
