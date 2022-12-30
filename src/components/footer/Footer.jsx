/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import { Link } from 'react-router-dom'

import './footer.css'
import {FaInstagram, FaLinkedin, FaGithub ,FaTwitter} from 'react-icons/fa'

const Footer = () => {
  return (
    <footer id='footer'>
      <a href="#" className='footer__logo'>SAGAR</a>
      <ul className="permalinks">
        <li><Link to="/" >Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/education">Education</Link></li>
        <li><Link to="/skill">Skill</Link></li>
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/portfolio">Portfolio</Link></li>
        <li><Link to="/testimonial">Testimonial</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
      <div className="footer__socials">
        <a href="https://www.instagram.com/sagar_seth16/" target="_blank" rel="noreferrer"><FaInstagram/></a>
        <a href="https://twitter.com/SagarGupta1610" target="_blank" rel="noreferrer"><FaTwitter/></a>
        <a href="https://www.linkedin.com/in/sagar-gupta-16-10/" target="_blank" rel="noreferrer"><FaLinkedin/></a>
        <a href="https://github.com/Sagargupta16" target="_blank" rel="noreferrer"><FaGithub/></a>
      </div>

      <div className="footer__copyright">
        <small>© Sagar Gupta. All rights reserved.</small>
      </div>

    </footer>
  )
}

export default Footer
