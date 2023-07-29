import React from "react";
import { BsLinkedin } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";
import { FiInstagram } from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";

function HeaderSocials() {
  return (
    <div className="header__socials">
      <a
        href="https://www.linkedin.com/in/sagar-gupta-16-10/"
        target="_blank"
        rel="noreferrer"
        alt="LinkedIn"
      >
        <BsLinkedin />
      </a>
      <a
        href="https://github.com/Sagargupta16"
        target="_blank"
        rel="noreferrer"
        alt="Github"
      >
        <FaGithub />
      </a>
      <a
        href="https://www.instagram.com/sagar_sethh/"
        target="_blank"
        rel="noreferrer"
        alt="Instagram"
      >
        <FiInstagram />
      </a>
      <a
        href="https://leetcode.com/Sagargupta1610/"
        target="_blank"
        rel="noreferrer"
        alt="Leetcode"
      >
        <SiLeetcode />
      </a>
    </div>
  );
}

export default HeaderSocials;
