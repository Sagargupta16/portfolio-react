import { useMemo } from 'react'
import { getSocialProfiles } from '@data/dataLoader'
import styles from './Footer.module.css'
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
    <footer id="footer" className={styles.footer}>
      <div className={styles.footer__logo} aria-label="Sagar Gupta logo">
        SG
      </div>
      <nav className={styles.footer__socials} aria-label="Social media links">
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
      <address className={styles.footer__copyright}>
        <small>© Sagar Gupta. All rights reserved.</small>
      </address>
    </footer>
  )
}

export default Footer
