import './Footer.css'
import { getSocialProfiles } from '../../../data/dataLoader'
import { BsLinkedin } from 'react-icons/bs'
import { FaGithub } from 'react-icons/fa'
import { FiInstagram } from 'react-icons/fi'
import { SiX } from 'react-icons/si'

const Footer = () => {
  const socialProfiles = getSocialProfiles()

  // Icon mapping
  const iconMap = {
    BsLinkedin: <BsLinkedin />,
    FaGithub: <FaGithub />,
    FiInstagram: <FiInstagram />,
    SiX: <SiX />
  }

  return (
    <footer id="footer">
      <div className="footer__logo">SG</div>
      <nav className="footer__socials">
        {socialProfiles.map(profile => (
          <a key={profile.id} href={profile.link} target="_blank" rel="noreferrer" title={profile.name}>
            {iconMap[profile.icon]}
          </a>
        ))}
      </nav>
      <address className="footer__copyright">
        <small>Â© Sagar Gupta. All rights reserved.</small>
      </address>
    </footer>
  )
}

export default Footer
