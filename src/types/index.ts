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
   level: string;
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

export type CodingPlatformStats = Record<string, unknown>;

export interface AchievementsData {
   certifications: Certification[];
   learning_badges: LearningBadge[];
   achievements: Achievement[];
   coding_platform_stats: CodingPlatformStats;
}

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

export interface ContactData {
   contact_options: ContactOption[];
   email_config: EmailConfig;
}

// ===== Education =====
export interface Education {
   id: number;
   date: string;
   title: string;
   institution: string;
   institutionType: string;
   department?: string;
   alsoKnownAs?: string;
   board?: string;
   field?: string;
   location: string;
   cgpa: string;
   percentage: string;
   display_text: string;
   achievements?: string[];
   skills: string[];
}

// ===== Experience =====
export interface ExperienceProject {
   name: string;
   date?: string;
   description: Record<string, string>;
   skills: string[];
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
   project?: string;
   description?: Record<string, string>;
   skills: string[];
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

export interface ExperienceData {
   professional_experience: ProfessionalExperience[];
   positions_of_responsibility: PositionOfResponsibility[];
}

// ===== Personal =====
export interface SocialProfile {
   id: number;
   name: string;
   link: string;
   icon: string;
}

export interface SiteConfig {
   counter_namespace?: string;
   tech_stack?: string[];
}

export interface PersonalData {
   name: string;
   title: string;
   location: string;
   contact: {
      email: string;
      phone: string;
      linkedin: string;
      github: string;
   };
   roles: string[];
   about: Record<string, string>;
   statistics: Record<string, string>;
   languages: Array<{ name: string; level: string }>;
   social_profiles: SocialProfile[];
   site: SiteConfig;
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
   title: string;
   url: string;
   status: string;
}

export interface ProjectsData {
   featured_projects: Project[];
   collaborative_projects: Project[];
   other_projects: Project[];
   community_projects: Project[];
   open_source_contributions: OpenSourceContribution[];
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

// ===== Services =====
export interface Service {
   id: number;
   title: string;
   list: string[];
}

// ===== Icon Map =====
export type IconMap = Record<string, ComponentType<{ size?: number | string }>>;
