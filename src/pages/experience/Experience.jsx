import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown, ChevronUp, Building2, FolderGit2 } from 'lucide-react'
import { getExperience, getPositionsOfResponsibility } from '@data/dataLoader'
import { sectionReveal, staggerContainer, staggerItem, fadeInUp } from '@utils/animations'
import useMediaQuery from '@utils/useMediaQuery'
import SectionHeader from '@components/ui/SectionHeader'

const TimelineCard = ({ item, index, accentColor = '#06b6d4', isMobile }) => {
  const [expanded, setExpanded] = useState(false)

  const hasProjects = item.projects?.length > 0

  const descriptionItems = useMemo(() => Object.values(item.description || {}), [item.description])

  const hasExpandable = hasProjects || descriptionItems.length > 0 || item.skills?.length > 0

  const ml = isMobile ? 0 : 38
  const descSize = isMobile ? 13 : 14

  const renderBullets = (items, gap = 8, extraStyle = undefined) => (
    <ul style={{ display: 'flex', flexDirection: 'column', gap, ...extraStyle }}>
      {items.map(desc => (
        <li
          key={desc}
          style={{
            color: '#a5a5c0',
            fontSize: descSize,
            lineHeight: 1.7,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: `${accentColor}60`,
              marginTop: 8,
              flexShrink: 0
            }}
          />
          {desc}
        </li>
      ))}
    </ul>
  )

  const renderSkills = (skills, extraStyle) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, ...extraStyle }}>
      {skills.map(skill => (
        <span
          key={skill}
          style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 11,
            padding: '3px 10px',
            borderRadius: 6,
            background: `${accentColor}10`,
            color: accentColor,
            border: `1px solid ${accentColor}20`
          }}
        >
          {skill}
        </span>
      ))}
    </div>
  )

  const cardContent = (
    <>
      {/* Company row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Building2 style={{ width: 14, height: 14, color: accentColor }} />
        </div>
        <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#eeeef5', lineHeight: 1.3 }}>
          {item.company}
        </h3>
      </div>

      {/* Title + Position */}
      <p style={{ color: '#a855f7', fontWeight: 600, fontSize: isMobile ? 14 : 15, marginTop: 4, marginLeft: ml }}>
        {item.title}
        {item.position && (
          <span
            className="tag tag-purple"
            style={{ marginLeft: 10, verticalAlign: 'middle', fontSize: 11, padding: '2px 8px' }}
          >
            {item.position}
          </span>
        )}
      </p>

      {/* Summary (always visible) */}
      {item.summary && (
        <p style={{ color: '#a5a5c0', fontSize: 13, lineHeight: 1.6, marginTop: 8, marginLeft: ml }}>{item.summary}</p>
      )}

      {/* Expandable Section */}
      {hasExpandable && (
        <>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden', marginLeft: ml }}
              >
                {/* Multi-project: project names + descriptions + skills */}
                {hasProjects &&
                  item.projects.map((project, idx) => {
                    const descs = Object.values(project.description || {})
                    return (
                      <div
                        key={project.name}
                        style={{
                          marginTop: idx === 0 ? 16 : 20,
                          paddingTop: idx === 0 ? 0 : 16,
                          borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)'
                        }}
                      >
                        <p
                          style={{
                            color: '#6e6e90',
                            fontSize: 13,
                            marginBottom: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <FolderGit2 size={12} style={{ flexShrink: 0, color: '#6e6e90' }} />
                          {project.name}
                        </p>
                        {descs.length > 0 && renderBullets(descs)}
                        {project.skills?.length > 0 && renderSkills(project.skills, { marginTop: 12 })}
                      </div>
                    )
                  })}

                {/* Single project: name + descriptions + skills */}
                {!hasProjects && item.project && (
                  <p
                    style={{
                      color: '#6e6e90',
                      fontSize: 13,
                      marginTop: 16,
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <FolderGit2 size={12} style={{ flexShrink: 0, color: '#6e6e90' }} />
                    {item.project}
                  </p>
                )}
                {!hasProjects && descriptionItems.length > 0 && renderBullets(descriptionItems, 10, { marginTop: 16 })}
                {!hasProjects && item.skills?.length > 0 && renderSkills(item.skills, { marginTop: 16 })}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setExpanded(prev => !prev)}
            style={{
              color: accentColor,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              marginTop: 14,
              marginLeft: ml,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: 0
            }}
          >
            {expanded ? (
              <>
                Show less <ChevronUp size={14} />
              </>
            ) : (
              <>
                Show more <ChevronDown size={14} />
              </>
            )}
          </button>
        </>
      )}
    </>
  )

  if (isMobile) {
    return (
      <motion.div variants={staggerItem} custom={index} style={{ marginBottom: 16 }}>
        <div
          className="glass-card"
          style={{
            padding: '20px 18px',
            borderLeft: `3px solid ${accentColor}`,
            borderRadius: '0 12px 12px 0'
          }}
        >
          {/* Mobile date + location row */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <span
              style={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontSize: 12,
                fontWeight: 600,
                color: accentColor
              }}
            >
              {item.date}
            </span>
            {item.location && (
              <span
                style={{
                  color: '#6e6e90',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <MapPin size={10} style={{ flexShrink: 0 }} />
                {item.location}
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
      variants={staggerItem}
      custom={index}
    >
      {/* Left: Date + Location */}
      <div style={{ paddingTop: 4, textAlign: 'right', paddingRight: 20 }}>
        <span
          style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 13,
            fontWeight: 600,
            color: accentColor
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
            {item.location}
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
            border: `2px solid ${accentColor}`,
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
              backgroundColor: accentColor
            }}
          />
        </div>
        <div
          style={{
            width: 2,
            flex: 1,
            background: `linear-gradient(to bottom, ${accentColor}40, ${accentColor}10)`,
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

TimelineCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    company: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string,
    location: PropTypes.string,
    position: PropTypes.string,
    summary: PropTypes.string,
    project: PropTypes.string,
    projects: PropTypes.arrayOf(PropTypes.object),
    description: PropTypes.object,
    skills: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  index: PropTypes.number.isRequired,
  accentColor: PropTypes.string,
  isMobile: PropTypes.bool.isRequired
}

const Experience = () => {
  const experienceArray = getExperience()
  const positionsArray = getPositionsOfResponsibility()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const hasPositions = useMemo(() => positionsArray?.length > 0, [positionsArray])

  return (
    <motion.section
      id="experience"
      className="py-24 px-6"
      style={{ padding: isMobile ? '64px 16px' : '96px 24px' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionReveal}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <SectionHeader title="Experience" subtitle="Where I've worked" />

        {/* Professional Experience */}
        <motion.div variants={staggerContainer}>
          {experienceArray.map((item, index) => (
            <TimelineCard key={item.id} item={item} index={index} accentColor="#06b6d4" isMobile={isMobile} />
          ))}
        </motion.div>

        {/* Positions of Responsibility */}
        {hasPositions && (
          <>
            <motion.h3
              variants={fadeInUp}
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#eeeef5',
                marginTop: 48,
                marginBottom: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div
                style={{
                  height: 28,
                  width: 4,
                  borderRadius: 9999,
                  background: 'linear-gradient(to bottom, #a855f7, rgba(168,85,247,0.3))'
                }}
              />
              Positions of Responsibility
            </motion.h3>

            <motion.div variants={staggerContainer}>
              {positionsArray.map((item, index) => (
                <TimelineCard key={item.id} item={item} index={index} accentColor="#a855f7" isMobile={isMobile} />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </motion.section>
  )
}

export default Experience
