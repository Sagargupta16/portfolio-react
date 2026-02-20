import { useEffect, lazy, Suspense } from 'react'
import Lenis from 'lenis'
import Nav from '@components/layout/Navigation/Nav'
import Hero from '@components/layout/Header/Hero'
import Footer from '@components/layout/Footer/Footer'
import ErrorBoundary from '@components/common/ErrorBoundary'
import ScrollProgress from '@components/ui/ScrollProgress'
import BackToTop from '@components/ui/BackToTop'
import Preloader from '@components/ui/Preloader'
import KeyboardNav from '@components/ui/KeyboardNav'
import SectionTransition from '@components/ui/SectionTransition'
import ParallaxElements from '@components/ui/ParallaxElements'
import GlassBackground from '@components/layout/GlassBackground'
import SystemStatus from '@components/ui/SystemStatus'

// Lazy Load "Below the fold" sections for massive performance gains
const About = lazy(() => import('@pages/about/About'))
const Experience = lazy(() => import('@pages/experience/Experience'))
const Skill = lazy(() => import('@pages/skill/Skill'))
const Education = lazy(() => import('@pages/education/Education'))
const Services = lazy(() => import('@pages/services/Services'))
const Portfolio = lazy(() => import('@pages/portfolio/Portfolio'))
const Achievement = lazy(() => import('@pages/achievement/Achievement'))
const Contact = lazy(() => import('@pages/contact/Contact'))
const GitHub = lazy(() => import('@pages/github/GitHub'))

const SectionLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '2px solid rgba(6, 182, 212, 0.2)',
        borderTopColor: '#06b6d4',
        animation: 'spin 1s linear infinite'
      }}
    />
  </div>
)

const App = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true
    })
    globalThis.__lenis = lenis

    const raf = time => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      delete globalThis.__lenis
    }
  }, [])

  return (
    <ErrorBoundary>
      <Preloader />
      <ScrollProgress />
      <KeyboardNav />
      <GlassBackground />
      <ParallaxElements />
      <div className="relative min-h-screen">
        <Nav />
        <main>
          <Hero />
          <Suspense fallback={<SectionLoader />}>
            <SectionTransition variant="gradient-sweep" />
            <div className="section-darker">
              <About />
            </div>
            <SectionTransition variant="glow-pulse" />
            <div className="section-dark">
              <Experience />
            </div>
            <SectionTransition variant="beam" />
            <div className="section-darker">
              <Education />
            </div>
            <SectionTransition variant="geometric-scatter" />
            <div className="section-dark">
              <Skill />
            </div>
            <SectionTransition variant="gradient-sweep" />
            <div className="section-darker" id="projects">
              <Portfolio />
            </div>
            <SectionTransition variant="glow-pulse" />
            <div className="section-dark" id="achievements">
              <Achievement />
            </div>
            <SectionTransition variant="beam" />
            <div className="section-darker" id="services">
              <Services />
            </div>
            <SectionTransition variant="geometric-scatter" />
            <div className="section-dark" id="github">
              <GitHub />
            </div>
            <SectionTransition variant="gradient-sweep" />
            <div className="section-darker" id="contact">
              <Contact />
            </div>
          </Suspense>
        </main>
        <Footer />
        <BackToTop />
        <SystemStatus />
      </div>
    </ErrorBoundary>
  )
}

export default App
