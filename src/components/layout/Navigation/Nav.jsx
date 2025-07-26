import React, { useLayoutEffect, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Nav.css'
import { RiHome3Line, RiServiceLine } from 'react-icons/ri'
import { AiOutlineUser, AiOutlineMessage } from 'react-icons/ai'
import { GoBriefcase, GoPencil } from 'react-icons/go'
import { GiSuitcase, GiSkills } from 'react-icons/gi'
import { hoverScale, staggerContainer, staggerItem } from '../../../utils/animations'

const Nav = () => {
  const location = useLocation()
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [activeSection, setActiveSection] = useState('')

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const sections = ['', 'about', 'education', 'experience', 'skill', 'services', 'portfolio', 'contact']

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100
      const currentSection = sections.find(section => {
        const sectionElement = document.getElementById(section)
        if (sectionElement) {
          const sectionTop = sectionElement.offsetTop
          const sectionBottom = sectionTop + sectionElement.offsetHeight
          return scrollPosition >= sectionTop && scrollPosition < sectionBottom
        }
        return false
      })
      setActiveSection(currentSection || '')
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const navItems = [
    { to: '/', icon: <RiHome3Line />, label: 'Home' },
    { to: '/about', icon: <AiOutlineUser />, label: 'About' },
    { to: '/education', icon: <GoPencil />, label: 'Education' },
    { to: '/experience', icon: <GoBriefcase />, label: 'Experience' },
    { to: '/skill', icon: <GiSkills />, label: 'Skills' },
    { to: '/services', icon: <RiServiceLine />, label: 'Services' },
    { to: '/portfolio', icon: <GiSuitcase />, label: 'Portfolio' },
    { to: '/contact', icon: <AiOutlineMessage />, label: 'Contact' }
  ]

  const handleNavItemClick = item => {
    const sectionId = item.to.substring(1).length > 0 ? item.to.substring(1) : 'header'

    const sectionElement = document.getElementById(sectionId)
    if (sectionElement) {
      const offset = -50
      const offsetTop = sectionElement.offsetTop + offset

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <motion.nav 
      className="nav"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div 
        className="nav__logo"
        variants={hoverScale}
        whileHover="hover"
        whileTap="tap"
      >
        <Link to="/" aria-label="Home">
          <span className="nav__logo--text">SG</span>
        </Link>
      </motion.div>
      <motion.div 
        className="nav__list"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {screenWidth > 600
          ? navItems.map((item, index) => (
              <motion.div
                key={item.to}
                variants={staggerItem}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.to}
                  className={location.pathname === item.to ? 'active' : ''}
                  aria-label={item.label}
                >
                  {item.icon}
                </Link>
              </motion.div>
            ))
          : navItems.map((item, index) => (
              <motion.button
                key={item.to}
                aria-label={item.label}
                className={activeSection === item.to.substring(1) ? 'active' : ''}
                onClick={() => handleNavItemClick(item)}
                variants={staggerItem}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                {item.icon}
              </motion.button>
            ))}
      </motion.div>
    </motion.nav>
  )
}

export default Nav
