import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa6'
import { SiX } from 'react-icons/si'
import { getSocialProfiles } from '@data/dataLoader'
import { staggerContainer, staggerItem } from '@utils/animations'

const ICON_MAP = {
  BsLinkedin: FaLinkedin,
  FaGithub: FaGithub,
  FiInstagram: FaInstagram,
  SiX: SiX
}

const Footer = () => {
  const socialProfiles = useMemo(() => getSocialProfiles(), [])

  return (
    <footer
      className="relative bg-bg-secondary border-t border-border"
      style={{
        position: 'relative',
        backgroundColor: '#0c0c1e',
        borderTop: '1px solid #262655'
      }}
    >
      {/* Gradient line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(6,182,212,0.4), transparent)'
        }}
      />

      <motion.div
        className="flex flex-col items-center gap-6 py-10 px-6 max-w-7xl mx-auto"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          padding: '40px 24px',
          maxWidth: 1280,
          margin: '0 auto'
        }}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Logo */}
        <motion.span
          className="font-mono text-2xl font-bold text-accent-cyan glow-cyan-text"
          style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 24,
            fontWeight: 700,
            color: '#06b6d4'
          }}
          variants={staggerItem}
        >
          SG
        </motion.span>

        {/* Social links */}
        <motion.div
          className="flex items-center gap-3"
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          variants={staggerItem}
        >
          {socialProfiles.map(profile => {
            const IconComponent = ICON_MAP[profile.icon]
            if (!IconComponent) return null
            return (
              <motion.a
                key={profile.id}
                href={profile.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-border bg-bg-card/50 flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-all duration-300"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid #262655',
                  background: 'rgba(20,20,45,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a5a5c0'
                }}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Visit ${profile.name} profile`}
              >
                <IconComponent size={16} />
              </motion.a>
            )
          })}
        </motion.div>

        {/* Copyright */}
        <motion.p
          className="text-text-muted text-sm text-center"
          style={{ color: '#6e6e90', fontSize: 14, textAlign: 'center' }}
          variants={staggerItem}
        >
          &copy; 2025 Sagar Gupta. Built with React &amp; Tailwind CSS
        </motion.p>
      </motion.div>
    </footer>
  )
}

export default Footer
