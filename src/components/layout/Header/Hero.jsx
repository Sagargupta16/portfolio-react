import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { ChevronDown } from 'lucide-react'
import { getName, getRoles, getStatistics, getSocialProfiles } from '@data/dataLoader'
import { staggerContainer, staggerItem } from '@utils/animations'
import ICON_MAP from '@utils/iconMap'
import AnimatedCounter from '@components/ui/AnimatedCounter'
import Resume from '@assets/Resume.pdf'

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

  const name = useMemo(() => getName(), [])
  const roles = useMemo(() => getRoles(), [])
  const statistics = useMemo(() => getStatistics(), [])
  const socialProfiles = useMemo(() => getSocialProfiles(), [])

  const statsArray = useMemo(() => {
    return Object.entries(statistics).map(([key, value]) => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
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
  }, [roles.length])

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
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary/90 to-bg-secondary" />
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent-cyan/[0.03] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-accent-purple/[0.04] rounded-full blur-[100px]" />

      {/* Particles */}
      {engineInit && <Particles className="absolute inset-0 z-0" options={particlesOptions} />}

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 py-32 gap-7 max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Terminal badge */}
        <motion.div variants={staggerItem}>
          <span className="inline-flex items-center gap-2 font-mono text-sm text-accent-green bg-accent-green/[0.08] border border-accent-green/20 rounded-full px-4 py-1.5">
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

        {/* Role cycling */}
        <motion.div className="h-9 md:h-11 flex items-center justify-center overflow-hidden" variants={staggerItem}>
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
                className="w-10 h-10 rounded-xl border border-border bg-bg-card/50 flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-all duration-300"
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
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
