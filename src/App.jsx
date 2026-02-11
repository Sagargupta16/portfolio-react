import { useEffect, useState, Suspense, lazy } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from '@components/layout/Header'
import Nav from '@components/layout/Navigation'
import Footer from '@components/layout/Footer'
import Theme from '@components/layout/Theme'
import ErrorBoundary from '@components/common/ErrorBoundary'
import Loading from '@components/common/Loading'

const About = lazy(() => import('@pages/about/About'))
const Education = lazy(() => import('@pages/education/Education'))
const Experience = lazy(() => import('@pages/experience/Experience'))
const Skill = lazy(() => import('@pages/skill/Skill'))
const Services = lazy(() => import('@pages/services/Services'))
const Portfolio = lazy(() => import('@pages/portfolio/Portfolio'))
const Achievement = lazy(() => import('@pages/achievement/Achievement'))
const Contact = lazy(() => import('@pages/contact/Contact'))

const RouterWrapper = ({ children }) => (
  <Router
    basename="/portfolio-react"
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
    <HelmetProvider>
      <ErrorBoundary>
        <RouterWrapper>
          <Suspense fallback={<Loading />}>
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
          </Suspense>
        </RouterWrapper>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App
