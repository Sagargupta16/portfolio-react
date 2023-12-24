import React from "react";
import "./header.css";
import CtaComponent from "./CTA"; // Renamed the import to CtaComponent
import ME from "../../assets/me.png";
import HeaderSocials from "./HeaderSocials";
import TwComponent from "./TW"; // Renamed the import to TwComponent

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
          I'm a <TwComponent words={words} />
        </h5>
        <CtaComponent />
        <HeaderSocials />
        <div className="me">
          <img src={ME} alt="me" />
        </div>
      </div>
    </section>
  );
};

export default Header;
