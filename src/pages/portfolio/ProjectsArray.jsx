import { getProjects } from '../../data/dataLoader'

// Import project images (using actual filenames)
import LeetcodeRatingPredictor from '../../assets/images/projects_images/Leetcode Rating Predictor.png'
import PortfolioReact from '../../assets/images/projects_images/portfolio-react.png'
import ContactManager from '../../assets/images/projects_images/contact-manager.png'
import EmptyImage from '../../assets/images/projects_images/Empty.jpg'
import Project8 from '../../assets/images/projects_images/project-8.png'
import MusicPlayer from '../../assets/images/projects_images/music-player.png'
import PacMan from '../../assets/images/projects_images/pac-man.png'
import Portfolio from '../../assets/images/projects_images/portfolio.png'
import GuessTheNumber from '../../assets/images/projects_images/guess the number.png'

// Image mapping
const imageMap = {
  'Leetcode Rating Predictor.png': LeetcodeRatingPredictor,
  'portfolio-react.png': PortfolioReact,
  'contact-manager.png': ContactManager,
  'Empty.jpg': EmptyImage,
  'project-8.png': Project8,
  'music-player.png': MusicPlayer,
  'pac-man.png': PacMan,
  'portfolio.png': Portfolio,
  'guess the number.png': GuessTheNumber
}

// Load projects from JSON and map images
const projectsData = getProjects()
const personalProjects = projectsData.personal_projects.map(project => ({
  ...project,
  image: imageMap[project.image] || EmptyImage // fallback to EmptyImage if image not found
}))

const collabProjects = projectsData.collaborative_projects ? 
  projectsData.collaborative_projects.map(project => ({
    ...project,
    image: imageMap[project.image] || EmptyImage // fallback to EmptyImage if image not found
  })) : []

export default personalProjects
export { collabProjects }
