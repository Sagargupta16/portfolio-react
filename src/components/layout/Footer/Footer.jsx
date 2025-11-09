import { useMemo } from 'react'
import './Footer.css'
import { getSocialProfiles } from '../../../data/dataLoader'
import { BsLinkedin } from 'react-icons/bs'
import { FaGithub } from 'react-icons/fa'
import { FiInstagram } from 'react-icons/fi'
import { SiX } from 'react-icons/si'

// Icon mapping object
const ICON_MAP = {
  BsLinkedin: <BsLinkedin />,
  FaGithub: <FaGithub />,
  FiInstagram: <FiInstagram />,
  SiX: <SiX />
}

const Footer = () => {
  const socialProfiles = useMemo(() => getSocialProfiles(), [])

  return (
    <footer id="footer">
      <div className="footer__logo" aria-label="Sagar Gupta logo">
        SG
      </div>
      <nav className="footer__socials" aria-label="Social media links">
        {socialProfiles.map((profile, index) => (
          <a
            key={profile.id || `social-${index}`}
            href={profile.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${profile.name} profile`}
          >
            {ICON_MAP[profile.icon]}
          </a>
        ))}
      </nav>
      <address className="footer__copyright">
        <small>© Sagar Gupta. All rights reserved.</small>
      </address>
    </footer>
  )
}

export default Footer
