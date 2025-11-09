import { useEffect, useState } from 'react'
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
import Achievement from './pages/achievement/Achievement'
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

const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width
}

const App = () => {
  const screenWidth = useWindowWidth()

  const routes = [
    { path: '/', element: <Header /> },
    { path: '/about', element: <About /> },
    { path: '/education', element: <Education /> },
    { path: '/experience', element: <Experience /> },
    { path: '/skill', element: <Skill /> },
    { path: '/services', element: <Services /> },
    { path: '/portfolio', element: <Portfolio /> },
    { path: '/achievement', element: <Achievement /> },
    { path: '/contact', element: <Contact /> }
  ]

  return (
    <ErrorBoundary>
      <RouterWrapper>
        {screenWidth > 600 ? (
          <Routes>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
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
            <Achievement />
            <Contact />
          </>
        )}
      </RouterWrapper>
    </ErrorBoundary>
  )
}

export default App
