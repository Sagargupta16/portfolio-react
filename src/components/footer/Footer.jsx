import React from "react";

import "./footer.css";
import { FaInstagram, FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer id="footer">
      <div className="footer__logo">SAGAR</div>
      <div className="footer__socials">
        <a
          href="https://www.instagram.com/sagar_sethh/"
          target="_blank"
          rel="noreferrer"
        >
          <FaInstagram />
        </a>
        <a
          href="https://twitter.com/SagarGupta1610"
          target="_blank"
          rel="noreferrer"
        >
          <FaTwitter />
        </a>
        <a
          href="https://www.linkedin.com/in/sagar-gupta-16-10/"
          target="_blank"
          rel="noreferrer"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://github.com/Sagargupta16"
          target="_blank"
          rel="noreferrer"
        >
          <FaGithub />
        </a>
      </div>

      <div className="footer__copyright">
        <small>© Sagar Gupta. All rights reserved.</small>
      </div>
    </footer>
  );
};

export default Footer;
