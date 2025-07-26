import { BsLinkedin } from 'react-icons/bs'
import { FaGithub } from 'react-icons/fa'
import { FiInstagram } from 'react-icons/fi'
import { SiCodechef, SiGeeksforgeeks, SiHackerrank, SiLeetcode, SiX } from 'react-icons/si'

const socialProfiles = [
  {
    id: 1,
    name: 'LinkedIn',
    link: 'https://www.linkedin.com/in/sagar-gupta-16-10/',
    icon: <BsLinkedin />
  },
  {
    id: 2,
    name: 'Github',
    link: 'https://github.com/Sagargupta16',
    icon: <FaGithub />
  },
  {
    id: 3,
    name: 'Instagram',
    link: 'https://www.instagram.com/sagar_sethh/',
    icon: <FiInstagram />
  },
  {
    id: 4,
    name: 'Twitter',
    link: 'https://twitter.com/Sagargupta1610/',
    icon: <SiX />
  }
]

const codingProfiles = [
  {
    id: 1,
    name: 'Leetcode',
    link: 'https://leetcode.com/Sagargupta1610/',
    icon: <SiLeetcode />
  },
  {
    id: 2,
    name: 'Codechef',
    link: 'https://www.codechef.com/users/sagargupta_16',
    icon: <SiCodechef />
  },
  {
    id: 3,
    name: 'Geeksforgeeks',
    link: 'https://auth.geeksforgeeks.org/user/sagargupta10',
    icon: <SiGeeksforgeeks />
  },
  {
    id: 4,
    name: 'Hackerrank',
    link: 'https://www.hackerrank.com/Sagargupta1610',
    icon: <SiHackerrank />
  }
]

export { socialProfiles, codingProfiles }
