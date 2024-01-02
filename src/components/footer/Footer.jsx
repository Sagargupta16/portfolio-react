import React from 'react'
import './footer.css'
import { FaInstagram, FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa'

const socialLinks = [
  {
    id: 1,
    icon: <FaInstagram />,
    link: 'https://www.instagram.com/sagar_sethh/',
    title: 'Instagram'
  },
  {
    id: 2,
    icon: <FaTwitter />,
    link: 'https://twitter.com/SagarGupta1610',
    title: 'Twitter'
  },
  {
    id: 3,
    icon: <FaLinkedin />,
    link: 'https://www.linkedin.com/in/sagar-gupta-16-10/',
    title: 'LinkedIn'
  },
  {
    id: 4,
    icon: <FaGithub />,
    link: 'https://github.com/Sagargupta16',
    title: 'GitHub'
  }
]

const Footer = () => {
  return (
    <footer id="footer">
      <div className="footer__logo">SG</div>
      <nav className="footer__socials">
        {socialLinks.map(socialLink => (
          <a
            key={socialLink.id}
            href={socialLink.link}
            target="_blank"
            rel="noreferrer"
            title={socialLink.title}
          >
            {socialLink.icon}
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
