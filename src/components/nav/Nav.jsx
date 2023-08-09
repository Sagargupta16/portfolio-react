import React, { useLayoutEffect, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./nav.css";
import { RiHome3Line, RiServiceLine } from "react-icons/ri";
import { AiOutlineUser, AiOutlineMessage } from "react-icons/ai";
import { GoBriefcase, GoPencil } from "react-icons/go";
import { GiSuitcase, /* GiChatBubble,*/ GiSkills } from "react-icons/gi";

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
    const sections = [
      "header",
      "about",
      "education",
      "experience",
      "skill",
      "services",
      "portfolio",
      // "testimonial",
      "contact",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      const currentSection = sections.filter((section) => {
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
          const sectionTop = sectionElement.offsetTop;
          const sectionBottom = sectionTop + sectionElement.offsetHeight;
          return scrollPosition >= sectionTop && scrollPosition < sectionBottom;
        }
        return false;
      });
      if (currentSection.length > 0) {
        setActiveSection(currentSection[0]);
      }
    };

    window.onload = handleScroll;
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [screenWidth]);

  const navItems = [
    { to: "/", icon: <RiHome3Line />, alt: "Home" },
    { to: "/about", icon: <AiOutlineUser />, alt: "About" },
    { to: "/education", icon: <GoPencil />, alt: "Education" },
    { to: "/experience", icon: <GoBriefcase />, alt: "Experience" },
    { to: "/skill", icon: <GiSkills />, alt: "Skills" },
    { to: "/services", icon: <RiServiceLine />, alt: "Services" },
    { to: "/portfolio", icon: <GiSuitcase />, alt: "Portfolio" },
    // { to: "/testimonial", icon: <GiChatBubble />, alt: "Testimonial" },
    { to: "/contact", icon: <AiOutlineMessage />, alt: "Contact" },
  ];

  const sections = [
    { id: "header", alt: "Home", icon: <RiHome3Line /> },
    { id: "about", alt: "About", icon: <AiOutlineUser /> },
    { id: "education", alt: "Education", icon: <GoPencil /> },
    { id: "experience", alt: "Experience", icon: <GoBriefcase /> },
    { id: "skill", alt: "Skills", icon: <GiSkills /> },
    { id: "services", alt: "Services", icon: <RiServiceLine /> },
    { id: "portfolio", alt: "Portfolio", icon: <GiSuitcase /> },
    // { id: "testimonial", alt: "Testimonial", icon: <GiChatBubble /> },
    { id: "contact", alt: "Contact", icon: <AiOutlineMessage /> },
  ];

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
              {navItems.map((item) => (
                <Link
                  to={item.to}
                  className={location.pathname === item.to ? "active" : ""}
                  alt={item.alt}
                  key={item.to}
                >
                  {item.icon}
                </Link>
              ))}
            </>
          ) : (
            <>
              {sections.map((section) => (
                <button
                  alt={section.alt}
                  className={activeSection === section.id ? "active" : ""}
                  onClick={() =>
                    document
                      .getElementById(section.id)
                      .scrollIntoView({ behavior: "smooth" })
                  }
                  key={section.id}
                >
                  {section.icon}
                </button>
              ))}
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Nav;
