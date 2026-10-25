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
   hard_solved?: string;
   contests?: string;
   best_rating?: string;
   best_contest_rank?: string;
   badge?: string;
   top_percentage?: string;
   problem_solving?: string;
   cpp?: string;
   /** LeetCode: exact accepted counts per difficulty. */
   solved_by_difficulty?: { easy: number; medium: number; hard: number };
   /** LeetCode: [contest date YYYY-MM-DD, rating after it], oldest first, attended contests only. */
   rating_history?: [string, number][];
   /** GitHub, over the last year of the contribution calendar. */
   contributions?: number;
   pull_requests?: number;
   longest_streak?: number;
   /** GitHub: share of code size across owned public non-fork repos, largest first. */
   languages?: { name: string; percent: number }[];
   /** GitHub: day the numbers above were last refreshed (YYYY-MM-DD). */
   fetched?: string;
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

/** Scannable engineering brief shown at the top of a project or engagement. */
export interface CaseStudy {
   problem: string;
   built: string;
   decisions: string[];
   outcome: string;
}

// ===== Experience =====
/** Animated scene keys, one per entry in pages/experience/scenes/sceneRegistry.ts. */
export type EngagementSceneKey =
   | "landing-zone"
   | "security-controls"
   | "tf-modernize"
   | "mlops-loop"
   | "consulting-loop"
   | "aws-intern"
   | "ikarus-devops";

export interface ExperienceProject {
   name: string;
   date?: string;
   description: Record<string, string>;
   skills: string[];
   /** Public artifact of this work, when one exists (e.g. a published sample repo). */
   link?: string;
   /** Short label for the link, defaults to "Source" when omitted. */
   linkLabel?: string;
   case_study?: CaseStudy;
   /** Animated scene of what was built, as a banner on its details card. */
   scene?: EngagementSceneKey;
}

export interface InternalContribution {
   title: string;
   type: "talk" | "publication" | "program";
   year?: string;
   /** How many talks, publications or ambassador levels one generic line
    *  stands for (default 1). */
   count?: number;
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
   /** Animated scene of the role as a whole, on its collapsed timeline card. */
   scene?: EngagementSceneKey;
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
   resume_url: string;
}

/** A headline result for the Stats band. `derived_from` names a count kept
 *  elsewhere in data/ that validate-data.js checks `value` against. */
export interface Highlight {
   value: string;
   label: string;
   note?: string;
   derived_from?: "aws_samples" | "tfc_ambassador" | "merged_prs";
}

export interface ImpactStats {
   clients_served: string;
   clients_note: string;
   years_at_aws: string;
}

/** Stats band groups, each headed by a dashed rule. */
type StatsGroupKey =
   "highlights" | "impact" | "delivery" | "open_source" | "competitive";

/** Derived Stats band tiles; their values are computed from data/. */
export type StatsTileKey =
   | "clients_served"
   | "years_at_aws"
   | "speaker_certs"
   | "talks"
   | "projects"
   | "certifications"
   | "badges"
   | "podium"
   | "merged_prs"
   | "stars"
   | "repos"
   | "answers"
   | "leetcode_rating"
   | "problems_solved"
   | "contests"
   | "hard_solved";

/** Copy for one derived tile. `{name}` placeholders in a note are filled
 *  from the derived counts (validate-data.js lists the allowed names). */
interface StatTileCopy {
   label: string;
   note?: string;
}

/** The merged-PRs tile swaps its note when some merges are credited commits. */
interface MergedPrsTileCopy extends StatTileCopy {
   note_coauthored_one: string;
   note_coauthored_many: string;
}

/** A platform card's name, which the machine view reuses. */
interface PlatformCopy {
   label: string;
}

/** A compact platform card: its one figure's caption (`{cpp}` on HackerRank). */
interface CompactPlatformCopy extends PlatformCopy {
   caption: string;
}

/** Contribution heatmap copy. `{count}` is a formatted number; the summary
 *  joins the label, the streak label and a filled `days_*` line. */
interface CalendarCopy {
   label: string;
   current: string;
   less: string;
   more: string;
   loading: string;
   summary: string;
   days_one: string;
   days_many: string;
   tip: string;
   contributions_none: string;
   contributions_one: string;
   contributions_many: string;
}

