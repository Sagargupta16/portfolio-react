// DataLoader.test.js - Data loading functions tests
import {
  getName,
  getRoles,
  getPersonalInfo,
  getAbout,
  getStatistics,
  getSocialProfiles,
  getCodingProfiles,
  getEducationData,
  getExperienceData,
  getSkillsData,
  getServicesData,
  getProjectsData,
  getAchievementsData,
  getContactData
} from '../data/dataLoader'

describe('DataLoader Functions', () => {
  test('getName returns valid name', () => {
    const name = getName()
    expect(name).toBeDefined()
    expect(typeof name).toBe('string')
    expect(name.length).toBeGreaterThan(0)
  })

  test('getRoles returns valid roles array', () => {
    const roles = getRoles()
    expect(roles).toBeDefined()
    expect(Array.isArray(roles)).toBe(true)
  })

  test('getPersonalInfo returns personal information object', () => {
    const personalInfo = getPersonalInfo()
    expect(personalInfo).toBeDefined()
    expect(typeof personalInfo).toBe('object')
    expect(personalInfo).toHaveProperty('name')
  })

  test('getAbout returns about information', () => {
    const about = getAbout()
    expect(about).toBeDefined()
  })

  test('getStatistics returns statistics data', () => {
    const statistics = getStatistics()
    expect(statistics).toBeDefined()
  })

  test('getSocialProfiles returns social profiles array', () => {
    const socialProfiles = getSocialProfiles()
    expect(socialProfiles).toBeDefined()
    expect(Array.isArray(socialProfiles)).toBe(true)
  })

  test('getCodingProfiles returns coding profiles array', () => {
    const codingProfiles = getCodingProfiles()
    expect(codingProfiles).toBeDefined()
    expect(Array.isArray(codingProfiles)).toBe(true)
  })

  test('getEducationData returns education data', () => {
    const educationData = getEducationData()
    expect(educationData).toBeDefined()
    expect(Array.isArray(educationData)).toBe(true)
  })

  test('getExperienceData returns experience data', () => {
    const experienceData = getExperienceData()
    expect(experienceData).toBeDefined()
  })

  test('getSkillsData returns skills data', () => {
    const skillsData = getSkillsData()
    expect(skillsData).toBeDefined()
  })

  test('getServicesData returns services data', () => {
    const servicesData = getServicesData()
    expect(servicesData).toBeDefined()
    expect(Array.isArray(servicesData)).toBe(true)
  })

  test('getProjectsData returns projects data', () => {
    const projectsData = getProjectsData()
    expect(projectsData).toBeDefined()
  })

  test('getAchievementsData returns achievements data', () => {
    const achievementsData = getAchievementsData()
    expect(achievementsData).toBeDefined()
    expect(typeof achievementsData).toBe('object')
  })

  test('getContactData returns contact data', () => {
    const contactData = getContactData()
    expect(contactData).toBeDefined()
    expect(typeof contactData).toBe('object')
  })

  test('all data loading functions handle missing data gracefully', () => {
    // Test that functions don't throw errors
    expect(() => getName()).not.toThrow()
    expect(() => getRoles()).not.toThrow()
    expect(() => getPersonalInfo()).not.toThrow()
    expect(() => getEducationData()).not.toThrow()
    expect(() => getExperienceData()).not.toThrow()
    expect(() => getSkillsData()).not.toThrow()
    expect(() => getServicesData()).not.toThrow()
    expect(() => getProjectsData()).not.toThrow()
    expect(() => getAchievementsData()).not.toThrow()
    expect(() => getContactData()).not.toThrow()
  })
})
