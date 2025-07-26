import { getProjects } from '../../data/dataLoader'

// Import project images
import IMG1 from '../../assets/images/projects_images/project-1.png'
import IMG2 from '../../assets/images/projects_images/project-2.png'
import IMG3 from '../../assets/images/projects_images/project-3.png'
import IMG4 from '../../assets/images/projects_images/project-4.png'
import IMG5 from '../../assets/images/projects_images/project-5.png'
import IMG6 from '../../assets/images/projects_images/project-6.png'
import IMG7 from '../../assets/images/projects_images/project-7.png'
import IMG8 from '../../assets/images/projects_images/project-8.png'
import IMG9 from '../../assets/images/projects_images/project-9.png'
import IMG10 from '../../assets/images/projects_images/project-10.png'
import IMG11 from '../../assets/images/projects_images/project-11.png'
import IMG12 from '../../assets/images/projects_images/project-12.png'
import IMG13 from '../../assets/images/projects_images/project-13.jpg'

// Image mapping
const imageMap = {
  'project-1.png': IMG1,
  'project-2.png': IMG2,
  'project-3.png': IMG3,
  'project-4.png': IMG4,
  'project-5.png': IMG5,
  'project-6.png': IMG6,
  'project-7.png': IMG7,
  'project-8.png': IMG8,
  'project-9.png': IMG9,
  'project-10.png': IMG10,
  'project-11.png': IMG11,
  'project-12.png': IMG12,
  'project-13.jpg': IMG13
}

// Load projects from JSON and map images
const projectsData = getProjects()
const personalProjects = projectsData.personal_projects.map(project => ({
  ...project,
  image: imageMap[project.image] || IMG1 // fallback to IMG1 if image not found
}))

const collabProjects = projectsData.collaborative_projects ? 
  projectsData.collaborative_projects.map(project => ({
    ...project,
    image: imageMap[project.image] || IMG1 // fallback to IMG1 if image not found
  })) : []

export default personalProjects
export { collabProjects }
