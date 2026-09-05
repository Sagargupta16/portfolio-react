import type {
   CommunityDiscussion,
   OpenSourceContribution,
   Project,
} from "@/types";
import projectsData from "../../data/projects.json";

export const getFeaturedProjects = (): Project[] =>
   projectsData.featured_projects as Project[];
export const getCollaborativeProjects = (): Project[] =>
   projectsData.collaborative_projects as Project[];
export const getOtherProjects = (): Project[] =>
   projectsData.other_projects as Project[];
export const getCommunityProjects = (): Project[] =>
   (projectsData.community_projects ?? []) as Project[];
export const getOpenSourceContributions = (): OpenSourceContribution[] =>
   (projectsData.open_source_contributions ?? []) as OpenSourceContribution[];
export const getCommunityDiscussions = (): CommunityDiscussion[] =>
   (projectsData.community_discussions ?? []) as CommunityDiscussion[];
