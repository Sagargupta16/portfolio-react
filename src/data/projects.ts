import type {
   CommunityDiscussion,
   OpenSourceContribution,
   Project,
   ProjectsFile,
} from "@/types";
import projectsData from "../../data/projects.json";

const projects = projectsData as ProjectsFile;

export const getSpotlightProjectId = (): number | null =>
   projects.spotlight_project_id ?? null;
export const getFeaturedProjects = (): Project[] => projects.featured_projects;
export const getCollaborativeProjects = (): Project[] =>
   projects.collaborative_projects;
export const getOtherProjects = (): Project[] => projects.other_projects;
export const getCommunityProjects = (): Project[] =>
   projects.community_projects ?? [];
export const getOpenSourceContributions = (): OpenSourceContribution[] =>
   projects.open_source_contributions ?? [];
export const getCommunityDiscussions = (): CommunityDiscussion[] =>
   projects.community_discussions ?? [];
