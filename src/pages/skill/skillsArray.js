import { getSkills } from '../../data/dataLoader';

// Get the skills data and transform it to match the expected format
const skillsData = getSkills();

const skills = {
  'Programming Languages': skillsData.programming_languages,
  'Frameworks and Libraries': skillsData.frameworks_and_libraries,
  'Cloud and DevOps': skillsData.cloud_and_devops,
  'Tools, Editors, and IDEs': skillsData.tools_editors_and_ides,
  'Databases': skillsData.databases,
  'Operating Systems': skillsData.operating_systems,
  'Coursework': skillsData.coursework,
  'Soft Skills': skillsData.soft_skills,
  'Areas of Interest': skillsData.areas_of_interest
};

export default skills;
