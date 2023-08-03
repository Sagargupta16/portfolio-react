import React from "react";
import "./header.css";
import CTA from "./CTA";
import ME from "../../assets/me.png";
import HeaderSocials from "./HeaderSocials";
import TW from "./TW";

const Header = () => {
  const words = [
    "Fullstack Developer",
    "Competitive Programmer",
    "Problem Solver",
    "Data Structures and Algorithms Enthusiast",
    "Open Source Contributor",
    "Tech Enthusiast",
  ];
  return (
    <section className="header" id="header">
      <div className="container header__container">
        <h5>Hey Myself</h5>
        <h1>Sagar Gupta</h1>
        <h5 className="text-light">
          I'm a <TW words={words} />
        </h5>
        <CTA />
        <HeaderSocials />
        <div className="me">
          <img src={ME} alt="me" />
        </div>
        {/* <a href="#footer" className="scroll__down">
          Scroll Down
        </a> */}
      </div>
    </section>
  );
};

export default Header;
