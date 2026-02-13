import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { motion, useScroll, useTransform } from 'framer-motion'
import Nav from '@components/layout/Navigation/Nav'
import Hero from '@components/layout/Header/Hero'
import Footer from '@components/layout/Footer/Footer'
import ErrorBoundary from '@components/common/ErrorBoundary'
import ScrollProgress from '@components/ui/ScrollProgress'
import BackToTop from '@components/ui/BackToTop'
import Preloader from '@components/ui/Preloader'
import KeyboardNav from '@components/ui/KeyboardNav'
import About from '@pages/about/About'
import Experience from '@pages/experience/Experience'
import Skill from '@pages/skill/Skill'
import Education from '@pages/education/Education'
import Services from '@pages/services/Services'
import Portfolio from '@pages/portfolio/Portfolio'
import Achievement from '@pages/achievement/Achievement'
import Contact from '@pages/contact/Contact'
import GitHub from '@pages/github/GitHub'

const SectionDivider = () => <div className="section-divider" />

const GlassBackground = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll()

  // Each orb moves at different parallax speeds
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -350])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150])
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -280])

  return (
    <div className="glass-bg" ref={ref} aria-hidden="true">
      <motion.div className="glass-orb glass-orb-1" style={{ y: y1 }} />
      <motion.div className="glass-orb glass-orb-2" style={{ y: y2 }} />
      <motion.div className="glass-orb glass-orb-3" style={{ y: y3 }} />
      <motion.div className="glass-orb glass-orb-4" style={{ y: y4 }} />
    </div>
  )
}

const App = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true
    })

    const raf = time => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return (
    <ErrorBoundary>
      <Preloader />
      <ScrollProgress />
      <KeyboardNav />
      <GlassBackground />
      <div className="relative min-h-screen">
        <Nav />
        <main>
          <Hero />
          <SectionDivider />
          <div className="section-darker">
            <About />
          </div>
          <SectionDivider />
          <div className="section-dark">
            <Experience />
          </div>
          <SectionDivider />
          <div className="section-darker">
            <Education />
          </div>
          <SectionDivider />
          <div className="section-dark">
            <Skill />
          </div>
          <SectionDivider />
          <div className="section-darker">
            <Portfolio />
          </div>
          <SectionDivider />
          <div className="section-dark">
            <Achievement />
          </div>
          <SectionDivider />
          <div className="section-darker">
            <Services />
          </div>
          <SectionDivider />
          <div className="section-dark">
            <GitHub />
          </div>
          <SectionDivider />
          <div className="section-darker">
            <Contact />
          </div>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </ErrorBoundary>
  )
}

export default App
