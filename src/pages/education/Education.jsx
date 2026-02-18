import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { MapPin, GraduationCap, Trophy, BookOpen } from 'lucide-react'
import { getEducation } from '@data/dataLoader'
import { sectionRevealEnhanced, staggerContainer, staggerItem, slideInLeft, slideInRight } from '@utils/animations'
import useMediaQuery from '@utils/useMediaQuery'
import SectionHeader from '@components/ui/SectionHeader'
import AnimatedCounter from '@components/ui/AnimatedCounter'

const EducationCard = ({ item, index, isMobile }) => {
  const ml = isMobile ? 0 : 38

  const institutionRow = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'rgba(168,85,247,0.1)',
          border: '1px solid rgba(168,85,247,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <GraduationCap style={{ width: 14, height: 14, color: '#a855f7' }} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#eeeef5', lineHeight: 1.3 }}>{item.institution}</h3>
    </div>
  )

  const cgpaBadge = item.cgpa && (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 10,
        background: 'rgba(34,197,94,0.06)',
        border: '1px solid rgba(34,197,94,0.12)',
        ...(isMobile ? { alignSelf: 'flex-start' } : { flexShrink: 0 })
      }}
    >
      <span
        style={{
          color: '#22c55e',
          fontWeight: 700,
          fontSize: 16,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace'
        }}
      >
        <AnimatedCounter value={item.cgpa} />
      </span>
      {item.percentage && (
        <span
          style={{
            fontSize: 11,
            color: '#6e6e90',
            fontFamily: 'JetBrains Mono, ui-monospace, monospace'
          }}
        >
          {item.percentage}
        </span>
      )}
    </div>
  )

  const cardContent = (
    <>
      {/* Institution + Degree + CGPA */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {institutionRow}
          <p style={{ color: '#06b6d4', fontWeight: 600, fontSize: 15 }}>{item.title}</p>
          {cgpaBadge}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {institutionRow}
            <p style={{ color: '#06b6d4', fontWeight: 600, fontSize: 15, marginTop: 4, marginLeft: ml }}>
              {item.title}
            </p>
          </div>
          {cgpaBadge}
        </div>
      )}

      {/* Board / Field / Department */}
      {(item.board || item.field || item.department) && (
        <div style={{ marginLeft: ml, marginTop: 6 }}>
          {item.department && (
            <p style={{ color: '#6e6e90', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={12} style={{ flexShrink: 0 }} />
              {item.department}
            </p>
          )}
          {item.board && <p style={{ color: '#6e6e90', fontSize: 13, marginTop: 3 }}>{item.board}</p>}
          {item.field && <p style={{ color: '#6e6e90', fontSize: 13, marginTop: 3 }}>{item.field}</p>}
        </div>
      )}

      {/* Achievements */}
      {item.achievements?.length > 0 && (
        <div style={{ marginLeft: ml, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Trophy style={{ width: 13, height: 13, color: '#f59e0b' }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#a5a5c0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Achievements
            </span>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.achievements.map(achievement => (
              <li key={achievement} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(245,158,11,0.5)',
                    marginTop: 7,
                    flexShrink: 0
                  }}
                />
                <span style={{ color: '#a5a5c0', fontSize: 13, lineHeight: 1.6 }}>{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {item.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, marginLeft: ml }}>
          {item.skills.map(skill => (
            <span
              key={skill}
              style={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 6,
                background: 'rgba(168,85,247,0.08)',
                color: '#a855f7',
                border: '1px solid rgba(168,85,247,0.15)'
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </>
  )

  if (isMobile) {
    return (
      <motion.div variants={staggerItem} custom={index} style={{ marginBottom: 20 }}>
        <div
          className="glass-card"
          style={{
            padding: '20px 18px',
            borderLeft: '3px solid #a855f7'
          }}
        >
          {/* Date + Location at top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span
              style={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontSize: 13,
                fontWeight: 600,
                color: '#a855f7'
              }}
            >
              {item.date.split(' - ')[0]}
            </span>
            {item.date.includes(' - ') && (
              <span
                style={{
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  fontSize: 11,
                  color: '#6e6e90'
                }}
              >
                — {item.date.split(' - ')[1]}
              </span>
            )}
            {item.location && (
              <span
                style={{
                  color: '#6e6e90',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginLeft: 'auto'
                }}
              >
                <MapPin size={11} style={{ flexShrink: 0 }} />
                {item.location.split(',')[0]}
              </span>
            )}
          </div>
          {cardContent}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      style={{ display: 'grid', gridTemplateColumns: '160px 40px 1fr', gap: 0 }}
      variants={index % 2 === 0 ? slideInLeft : slideInRight}
      custom={index}
    >
      {/* Left: Date + Location */}
      <div style={{ paddingTop: 4, textAlign: 'right', paddingRight: 20 }}>
        <span
          style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 13,
            fontWeight: 600,
            color: '#a855f7'
          }}
        >
          {item.date.split(' - ')[0]}
        </span>
        <span
          style={{
            display: 'block',
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 11,
            color: '#6e6e90',
            marginTop: 2
          }}
        >
          {item.date.includes(' - ') ? item.date.split(' - ')[1] : ''}
        </span>
        {item.location && (
          <p
            style={{
              color: '#6e6e90',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 4,
              marginTop: 12
            }}
          >
            <MapPin size={11} style={{ flexShrink: 0 }} />
            {item.location.split(',')[0]}
          </p>
        )}
      </div>

      {/* Center: Timeline track */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: '2px solid #a855f7',
            backgroundColor: 'rgba(6, 6, 16, 0.6)',
            marginTop: 6,
            position: 'relative',
            zIndex: 2,
            flexShrink: 0
          }}
        >
          <div
            className="animate-glow-pulse"
            style={{
              position: 'absolute',
              inset: 3,
              borderRadius: '50%',
              backgroundColor: '#a855f7'
            }}
          />
        </div>
        <div
          style={{
            width: 2,
            flex: 1,
            background: 'linear-gradient(to bottom, rgba(168,85,247,0.4), rgba(168,85,247,0.1))',
            borderRadius: 1
          }}
        />
      </div>

      {/* Right: Content card */}
      <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 20 }}>
        {cardContent}
      </div>
    </motion.div>
  )
}

EducationCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    institution: PropTypes.string.isRequired,
    title: PropTypes.string,
    date: PropTypes.string,
    location: PropTypes.string,
    cgpa: PropTypes.string,
    percentage: PropTypes.string,
    board: PropTypes.string,
    field: PropTypes.string,
    department: PropTypes.string,
    achievements: PropTypes.arrayOf(PropTypes.string),
    skills: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  index: PropTypes.number.isRequired,
  isMobile: PropTypes.bool.isRequired
}

const Education = () => {
  const education = useMemo(() => getEducation(), [])
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <motion.section
      id="education"
      className="py-24 px-6"
      style={{ padding: isMobile ? '64px 16px' : '96px 24px' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionRevealEnhanced}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <SectionHeader title="Education" subtitle="My academic journey" />

        <motion.div variants={staggerContainer}>
          {education.map((item, index) => (
            <EducationCard key={item.id} item={item} index={index} isMobile={isMobile} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Education
