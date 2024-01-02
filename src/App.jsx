import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import PropTypes from 'prop-types'
import Header from './components/header/Header'
import Nav from './components/nav/Nav'
import About from './components/about/About'
import Education from './components/education/Education'
import Experience from './components/experience/Experience'
import Skill from './components/skill/Skill'
import Services from './components/services/Services'
import Portfolio from './components/portfolio/Portfolio'
// import Testimonial from './components/testimonials/Testimonial'
import Contact from './components/contact/Contact'
import Footer from './components/footer/Footer'

const RouterWrapper = ({ children, activeNav, setActiveNav }) => (
  <Router basename="/portfolio-react">
    <Nav setActiveNav={setActiveNav} activeNav={activeNav} />
    {children}
    <Footer />
  </Router>
)

RouterWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  activeNav: PropTypes.string.isRequired,
  setActiveNav: PropTypes.func.isRequired
}

const App = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [activeNav, setActiveNav] = useState('#')

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <RouterWrapper activeNav={activeNav} setActiveNav={setActiveNav}>
      {screenWidth > 600 ? (
        <Routes>
          <Route path="/" element={<Header />} />
          <Route path="/about" element={<About />} />
          <Route path="/education" element={<Education />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/skill" element={<Skill />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          {/* <Route path="/testimonial" element={<Testimonial />} /> */}
          <Route path="/contact" element={<Contact />} />
        </Routes>
      ) : (
        <>
          <Header />
          <About />
          <Education />
          <Experience />
          <Skill />
          <Services />
          <Portfolio />
          {/* <Testimonial /> */}
          <Contact />
        </>
      )}
    </RouterWrapper>
  )
}

export default App
