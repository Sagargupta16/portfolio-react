import personalData from './personal.json'
import educationData from './education.json'
import experienceData from './experience.json'
import skillsData from './skills.json'
import servicesData from './services.json'
import projectsData from './projects.json'
import achievementsData from './achievements.json'
import contactData from './contact.json'

// Consolidated data access
// Individual data getters
export const getName = () => personalData.name
export const getRoles = () => personalData.roles
export const getAbout = () => personalData.about
export const getStatistics = () => personalData.statistics
export const getSocialProfiles = () => personalData.social_profiles
export const getEducation = () => educationData
export const getExperience = () => experienceData.professional_experience
export const getPositionsOfResponsibility = () => experienceData.positions_of_responsibility
export const getSkills = () => skillsData
export const getServices = () => servicesData
export const getPersonalProjects = () => projectsData.personal_projects
export const getCollaborativeProjects = () => projectsData.collaborative_projects
export const getCertifications = () => achievementsData.certifications
export const getLearningBadges = () => achievementsData.learning_badges || []
export const getAchievements = () => achievementsData.achievements
export const getCodingPlatformStats = () => achievementsData.coding_platform_stats || {}
export const getContactOptions = () => contactData.contact_options
export const getEmailConfig = () => contactData.email_config
