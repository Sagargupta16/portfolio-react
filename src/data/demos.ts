import type {
   BlueGreenDemoCopy,
   PipelineDemoCopy,
   ProjectsFile,
   TerminalDemoCopy,
} from "@/types";
import projectsData from "../../data/projects.json";

const { demos } = projectsData as ProjectsFile;

/** Copy of the case-study demos in pages/projects/demos, keyed by the project
 *  ids in demoRegistry.ts. Layout, icons and animation timing stay in the
 *  components; only the words (and the numbers inside them) live in data. */
export const getPipelineDemoCopy = (): PipelineDemoCopy => demos["49"];
export const getTerminalDemoCopy = (): TerminalDemoCopy => demos["52"];
export const getBlueGreenDemoCopy = (): BlueGreenDemoCopy => demos["13"];
