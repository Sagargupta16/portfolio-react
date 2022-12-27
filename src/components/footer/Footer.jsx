/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import './footer.css'
import {FaInstagram, FaLinkedin, FaGithub ,FaTwitter} from 'react-icons/fa'

const Footer = () => {
  return (
    <footer>
      <a href="#" className='footer__logo'>SAGAR</a>
      <ul className="permalinks">
        <li><a href="#">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#education">Education</a></li>
        <li><a href="#skill">Skills</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#portfolio">Portfolio</a></li>
        <li><a href="#testimonial">Testimonials</a></li>
        <li><a href="#contact">Contact</a></li>
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
