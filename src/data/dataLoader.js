import personalData from './personal.json';
import educationData from './education.json';
import experienceData from './experience.json';
import skillsData from './skills.json';
import servicesData from './services.json';
import projectsData from './projects.json';
import achievementsData from './achievements.json';
import contactData from './contact.json';

// Consolidated data access
// Individual data getters
export const getName = () => personalData.name;
export const getRoles = () => personalData.roles;
export const getAbout = () => personalData.about;
export const getStatistics = () => personalData.statistics;
export const getSocialProfiles = () => personalData.social_profiles;
export const getCodingProfiles = () => personalData.coding_profiles;
export const getEducation = () => educationData;
export const getExperience = () => experienceData.professional_experience;
export const getPositionsOfResponsibility = () => experienceData.positions_of_responsibility;
export const getSkills = () => skillsData;
export const getServices = () => servicesData;
export const getProjects = () => projectsData;
export const getPersonalProjects = () => projectsData.personal_projects;
export const getCollaborativeProjects = () => projectsData.collaborative_projects;
export const getCertifications = () => achievementsData.certifications;
export const getAchievements = () => achievementsData.achievements;
export const getCodingPlatformStats = () => achievementsData.coding_platform_stats;
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
  personal: {
    all: () => personalData,
    name: getName,
    roles: getRoles,
    about: getAbout,
    stats: getStatistics,
    social: getSocialProfiles,
    coding: getCodingProfiles
  },
  education: {
    all: getEducation
  },
  experience: {
    all: () => experienceData,
    professional: getExperience,
    responsibilities: getPositionsOfResponsibility
  },
  skills: {
    all: getSkills,
    programming: () => skillsData.programming_languages,
    frameworks: () => skillsData.frameworks_and_libraries,
    devops: () => skillsData.cloud_and_devops,
    tools: () => skillsData.tools_editors_and_ides,
    databases: () => skillsData.databases,
    os: () => skillsData.operating_systems,
    courses: () => skillsData.coursework,
    soft: () => skillsData.soft_skills,
    interests: () => skillsData.areas_of_interest
  },
  services: {
    all: getServices
  },
  projects: {
    all: getProjects,
    personal: getPersonalProjects,
    collaborative: getCollaborativeProjects
  },
  achievements: {
    all: () => achievementsData,
    certifications: getCertifications,
    achievements: getAchievements,
    codingStats: getCodingPlatformStats
  },
  contact: {
    all: () => contactData,
    options: getContactOptions,
    email: getEmailConfig
  }
};

export default dataLoader;
