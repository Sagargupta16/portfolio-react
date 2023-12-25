import React, { useLayoutEffect, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './nav.css'
import { RiHome3Line, RiServiceLine } from 'react-icons/ri'
import { AiOutlineUser, AiOutlineMessage } from 'react-icons/ai'
import { GoBriefcase, GoPencil } from 'react-icons/go'
import { GiSuitcase, GiSkills } from 'react-icons/gi'

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
    const sections = [
      'header',
      'about',
      'education',
      'experience',
      'skill',
      'services',
      'portfolio',
      'contact'
    ]

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
    const sectionId =
      item.to.substring(1).length > 0 ? item.to.substring(1) : 'header'
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="nav">
      <div className="nav__logo">
        <Link to="/" aria-label="Home">
          <span className="nav__logo--text">SG</span>
        </Link>
      </div>
      <div className="nav__list">
        {screenWidth > 600
          ? navItems.map(item => (
              <Link
                to={item.to}
                className={location.pathname === item.to ? 'active' : ''}
                aria-label={item.label}
                key={item.to}
              >
                {item.icon}
              </Link>
            ))
          : navItems.map(item => (
              <button
                aria-label={item.label}
                className={
                  activeSection === item.to.substring(1) ? 'active' : ''
                }
                onClick={() => handleNavItemClick(item)}
                key={item.to}
              >
                {item.icon}
              </button>
            ))}
      </div>
    </nav>
  )
}

export default Nav
