import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Code, Trophy, Brain, Palette, Settings } from 'lucide-react'
import { getServices } from '@data/dataLoader'
import { fadeInUp, staggerContainer } from '@utils/animations'
import useMediaQuery from '@utils/useMediaQuery'
import SectionHeader from '@components/ui/SectionHeader'

const iconMap = {
  'Full-Stack Development': Code,
  'DevOps & MLOps': Cloud,
  'Competitive Programming': Trophy,
  'Data Science & ML': Brain,
  'UI/UX Design': Palette,
  'Technical Consulting': Settings
}

const ACCENT_COLORS = [
  { iconBg: 'rgba(6,182,212,0.1)', icon: '#06b6d4', dot: '#06b6d4', borderHover: 'rgba(6,182,212,0.4)' },
  { iconBg: 'rgba(168,85,247,0.1)', icon: '#a855f7', dot: '#a855f7', borderHover: 'rgba(168,85,247,0.4)' },
  { iconBg: 'rgba(34,197,94,0.1)', icon: '#22c55e', dot: '#22c55e', borderHover: 'rgba(34,197,94,0.4)' },
  { iconBg: 'rgba(245,158,11,0.1)', icon: '#f59e0b', dot: '#f59e0b', borderHover: 'rgba(245,158,11,0.4)' },
  { iconBg: 'rgba(236,72,153,0.1)', icon: '#ec4899', dot: '#ec4899', borderHover: 'rgba(236,72,153,0.4)' },
  { iconBg: 'rgba(6,182,212,0.1)', icon: '#06b6d4', dot: '#06b6d4', borderHover: 'rgba(6,182,212,0.4)' }
]

const Services = () => {
  const services = useMemo(() => getServices(), [])
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <motion.section
      id="services"
      className="py-24 px-6"
      style={{ padding: isMobile ? '64px 16px' : '96px 24px' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <SectionHeader title="Services" subtitle="What I offer" />

      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{
          maxWidth: 1152,
          margin: '0 auto',
          display: 'grid',
          gap: 24,
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))'
        }}
        variants={staggerContainer}
      >
        {services.map((service, i) => {
          const IconComponent = iconMap[service.title] || Code
          const colors = ACCENT_COLORS[i % ACCENT_COLORS.length]

          return (
            <motion.div
              key={service.id}
              className="glass-card p-6 md:p-8 transition-all duration-300"
              style={{ padding: 32 }}
              variants={fadeInUp}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  backgroundColor: colors.iconBg
                }}
              >
                <IconComponent className="w-7 h-7" style={{ color: colors.icon }} />
              </div>

              <h3
                className="text-lg font-bold text-text-primary mb-4"
                style={{ fontSize: 18, fontWeight: 700, color: '#eeeef5', marginBottom: 16 }}
              >
                {service.title}
              </h3>

              <ul className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {service.list.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-text-secondary text-sm leading-relaxed"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      color: '#a5a5c0',
                      fontSize: 14,
                      lineHeight: 1.6
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        marginTop: 8,
                        flexShrink: 0,
                        backgroundColor: colors.dot
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.section>
  )
}

export default Services