/** GitHub card copy; `{days}` and `{date}` are filled from the weekly sync. */
interface GitHubCardCopy extends PlatformCopy {
   contributions: string;
   pull_requests: string;
   longest_streak: string;
   streak_value: string;
   updated: string;
   languages: string;
   /** Profile link's accessible name; `{username}` is the GitHub handle. */
   profile_label: string;
   calendar: CalendarCopy;
}

/** LeetCode card copy; the rating curve's lines take `{rating}`, `{count}`
 *  and, in the screen-reader summary, the first and last points. */
interface LeetCodeCardCopy extends PlatformCopy {
   profile_label: string;
   /** The meta line's percentile, `{top}` from coding_platform_stats. */
   top: string;
   best_rating: string;
   problems_solved: string;
   contests: string;
   rating_peak: string;
   rating_contests: string;
   rating_summary: string;
   difficulty: string;
   easy: string;
   medium: string;
   hard: string;
}

/** personal.json `stats.platforms`: the coding platform cards' copy. */
interface PlatformsCopy {
   link_label: string;
   github: GitHubCardCopy;
   leetcode: LeetCodeCardCopy;
   geeksforgeeks: CompactPlatformCopy;
   hackerrank: CompactPlatformCopy;
}

/** personal.json `stats`: the Stats band's headings and tile copy, plus the
 *  platform cards below it. */
export interface StatsCopy {
   headings: Record<StatsGroupKey, string>;
   tiles: Record<StatsTileKey, StatTileCopy> & {
      merged_prs: MergedPrsTileCopy;
   };
   platforms: PlatformsCopy;
}

// ===== Projects =====
/** Hand-set: shipping or in production, early or partial, or finished. */
export type ProjectStatus = "active" | "beta" | "complete";

/** Project filter chips; every category but All is also a project category. */
export type ProjectFilter =
   "All" | "Featured" | "Community" | "Collab" | "Others";

