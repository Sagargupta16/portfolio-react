import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./nav.css";
import { RiHome3Line, RiServiceLine } from "react-icons/ri";
import { AiOutlineUser, AiOutlineMessage } from "react-icons/ai";
import { GoBriefcase, GoPencil } from "react-icons/go";
import { GiSuitcase, GiChatBubble, GiSkills } from "react-icons/gi";

const Nav = () => {
  const location = useLocation();
  return (
    <>
      <nav className="nav">
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
        <Link
          to="/testimonial"
          className={location.pathname === "/testimonial" ? "active" : ""}
          alt="Testimonial"
        >
          <GiChatBubble />
        </Link>
        <Link
          to="/contact"
          className={location.pathname === "/contact" ? "active" : ""}
          alt="Contact"
        >
          <AiOutlineMessage />
        </Link>
      </nav>
    </>
  );
};

export default Nav;
