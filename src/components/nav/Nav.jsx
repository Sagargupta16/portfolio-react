import { React, useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./nav.css";
import { RiHome3Line, RiServiceLine } from "react-icons/ri";
import { AiOutlineUser, AiOutlineMessage } from "react-icons/ai";
import { GoBriefcase, GoPencil } from "react-icons/go";
import { GiSuitcase, GiChatBubble, GiSkills } from "react-icons/gi";

const Nav = () => {
  const [activeNav, setActiveNav] = useState("#");
  useEffect(() => {
    const currentURL = window.location.href;
    if (currentURL.endsWith("/")) setActiveNav("#");
    else if (currentURL.endsWith("/about")) setActiveNav("about");
    else if (currentURL.endsWith("/education")) setActiveNav("education");
    else if (currentURL.endsWith("/experience")) setActiveNav("experience");
    else if (currentURL.endsWith("/skill")) setActiveNav("skill");
    else if (currentURL.endsWith("/services")) setActiveNav("services");
    else if (currentURL.endsWith("/portfolio")) setActiveNav("portfolio");
    else if (currentURL.endsWith("/testimonial")) setActiveNav("testimonial");
    else if (currentURL.endsWith("/contact")) setActiveNav("contact");
  }, [setActiveNav]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  });
  return (
    <>
      <nav className="nav">
        <Link
          to="/"
          className={activeNav === "#" ? "active" : ""}
          onClick={() => setActiveNav("#")}
          alt="Home"
        >
          <RiHome3Line />
        </Link>
        <Link
          to="/about"
          className={activeNav === "about" ? "active" : ""}
          onClick={() => setActiveNav("about")}
          alt="About"
        >
          <AiOutlineUser />
        </Link>
        <Link
          to="/education"
          className={activeNav === "education" ? "active" : ""}
          onClick={() => setActiveNav("education")}
          alt="Education"
        >
          <GoPencil />
        </Link>
        <Link
          to="/experience"
          className={activeNav === "experience" ? "active" : ""}
          onClick={() => setActiveNav("experience")}
          alt="Experience"
        >
          <GoBriefcase />
        </Link>
        <Link
          to="/skill"
          className={activeNav === "skill" ? "active" : ""}
          onClick={() => setActiveNav("skill")}
          alt="Skills"
        >
          <GiSkills />
        </Link>
        <Link
          to="/services"
          className={activeNav === "services" ? "active" : ""}
          onClick={() => setActiveNav("services")}
          alt="Services"
        >
          <RiServiceLine />
        </Link>
        <Link
          to="/portfolio"
          className={activeNav === "portfolio" ? "active" : ""}
          onClick={() => setActiveNav("portfolio")}
          alt="Portfolio"
        >
          <GiSuitcase />
        </Link>
        <Link
          to="/testimonial"
          className={activeNav === "testimonial" ? "active" : ""}
          onClick={() => setActiveNav("testimonial")}
          alt="Testimonial"
        >
          <GiChatBubble />
        </Link>
        <Link
          to="/contact"
          className={activeNav === "contact" ? "active" : ""}
          onClick={() => setActiveNav("contact")}
          alt="Contact"
        >
          <AiOutlineMessage />
        </Link>
      </nav>
    </>
  );
};

export default Nav;
