import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, GraduationCap, Rocket, Trophy } from 'lucide-react'
import { getAbout, getStatistics } from '@data/dataLoader'
import { sectionReveal, staggerContainer, staggerItem, fadeInLeft, fadeInRight, fadeInUp } from '@utils/animations'
import SectionHeader from '@components/ui/SectionHeader'
import AnimatedCounter from '@components/ui/AnimatedCounter'
import DevAvatar from '@components/ui/DevAvatar'
import useMediaQuery from '@utils/useMediaQuery'

const HIGHLIGHT_ICONS = [
  { Icon: Briefcase, color: '#06b6d4' },
  { Icon: GraduationCap, color: '#a855f7' },
  { Icon: Rocket, color: '#22c55e' },
  { Icon: Trophy, color: '#f59e0b' }
]

const About = () => {
  const aboutInfo = getAbout()
  const statistics = getStatistics()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const highlights = useMemo(
    () => [aboutInfo.current_role, aboutInfo.education, aboutInfo.specialization, aboutInfo.competitive_programming],
    [aboutInfo]
  )

  const statEntries = useMemo(() => Object.entries(statistics), [statistics])

  return (
    <motion.section
      id="about"
      style={{ padding: isMobile ? '64px 16px' : '96px 24px' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionReveal}
    >
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <SectionHeader title="About Me" subtitle="Get to know me" />

        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 32 : 56,
            alignItems: 'center'
          }}
          variants={staggerContainer}
        >
          {/* Left Column - Animated Avatar */}
          <motion.div variants={fadeInLeft} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={isMobile ? { transform: 'scale(0.8)' } : undefined}>
              <DevAvatar />
            </div>
          </motion.div>

          {/* Right Column - Bio + Highlights */}
          <motion.div variants={fadeInRight}>
            {/* Status line */}
            <p
              style={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                color: '#22c55e',
                fontSize: isMobile ? 12 : 13,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span
                className="animate-glow-pulse"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'inline-block',
                  flexShrink: 0
                }}
              />
              <span>currently building cloud infrastructure at AWS</span>
            </p>

            {/* Greeting */}
            <h3
              style={{
                fontSize: isMobile ? 22 : 28,
                fontWeight: 700,
                color: '#eeeef5',
                marginBottom: 16,
                lineHeight: 1.3
              }}
            >
              {aboutInfo.greeting.replace(/^[^\s]+\s/, '')}
            </h3>

            {/* Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {highlights.map((text, i) => {
                const { Icon, color } = HIGHLIGHT_ICONS[i]
                const cleanText = text.replace(/^[^\s]+\s/, '')
                return (
                  <motion.div
                    key={text}
                    variants={staggerItem}
                    style={{
                      display: 'flex',
                      gap: isMobile ? 10 : 14,
                      alignItems: 'flex-start',
                      padding: isMobile ? '12px 14px' : '14px 16px',
                      borderRadius: 12,
                      background: 'rgba(14, 14, 38, 0.6)',
                      border: '1px solid rgba(38, 38, 85, 0.5)'
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${color}12`,
                        border: `1px solid ${color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1
                      }}
                    >
                      <Icon style={{ width: 16, height: 16, color }} />
                    </div>
                    <p style={{ color: '#a5a5c0', fontSize: isMobile ? 13 : 14, lineHeight: 1.6, margin: 0 }}>
                      {cleanText}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Row - Full Width */}
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${statEntries.length}, 1fr)`,
            gap: isMobile ? 12 : 16,
            marginTop: isMobile ? 40 : 56
          }}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {statEntries.map(([key, value]) => (
            <motion.div
              key={key}
              variants={fadeInUp}
              className="glass-card"
              style={{ padding: isMobile ? '18px 12px' : '24px 16px', textAlign: 'center' }}
            >
              <AnimatedCounter value={value} />
              <p
                style={{
                  color: '#6e6e90',
                  fontSize: isMobile ? 10 : 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  marginTop: 8
                }}
              >
                {key.replaceAll('_', ' ')}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default About
