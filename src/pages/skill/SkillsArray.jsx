import { getSkills } from '../../data/dataLoader'

// Get the skills data and transform it to match the expected format
const skillsData = getSkills()

const skills = {
  'Programming Languages': skillsData.programming_languages,
  'Frameworks & Libraries': skillsData.frameworks_and_libraries,
  'Cloud Platforms': skillsData.cloud_platforms,
  'DevOps Tools': skillsData.devops_tools,
  Databases: skillsData.databases,
  'Developer Tools': skillsData.developer_tools,
  'Machine Learning & AI': skillsData.machine_learning,
  'Game Development': skillsData.game_dev_tools,
  'CS Fundamentals': skillsData.computer_science_fundamentals,
  'Soft Skills': skillsData.soft_skills,
  'AI Coding Assistants': skillsData.ai_coding_assistants,
  'Areas of Interest': skillsData.areas_of_interest
}

export default skills
