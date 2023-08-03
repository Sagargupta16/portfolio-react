import React, { useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./nav.css";
import { RiHome3Line, RiServiceLine } from "react-icons/ri";
import { AiOutlineUser, AiOutlineMessage } from "react-icons/ai";
import { GoBriefcase, GoPencil } from "react-icons/go";
import { GiSuitcase, /* GiChatBubble,*/ GiSkills } from "react-icons/gi";
import { useEffect, useState } from "react";

const Nav = () => {
  const location = useLocation();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [activeSection, setActiveSection] = useState("");

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const home = document.getElementById("header");
      const about = document.getElementById("about");
      const education = document.getElementById("education");
      const experience = document.getElementById("experience");
      const skill = document.getElementById("skill");
      const services = document.getElementById("services");
      const portfolio = document.getElementById("portfolio");
      // const testimonial = document.getElementById("testimonial");
      const contact = document.getElementById("contact");

      const scrollPosition = window.scrollY + 200;

      if (screenWidth <= 600 && home && scrollPosition < about.offsetTop) {
        setActiveSection("home");
      } else if (
        screenWidth <= 600 &&
        about &&
        scrollPosition < education.offsetTop
      ) {
        setActiveSection("about");
      } else if (
        screenWidth <= 600 &&
        education &&
        scrollPosition < experience.offsetTop
      ) {
        setActiveSection("education");
      } else if (
        screenWidth <= 600 &&
        experience &&
        scrollPosition < skill.offsetTop
      ) {
        setActiveSection("experience");
      } else if (
        screenWidth <= 600 &&
        skill &&
        scrollPosition < services.offsetTop
      ) {
        setActiveSection("skill");
      } else if (
        screenWidth <= 600 &&
        services &&
        scrollPosition < portfolio.offsetTop
      ) {
        setActiveSection("services");
      } else if (
        screenWidth <= 600 &&
        portfolio &&
        scrollPosition < contact.offsetTop
      ) {
        setActiveSection("portfolio");
      } else if (screenWidth <= 600 && contact) {
        setActiveSection("contact");
      }
    };
    window.onload = handleScroll;

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [screenWidth]);

  return (
    <>
      <nav className="nav">
        <div className="nav__logo">
          <Link to="/">
            <span className="nav__logo--text">SG</span>
          </Link>
        </div>
        <div className="nav__list">
          {screenWidth > 600 ? (
            <>
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
                alt="Home"
              >
                <RiHome3Line />
              </Link>
              <Link
                to="/about"
                className={location.pathname === "/about" ? "active" : ""}
                alt="About"
              >
                <AiOutlineUser />
              </Link>
              <Link
                to="/education"
                className={location.pathname === "/education" ? "active" : ""}
                alt="Education"
              >
                <GoPencil />
              </Link>
              <Link
                to="/experience"
                className={location.pathname === "/experience" ? "active" : ""}
                alt="Experience"
              >
                <GoBriefcase />
              </Link>
              <Link
                to="/skill"
                className={location.pathname === "/skill" ? "active" : ""}
                alt="Skills"
              >
                <GiSkills />
              </Link>
              <Link
                to="/services"
                className={location.pathname === "/services" ? "active" : ""}
                alt="Services"
              >
                <RiServiceLine />
              </Link>
              <Link
                to="/portfolio"
                className={location.pathname === "/portfolio" ? "active" : ""}
                alt="Portfolio"
              >
                <GiSuitcase />
              </Link>
              {/* <Link
                to="/testimonial"
                className={location.pathname === "/testimonial" ? "active" : ""}
                alt="Testimonial"
              >
                <GiChatBubble />
              </Link> */}
              <Link
                to="/contact"
                className={location.pathname === "/contact" ? "active" : ""}
                alt="Contact"
              >
                <AiOutlineMessage />
              </Link>
            </>
          ) : (
            <>
              <button
                alt="Home"
                className={activeSection === "home" ? "active" : ""}
                onClick={() =>
                  document
                    .getElementById("header")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <RiHome3Line />
              </button>
              <button
                alt="About"
                className={activeSection === "about" ? "active" : ""}
                onClick={() =>
                  document
                    .getElementById("about")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <AiOutlineUser />
              </button>
              <button
                alt="Education"
                className={activeSection === "education" ? "active" : ""}
                onClick={() =>
                  document
                    .getElementById("education")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <GoPencil />
              </button>
              <button
                alt="Experience"
                className={activeSection === "experience" ? "active" : ""}
                onClick={() =>
                  document
                    .getElementById("experience")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <GoBriefcase />
              </button>
              <button
                alt="Skills"
                className={activeSection === "skill" ? "active" : ""}
                onClick={() =>
                  document
                    .getElementById("skill")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <GiSkills />
              </button>
              <button
                alt="Services"
                className={activeSection === "services" ? "active" : ""}
                onClick={() =>
                  document
                    .getElementById("services")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <RiServiceLine />
              </button>
              <button
                alt="Portfolio"
                className={activeSection === "portfolio" ? "active" : ""}
                onClick={() =>
                  document
                    .getElementById("portfolio")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <GiSuitcase />
              </button>
              {/* <button alt="Testimonial" className={ activeSection === "testimonial" ? "active" : ""} onClick={() => document.getElementById("testimonial").scrollIntoView({ behavior: "smooth" })}>
                  <GiChatBubble />
                </button> */}
              <button
                alt="Contact"
                className={activeSection === "contact" ? "active" : ""}
                onClick={() =>
                  document
                    .getElementById("contact")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                <AiOutlineMessage />
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Nav;
