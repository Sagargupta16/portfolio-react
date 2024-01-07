import React from 'react'
import './footer.css'
import socialLinks from './socialLinks'

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
