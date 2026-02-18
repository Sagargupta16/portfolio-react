import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { ChevronDown } from 'lucide-react'
import { getName, getRoles, getStatistics, getSocialProfiles } from '@data/dataLoader'
import { staggerContainer, staggerItem } from '@utils/animations'
import useReducedMotion from '@utils/useReducedMotion'
import ICON_MAP from '@utils/iconMap'
import AnimatedCounter from '@components/ui/AnimatedCounter'
import ErrorBoundary from '@components/common/ErrorBoundary'
import Resume from '@assets/Resume.pdf'

const HeroScene = lazy(() => import('@components/3d/HeroScene'))

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

const particlesOptions = {
  fullScreen: { enable: false },
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  particles: {
    color: { value: '#06b6d4' },
    move: {
      enable: true,
      speed: 0.3,
      direction: 'none',
      random: true,
      straight: false,
      outModes: { default: 'out' }
    },
    number: {
      value: 60,
      density: { enable: true, area: 900 }
    },
    opacity: {
      value: { min: 0.1, max: 0.4 },
      animation: { enable: true, speed: 0.4, minimumValue: 0.1 }
    },
    shape: { type: 'circle' },
    size: {
      value: { min: 0.5, max: 2.5 },
      animation: { enable: true, speed: 0.8, minimumValue: 0.5 }
    },
    links: { enable: false }
  },
  detectRetina: true,
  responsive: [
    {
      maxWidth: 768,
      options: {
        particles: { number: { value: 30 } }
      }
    }
  ]
}

const Hero = () => {
  const [engineInit, setEngineInit] = useState(false)
  const [roleIndex, setRoleIndex] = useState(0)
  const [webGLSupported] = useState(() => hasWebGL())
  const reducedMotion = useReducedMotion()

  const name = useMemo(() => getName(), [])
  const roles = useMemo(() => getRoles(), [])
  const statistics = useMemo(() => getStatistics(), [])
  const socialProfiles = useMemo(() => getSocialProfiles(), [])

  const statsArray = useMemo(() => {
    return Object.entries(statistics).map(([key, value]) => ({
      key,
      label: key.replaceAll('_', ' ').replaceAll(/\b\w/g, c => c.toUpperCase()),
      value
    }))
  }, [statistics])

  useEffect(() => {
    initParticlesEngine(async engine => {
      await loadSlim(engine)
    }).then(() => setEngineInit(true))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex(prev => (prev + 1) % roles.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [roles])

  const scrollToAbout = useCallback(() => {
    const el = document.querySelector('#about')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const scrollToProjects = useCallback(() => {
    const el = document.querySelector('#projects')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(6, 182, 212, 0.06) 0%, transparent 70%)'
        }}
      />
      <div className="absolute inset-0 grid-bg" />
      <div
        className="absolute"
        style={{
          top: '10%',
          left: '20%',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '10%',
          right: '10%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.06), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}
      />

      {/* 3D Scene / Particles fallback */}
      {webGLSupported && !reducedMotion ? (
        <ErrorBoundary fallback={engineInit ? <Particles className="absolute inset-0 z-0" options={particlesOptions} /> : null}>
          <Suspense fallback={engineInit ? <Particles className="absolute inset-0 z-0" options={particlesOptions} /> : null}>
            <HeroScene />
          </Suspense>
        </ErrorBoundary>
      ) : (
        engineInit && <Particles className="absolute inset-0 z-0" options={particlesOptions} />
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 py-32 gap-7 max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Terminal badge */}
        <motion.div variants={staggerItem}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 14,
              color: '#22c55e',
              background: 'rgba(34, 197, 94, 0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(34, 197, 94, 0.12)',
              borderRadius: 9999,
              padding: '6px 16px'
            }}
          >
            <span className="w-2 h-2 rounded-full bg-accent-green animate-glow-pulse" />
            {'// Cloud Consultant \u2014 DevOps/MLOps @ AWS'}
            <span className="animate-blink">|</span>
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight"
          variants={staggerItem}
        >
          <span className="text-text-primary">Hi, I&apos;m </span>
          <span className="gradient-text-vivid">{name}</span>
        </motion.h1>

        {/* Animated role cycling */}
        <motion.div className="h-9 md:h-11 flex items-center justify-center" variants={staggerItem}>
          <AnimatePresence mode="wait">
            <motion.p
              key={roleIndex}
              className="font-mono text-base md:text-xl text-accent-purple"
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {roles[roleIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Stats row */}
        <motion.div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mt-2" variants={staggerItem}>
          {statsArray.map(stat => (
            <div key={stat.key} className="flex flex-col items-center gap-1.5">
              <AnimatedCounter value={stat.value} duration={2} />
              <span className="text-text-muted text-xs md:text-sm font-medium tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div className="flex flex-wrap items-center justify-center gap-4 mt-4" variants={staggerItem}>
          <motion.button
            onClick={scrollToProjects}
            className="btn-primary text-sm font-semibold"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            View Projects
          </motion.button>
          <motion.a
            href={Resume}
            download
            className="btn-outline text-sm"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Download Resume
          </motion.a>
        </motion.div>

        {/* Status widget */}
        <motion.div variants={staggerItem}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 16px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: 13,
              color: '#a5a5c0'
            }}
          >
            <span style={{ fontSize: 14 }}>&#128640;</span>
            <span>Currently building with</span>
            <span
              style={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontWeight: 600,
                color: '#06b6d4',
                fontSize: 12
              }}
            >
              AWS &middot; React &middot; GenAI
            </span>
          </div>
        </motion.div>

        {/* Social icons */}
        <motion.div className="flex items-center gap-3 mt-4" variants={staggerItem}>
          {socialProfiles.map(profile => {
            const IconComponent = ICON_MAP[profile.icon]
            if (!IconComponent) return null
            return (
              <motion.a
                key={profile.id}
                href={profile.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a5a5c0',
                  transition: 'all 0.3s'
                }}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#06b6d4'
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#a5a5c0'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                }}
                aria-label={`Visit ${profile.name} profile`}
              >
                <IconComponent size={18} />
              </motion.a>
            )
          })}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        aria-label="Scroll to About section"
      >
        <span className="text-xs font-mono tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-scroll-hint" />
      </motion.button>
    </section>
  )
}

export default Hero
