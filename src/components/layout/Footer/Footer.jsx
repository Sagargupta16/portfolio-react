import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { getSocialProfiles } from '@data/dataLoader'
import { staggerContainer, staggerItem } from '@utils/animations'
import ICON_MAP from '@utils/iconMap'

const Footer = () => {
  const socialProfiles = useMemo(() => getSocialProfiles(), [])

  return (
    <footer
      style={{
        position: 'relative',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)'
      }}
    >
      {/* Gradient line at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(6,182,212,0.25), transparent)'
        }}
      />

      <motion.div
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
          className="glow-cyan-text"
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
        <motion.div style={{ display: 'flex', alignItems: 'center', gap: 12 }} variants={staggerItem}>
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
                  width: 36,
                  height: 36,
                  borderRadius: 8,
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
        <motion.p style={{ color: '#6e6e90', fontSize: 14, textAlign: 'center' }} variants={staggerItem}>
          &copy; 2025 Sagar Gupta. Built with React &amp; Tailwind CSS
        </motion.p>
      </motion.div>
    </footer>
  )
}

export default Footer
