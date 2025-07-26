// Data loader utility functions
import personalData from './personal.json';
import educationData from './education.json';
import experienceData from './experience.json';
import skillsData from './skills.json';
import servicesData from './services.json';
import projectsData from './projects.json';
import achievementsData from './achievements.json';
import contactData from './contact.json';

// Personal Information
export const getPersonalInfo = () => personalData;
export const getName = () => personalData.name;
export const getRoles = () => personalData.roles;
export const getAbout = () => personalData.about;
export const getStatistics = () => personalData.statistics;
export const getSocialProfiles = () => personalData.social_profiles;
export const getCodingProfiles = () => personalData.coding_profiles;

// Education
export const getEducation = () => educationData;
export const getEducationData = () => educationData;

// Experience
export const getExperience = () => experienceData.professional_experience;
export const getExperienceData = () => experienceData;
export const getPositionsOfResponsibility = () => experienceData.positions_of_responsibility;

// Skills
export const getSkills = () => skillsData;
export const getSkillsData = () => skillsData;
export const getProgrammingLanguages = () => skillsData.programming_languages;
export const getFrameworksAndLibraries = () => skillsData.frameworks_and_libraries;
export const getCloudAndDevOps = () => skillsData.cloud_and_devops;
export const getToolsAndIDEs = () => skillsData.tools_editors_and_ides;
export const getDatabases = () => skillsData.databases;
export const getOperatingSystems = () => skillsData.operating_systems;
export const getCoursework = () => skillsData.coursework;
export const getSoftSkills = () => skillsData.soft_skills;
export const getAreasOfInterest = () => skillsData.areas_of_interest;

// Services
export const getServices = () => servicesData;
export const getServicesData = () => servicesData;

// Projects
export const getProjects = () => projectsData;
export const getProjectsData = () => projectsData;
export const getPersonalProjects = () => projectsData.personal_projects;
export const getCollaborativeProjects = () => projectsData.collaborative_projects;

// Achievements and Certifications
export const getCertifications = () => achievementsData.certifications;
export const getAchievements = () => achievementsData.achievements;
export const getAchievementsData = () => achievementsData;
export const getCodingPlatformStats = () => achievementsData.coding_platform_stats;

// Contact
export const getContactInfo = () => contactData;
export const getContactData = () => contactData;
export const getContactOptions = () => contactData.contact_options;
export const getEmailConfig = () => contactData.email_config;

// Combined data getters for backward compatibility
export const getAllData = () => ({
  personal: personalData,
  education: educationData,
  experience: experienceData,
  skills: skillsData,
  services: servicesData,
  projects: projectsData,
  achievements: achievementsData,
  contact: contactData
});

const dataLoader = {
  getPersonalInfo,
  getName,
  getRoles,
  getAbout,
  getStatistics,
  getSocialProfiles,
  getCodingProfiles,
  getEducation,
  getExperience,
  getPositionsOfResponsibility,
  getSkills,
  getProgrammingLanguages,
  getFrameworksAndLibraries,
  getCloudAndDevOps,
  getToolsAndIDEs,
  getDatabases,
  getOperatingSystems,
  getCoursework,
  getSoftSkills,
  getAreasOfInterest,
  getServices,
  getPersonalProjects,
  getCertifications,
  getAchievements,
  getCodingPlatformStats,
  getContactOptions,
  getEmailConfig,
  getAllData
};

export default dataLoader;
