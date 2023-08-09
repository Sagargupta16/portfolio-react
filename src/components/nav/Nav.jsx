import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./nav.css";
import { RiHome3Line, RiServiceLine } from "react-icons/ri";
import { AiOutlineUser, AiOutlineMessage } from "react-icons/ai";
import { GoBriefcase, GoPencil } from "react-icons/go";
import { GiSuitcase, GiSkills } from "react-icons/gi";

const Nav = () => {
  const location = useLocation();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    const handleScroll = () => {
      const sections = [
        "header",
        "about",
        "education",
        "experience",
        "skill",
        "services",
        "portfolio",
        "contact",
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (
          screenWidth <= 600 &&
          section &&
          window.scrollY + 200 < section.offsetTop
        ) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    handleScroll(); // Initial check
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [screenWidth]);

  const navItems = [
    { path: "/", icon: <RiHome3Line />, text: "Home" },
    { path: "/about", icon: <AiOutlineUser />, text: "About" },
    { path: "/education", icon: <GoPencil />, text: "Education" },
    { path: "/experience", icon: <GoBriefcase />, text: "Experience" },
    { path: "/skill", icon: <GiSkills />, text: "Skills" },
    { path: "/services", icon: <RiServiceLine />, text: "Services" },
    { path: "/portfolio", icon: <GiSuitcase />, text: "Portfolio" },
    { path: "/contact", icon: <AiOutlineMessage />, text: "Contact" },
  ];

  return (
    <nav className="nav">
      <div className="nav__logo">
        <Link to="/">
          <span className="nav__logo--text">SG</span>
        </Link>
      </div>
      <div className="nav__list">
        {screenWidth > 600
          ? navItems.map((item) => (
              <Link
                to={item.path}
                className={location.pathname === item.path ? "active" : ""}
                key={item.path}
                alt={item.text}
              >
                {item.icon}
              </Link>
            ))
          : navItems.map((item) => (
              <button
                alt={item.text}
                className={activeSection === item.path.slice(1) ? "active" : ""}
                key={item.path}
                onClick={() =>
                  document
                    .getElementById(item.path.slice(1))
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                {item.icon}
              </button>
            ))}
      </div>
    </nav>
  );
};

export default Nav;
