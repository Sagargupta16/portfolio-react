import { BsLinkedin } from 'react-icons/bs'
import { FaGithub } from 'react-icons/fa'
import { FiInstagram } from 'react-icons/fi'
import { SiCodechef, SiGeeksforgeeks, SiHackerrank, SiLeetcode, SiX } from 'react-icons/si'
import { getSocialProfiles, getCodingProfiles } from '../../data/dataLoader'

// Icon mapping for dynamic rendering
const iconMap = {
  BsLinkedin: <BsLinkedin />,
  FaGithub: <FaGithub />,
  FiInstagram: <FiInstagram />,
  SiX: <SiX />,
  SiLeetcode: <SiLeetcode />,
  SiCodechef: <SiCodechef />,
  SiGeeksforgeeks: <SiGeeksforgeeks />,
  SiHackerrank: <SiHackerrank />
}

// Get data from JSON and map icons
const socialProfilesData = getSocialProfiles()
const codingProfilesData = getCodingProfiles()

const socialProfiles = socialProfilesData.map(profile => ({
  ...profile,
  icon: iconMap[profile.icon]
}))

const codingProfiles = codingProfilesData.map(profile => ({
  ...profile,
  icon: iconMap[profile.icon]
}))

export { socialProfiles, codingProfiles }