export interface Project {
   id: number;
   title: string;
   description: string;
   date: string;
   status: ProjectStatus;
   /** Latest release or manifest version, kept current by sync-live-data. */
   version?: string;
   tools_tech: string[];
   features: string[];
   github: string;
   live: string;
   team?: string;
   organization?: string;
   contributors?: string[];
   case_study?: CaseStudy;
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

export type NewsType =
   "launch" | "oss" | "community" | "cert" | "award" | "work" | "education";

/** One dated line in data/news.json, newest first. */
export interface NewsItem {
   /** YYYY-MM-DD when the exact day is known, otherwise YYYY-MM. */
   date: string;
   type: NewsType;
   text: string;
   link?: string;
   /** "major" items are highlighted and lead the collapsed view; "minor" ones are toned down. Default normal. */
   impact?: "major" | "minor";
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
   aws: string[];
   devops: string[];
   ai_ml: string[];
   ai_tools: string[];
   languages: string[];
   frontend: string[];
   backend: string[];
   tools_platforms: string[];
   cs_fundamentals: string[];
   soft_skills: string[];
   areas_of_interest: string[];
}

export type SkillCategoryKey = keyof SkillsData;

/** Display copy for one skills.json category. */
interface SkillCategoryCopy {
   label: string;
}

/** data/skills.json: the category map plus the hero field's ranked picks. */
export interface SkillsFile extends SkillsData {
   /**
    * Ranked names for the floating field behind the hero: 10 to 14 entries,
    * each also listed in a primary category (validate-data.js enforces both).
    * Not a category, so it stays off SkillsData and out of the Skills section.
    */
   hero_stack?: string[];
   /** Display label per category, shared by the Skills section and the
    *  machine view. Not a category itself, so it stays off SkillsData. */
   categories: Record<SkillCategoryKey, SkillCategoryCopy>;
}

// ===== Services =====
/** Stable service id: picks the card's icon and canvas, so the title stays
 *  free to change. validate-data.js checks it against ServiceAnimation. */
export type ServiceKey =
   | "landing-zones"
   | "iac-cicd"
   | "cloud-networking"
   | "mlops-genai"
   | "agent-tooling"
   | "full-stack";

export interface Service {
   id: number;
   key: ServiceKey;
   title: string;
   list: string[];
}

// ===== Sections =====
/** data/sections.json entry: the heading copy of one page section. */
interface SectionCopy {
   /** The section's label in the nav, the footer and the command palette. */
   nav: string;
   /** May mark ONE word as *accent* (Instrument Serif italic). */
   title: string;
   subtitle: string;
   /** One line under the section's entry in the desktop "More" menu. */
   blurb?: string;
}

/** Projects toolbar and empty state. `{shown}`, `{total}` and `{count}` are
 *  counts; `{filter}` is a chip label. */
interface ProjectSearchCopy {
   placeholder: string;
   label: string;
   clear: string;
   summary: string;
   order_spotlight: string;
   order_newest: string;
   empty_title: string;
   empty_body: string;
   reset: string;
   filter_label: string;
   filter_count_one: string;
   filter_count_many: string;
}

/** Project modal labels. `demos` titles each case-study demo, keyed by the
 *  project ids in pages/projects/demos/demoRegistry.ts. */
interface ProjectModalCopy {
   close: string;
   glance: string;
   tech: string;
   features: string;
   contributors: string;
   copy_link: string;
   link_copied: string;
   copy_failed: string;
   demos: Record<string, string>;
}

/** One news type's chip label (shown with its count) and the row icon's
 *  screen-reader label. */
interface NewsTypeCopy {
   chip: string;
   label: string;
}

/** Per-section extras beyond the heading: subsection titles, link labels.
 *  Templates take the `{name}` placeholders validate-data.js lists. */
export interface SectionCopyMap extends Record<string, SectionCopy> {
   about: SectionCopy & {
      facts: {
         based_in: string;
         role: string;
         role_value: string;
         education: string;
         education_value: string;
         languages: string;
      };
   };
   experience: SectionCopy & {
      subsections: { positions: string };
      links: {
         source: string;
         source_label: string;
         details: string;
         details_label: string;
      };
      card: { responsibilities: string; present: string; active_role: string };
      modal: {
         close: string;
         contributions: string;
         achievements: string;
         skills: string;
         full_details: string;
      };
   };
   education: SectionCopy & {
      extras: { achievements_one: string; achievements_many: string };
   };
   projects: SectionCopy & {
      subsections: { open_source: string };
      links: {
         details: string;
         source: string;
         live: string;
         view_source: string;
         details_label: string;
         source_label: string;
         live_label: string;
      };
      search: ProjectSearchCopy;
      filters: Record<ProjectFilter, string>;
      card: { spotlight: string; evidence_label: string };
      project_status: Record<ProjectStatus, string>;
      evidence: { aws: string; live: string; source: string };
      /** Open source banner group labels, by PR or discussion status. */
      open_source: Record<
         OpenSourceContribution["status"] | CommunityDiscussion["status"],
         string
      >;
      contribution_status: Record<OpenSourceContribution["status"], string>;
      discussion_status: Record<CommunityDiscussion["status"], string>;
      modal: ProjectModalCopy;
   };
   achievements: SectionCopy & {
      subsections: {
         certifications: string;
         badges: string;
         competitions: string;
      };
      certifications: {
         active_count: string;
         credential: string;
         level: string;
         expired: string;
         expires: string;
      };
      competitions: {
         podium: string;
         other: string;
         rank: string;
         place: string;
      };
   };
   services: SectionCopy & { cta: string; cta_label: string };
   stats: SectionCopy & { subsections: { platforms: string } };
   news: SectionCopy & {
      filters: {
         all: string;
         group_label: string;
         show_all: string;
         show_less: string;
      };
      types: Record<NewsType, NewsTypeCopy>;
   };
   contact: SectionCopy & {
      card_label: string;
      vcard: { label: string; hint: string };
      form: {
         name: string;
         name_placeholder: string;
         email: string;
         email_placeholder: string;
         message: string;
         message_placeholder: string;
         send: string;
         send_label: string;
         sending_label: string;
         invalid_email: string;
         send_failed: string;
         send_timeout: string;
      };
      sent: { title: string; thanks: string; again: string };
   };
}

// ===== Site chrome =====
/** One command palette row: its search keywords and the shell-style command
 *  it shows. Rows built per section, project or profile show that item's
 *  name as the hint; fixed rows carry their own. */
interface PaletteRowCopy {
   keywords: string;
   command: string;
}

interface PaletteActionCopy extends PaletteRowCopy {
   hint: string;
}

/** data/ui.json: copy for the parts of the page that are not a content
 *  section (nav, hero actions, footer, modals, palette, error states).
 *  Templates take the `{name}` placeholders validate-data.js lists. */
export interface UiCopy {
   /** Wraps an accessible name for a link that opens a new tab. */
   new_tab: string;
   /** A social icon link's accessible name (hero and footer tiles). */
   profile_label: string;
   skip_link: string;
   error: {
      title: string;
      body: string;
      refresh: string;
      refresh_label: string;
   };
   section: {
      loading: string;
      unavailable: string;
      unavailable_body: string;
      refresh: string;
   };
   nav: {
      label: string;
      home: string;
      top_label: string;
      navigate_label: string;
      notes: string;
      notes_label: string;
      palette_label: string;
      palette_key: string;
      contact: string;
      more: string;
      menu_open: string;
      menu_close: string;
      menu_label: string;
      menu_dismiss: string;
   };
   hero: {
      projects_cta: string;
      cv_cta: string;
      pdf_cta: string;
      latest: string;
      latest_pr: string;
      latest_project: string;
      scroll: string;
      scroll_label: string;
   };
   footer: {
      copyright: string;
      disclaimer: string;
      site: string;
      site_label: string;
      social: string;
      social_label: string;
      download_cv: string;
      easter_egg: string;
      /** May mark ONE word as *accent*, like a section title. */
      end_line: string;
      hold_copy: string;
      copied: string;
      copy_failed: string;
      slide: string;
      slide_label: string;
      slide_sent: string;
      vitals: string;
      vitals_label: string;
      vitals_pending: string;
      vitals_pending_inp: string;
      visitor_gap: string;
      gap_hours: string;
      gap_minutes: string;
      gap_ahead: string;
      gap_behind: string;
      built_with: string;
      build: string;
      machine_link_label: string;
      /** Keyed by the file scripts/machine-view.js writes. */
      machine_links: Record<"index.md" | "llms.txt" | "rss.xml", string>;
   };
   motion: {
      modes: { full: string; reduced: string };
      button: string;
      label: string;
      title: string;
   };
   back_to_top: string;
   toast_dismiss: string;
   case_study: {
      problem: string;
      built: string;
      decisions: string;
      outcome: string;
      inspect: string;
   };
   notes: {
      pin_label: string;
      close: string;
      previous: string;
      next: string;
      count_one: string;
      count_many: string;
      start: string;
      turn_off: string;
   };
   palette: {
      label: string;
      prompt: string;
      placeholder: string;
      close_key: string;
      empty: string;
      groups: {
         go: string;
         actions: string;
         under_the_hood: string;
         projects: string;
         elsewhere: string;
      };
      rows: {
         home: PaletteActionCopy;
         section: PaletteRowCopy;
         email: PaletteRowCopy & { copied: string; failed: string };
         cv: PaletteActionCopy;
         booking: PaletteActionCopy;
         motion: PaletteRowCopy & { hint_full: string; hint_reduced: string };
         notes: PaletteRowCopy & { hint_show: string; hint_hide: string };
         llms: PaletteActionCopy;
         markdown: PaletteActionCopy;
         rss: PaletteActionCopy;
         vcard: PaletteActionCopy;
         project: PaletteRowCopy;
         profile: PaletteRowCopy;
      };
   };
   cv: {
      title: string;
      close: string;
      unavailable: string;
      download_instead: string;
      view_label: string;
      view_web: string;
      view_pages: string;
      pages_one: string;
      pages_many: string;
      loading: string;
      zoom_out: string;
      zoom_in: string;
      open_pdf: string;
      download: string;
      download_short: string;
      page_alt: string;
      sheet_label: string;
   };
}

// ===== Icon Map =====
export type IconMap = Record<string, ComponentType<{ size?: number | string }>>;
