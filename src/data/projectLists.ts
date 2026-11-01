import type { Project, ProjectsFile } from "@/types";

/** Every project list in a projects file, in the order the Projects section
 *  breaks date ties for "All" (Featured, Community, Collab, Others). A list
 *  added to projects.json joins here once and every caller sees it. No data
 *  import here: the build-time hero plugin (heroLatestPlugin.js) loads this
 *  from vite.config.js. */
export const listProjects = (file: ProjectsFile): Project[] => [
   ...file.featured_projects,
   ...(file.community_projects ?? []),
   ...file.collaborative_projects,
   ...file.other_projects,
];
