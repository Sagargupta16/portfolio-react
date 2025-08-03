import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import PropTypes from 'prop-types'
import Header from './components/layout/Header'
import Nav from './components/layout/Navigation'
import About from './pages/about/About'
import Education from './pages/education/Education'
import Experience from './pages/experience/Experience'
import Skill from './pages/skill/Skill'
import Services from './pages/services/Services'
import Portfolio from './pages/portfolio/Portfolio'
import Contact from './pages/contact/Contact'
import Footer from './components/layout/Footer'
import Theme from './components/layout/Theme'
import ErrorBoundary from './components/common/ErrorBoundary'

const RouterWrapper = ({ children }) => (
  <Router 
    basename="/portfolio-react" 
    className="router"
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <Nav />
    <Theme />
    {children}
    <Footer />
  </Router>
)

RouterWrapper.propTypes = {
  children: PropTypes.node.isRequired
}

const App = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <ErrorBoundary>
      <RouterWrapper>
        {screenWidth > 600 ? (
          <Routes>
            <Route path="/" element={<Header />} />
            <Route path="/about" element={<About />} />
            <Route path="/education" element={<Education />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/skill" element={<Skill />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
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
            <Contact />
          </>
        )}
      </RouterWrapper>
    </ErrorBoundary>
  )
}

export default App
