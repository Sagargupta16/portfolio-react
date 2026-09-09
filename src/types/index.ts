import type { ComponentType } from "react";

// ===== Achievements =====
export interface Certification {
   id: number;
   name: string;
   type: string;
   issuer: string;
   issueDate: string;
   badgeId: string;
   badgeUrl: string;
   level?: string;
   expiryDate?: string;
   imageUrl: string;
}

export interface LearningBadge {
   id: number;
   name: string;
   type: string;
   issuer: string;
   issueDate: string;
   badgeId: string;
   badgeUrl: string;
   imageUrl: string;
   level?: string;
   expiryDate?: string;
}

export interface Achievement {
   id: number;
   title: string;
   organizer: string;
   date: string;
   type: string;
}

export interface CodingPlatformStat {
   username: string;
   url: string;
   problems_solved?: string;
   contests?: string;
   best_rating?: string;
   badge?: string;
   problem_solving?: string;
   cpp?: string;
}

export type CodingPlatformStats = Record<string, CodingPlatformStat>;

// ===== Contact =====
export interface ContactOption {
   id: number;
   icon: string;
   title: string;
   value: string;
   link: string;
   message: string;
}

export interface EmailConfig {
   service_id: string;
   template_id: string;
   public_key: string;
   validation_pattern: string;
}

// ===== Education =====
export interface Education {
   id: number;
   date: string;
   title: string;
   institution: string;
   department?: string;
   board?: string;
   field?: string;
   location: string;
   cgpa: string;
   achievements?: string[];
   skills: string[];
}

// ===== Experience =====
export interface ExperienceProject {
   name: string;
   date?: string;
   description: Record<string, string>;
   skills: string[];
   /** Public artifact of this work, when one exists (e.g. a published sample repo). */
   link?: string;
   /** Short label for the link, defaults to "Source" when omitted. */
   linkLabel?: string;
}

export interface InternalContribution {
   title: string;
   type: "talk" | "publication" | "program";
   year?: string;
}

export interface ProfessionalExperience {
   id: number;
   date: string;
   title: string;
   position: string;
   company: string;
   location: string;
   summary: string;
   projects?: ExperienceProject[];
   internal_contributions?: InternalContribution[];
   internal_achievements?: InternalContribution[];
}

export interface PositionOfResponsibility {
   id: number;
   date: string;
   title: string;
   position: string;
   company: string;
   location: string;
   summary: string;
   description: Record<string, string>;
   skills: string[];
}

// ===== Personal =====
export interface SocialProfile {
   id: number;
   name: string;
   link: string;
   icon: string;
}

export interface SiteConfig {
   tech_stack?: string[];
}

export interface ImpactStats {
   clients_served: string;
   clients_note: string;
   workloads_migrated: string;
   aws_accounts: string;
   security_controls: string;
}

// ===== Projects =====
export interface Project {
   id: number;
   title: string;
   description: string;
   date: string;
   tools_tech: string[];
   features: string[];
   github: string;
   live: string;
   team?: string;
   organization?: string;
   contributors?: string[];
}

export interface OpenSourceContribution {
   repo: string;
   /** Upstream repo star count at last sync -- drives the "stars reached" stat. */
   stars: number;
   title: string;
   url: string;
   status: "merged" | "open" | "closed";
   /** ISO date the PR merged -- drives the hero LATEST line. Absent on commit credits. */
   merged_at?: string;
   note?: string;
}

export interface CommunityDiscussion {
   repo: string;
   title: string;
   url: string;
   status: "accepted" | "helpful";
}

/** Editable project content and showcase settings in data/projects.json. */
export interface ProjectsFile {
   /** Featured project pinned above the date-sorted grid; null disables it. */
   spotlight_project_id?: number | null;
   featured_projects: Project[];
   collaborative_projects: Project[];
   other_projects: Project[];
   community_projects?: Project[];
   open_source_contributions?: OpenSourceContribution[];
   community_discussions?: CommunityDiscussion[];
}

// ===== Skills =====
export interface SkillsData {
   languages: string[];
   frontend: string[];
   backend: string[];
   cloud_devops: string[];
   ai_ml: string[];
   tools_platforms: string[];
   cs_fundamentals: string[];
   soft_skills: string[];
   areas_of_interest: string[];
}

/** data/skills.json: the category map plus the hero field's ranked picks. */
export interface SkillsFile extends SkillsData {
   /**
    * Ranked names for the floating field behind the hero: 10 to 14 entries,
    * each also listed in a primary category (validate-data.js enforces both).
    * Not a category, so it stays off SkillsData and out of the Skills section.
    */
   hero_stack?: string[];
}

// ===== Services =====
export interface Service {
   id: number;
   title: string;
   list: string[];
}

// ===== Icon Map =====
export type IconMap = Record<string, ComponentType<{ size?: number | string }>>;
