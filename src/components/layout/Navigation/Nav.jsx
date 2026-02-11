import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const NAV_SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Awards' },
  { id: 'education', label: 'Education' },
  { id: 'services', label: 'Services' },
  { id: 'github', label: 'GitHub' },
  { id: 'contact', label: 'Contact' }
]

const Nav = () => {
  const [activeSection, setActiveSection] = useState('hero')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    setScrolled(scrollY > 50)

    const windowHeight = window.innerHeight
    let current = 'hero'

    for (const section of NAV_SECTIONS) {
      const el = document.getElementById(section.id)
      if (el) {
        const rect = el.getBoundingClientRect()
        const sectionTop = rect.top + scrollY
        const sectionBottom = sectionTop + el.offsetHeight
        const viewMiddle = scrollY + windowHeight * 0.35

        if (viewMiddle >= sectionTop && viewMiddle < sectionBottom) {
          current = section.id
        }
      }
    }

    setActiveSection(current)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    const rafId = requestAnimationFrame(() => handleScroll())
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const scrollToSection = useCallback(id => {
    const el = document.querySelector(`#${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }, [])

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'backdrop-blur-2xl shadow-lg shadow-black/30' : ''
        }`}
        style={{
          height: 64,
          backgroundColor: scrolled ? 'rgba(6, 6, 16, 0.92)' : 'rgba(6, 6, 16, 0.7)',
          borderBottom: '1px solid rgba(38, 38, 85, 0.5)'
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            paddingLeft: 24,
            paddingRight: 24,
            maxWidth: 1280,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          {/* Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="glow-cyan-text"
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#06b6d4',
              letterSpacing: '0.05em',
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}
            aria-label="Scroll to top"
          >
            {'<SG />'}
          </button>

          {/* Desktop nav links */}
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 4 }}>
            {NAV_SECTIONS.map(section => {
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    color: isActive ? '#06b6d4' : '#a5a5c0',
                    backgroundColor: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#eeeef5'
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#a5a5c0'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                  aria-label={`Navigate to ${section.label}`}
                >
                  {section.label}
                </button>
              )
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              color: '#a5a5c0',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#06b6d4'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#a5a5c0'
            }}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 lg:hidden"
            style={{ zIndex: 40 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              style={{
                position: 'absolute',
                top: 64,
                right: 0,
                bottom: 0,
                width: 288,
                backgroundColor: '#0c0c1e',
                borderLeft: '1px solid rgba(38, 38, 85, 0.7)'
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', padding: '24px 12px', gap: 2 }}>
                <button
                  onClick={() => scrollToSection('hero')}
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s',
                    color: activeSection === 'hero' ? '#06b6d4' : '#a5a5c0',
                    backgroundColor: activeSection === 'hero' ? 'rgba(6, 182, 212, 0.1)' : 'transparent'
                  }}
                >
                  Home
                </button>
                {NAV_SECTIONS.map((section, index) => {
                  const isActive = activeSection === section.id
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.2s',
                        color: isActive ? '#06b6d4' : '#a5a5c0',
                        backgroundColor: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent'
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      aria-label={`Navigate to ${section.label}`}
                    >
                      {section.label}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Nav
