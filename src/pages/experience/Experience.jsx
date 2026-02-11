import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown, ChevronUp, Building2, FolderGit2 } from 'lucide-react'
import { getExperience, getPositionsOfResponsibility } from '@data/dataLoader'
import { sectionReveal, staggerContainer, staggerItem, fadeInUp } from '@utils/animations'
import SectionHeader from '@components/ui/SectionHeader'

const TimelineCard = ({ item, index, accentColor = '#06b6d4' }) => {
  const [expanded, setExpanded] = useState(false)

  const hasProjects = item.projects?.length > 0

  const descriptionItems = useMemo(() => Object.values(item.description || {}), [item.description])

  const hasExpandable = hasProjects || descriptionItems.length > 0 || item.skills?.length > 0

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
        {/* Dot */}
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: `2px solid ${accentColor}`,
            backgroundColor: '#060610',
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
        {/* Line */}
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
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#eeeef5', lineHeight: 1.3 }}>{item.company}</h3>
        </div>

        {/* Title + Position */}
        <p style={{ color: '#a855f7', fontWeight: 600, fontSize: 15, marginTop: 4, marginLeft: 38 }}>
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
          <p style={{ color: '#a5a5c0', fontSize: 13, lineHeight: 1.6, marginTop: 8, marginLeft: 38 }}>
            {item.summary}
          </p>
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
                  style={{ overflow: 'hidden', marginLeft: 38 }}
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
                            borderTop: idx === 0 ? 'none' : '1px solid rgba(38,38,85,0.3)'
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
                          {descs.length > 0 && (
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {descs.map(desc => (
                                <li
                                  key={desc}
                                  style={{
                                    color: '#a5a5c0',
                                    fontSize: 14,
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
                          )}
                          {project.skills?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                              {project.skills.map(skill => (
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
                          )}
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
                  {!hasProjects && descriptionItems.length > 0 && (
                    <ul style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {descriptionItems.map(desc => (
                        <li
                          key={desc}
                          style={{
                            color: '#a5a5c0',
                            fontSize: 14,
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
                  )}

                  {!hasProjects && item.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
                      {item.skills.map(skill => (
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
                  )}
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
                marginLeft: 38,
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
      </div>
    </motion.div>
  )
}

const Experience = () => {
  const experienceArray = getExperience()
  const positionsArray = getPositionsOfResponsibility()

  const hasPositions = useMemo(() => positionsArray?.length > 0, [positionsArray])

  return (
    <motion.section
      id="experience"
      className="py-24 px-6"
      style={{ padding: '96px 24px' }}
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
            <TimelineCard key={item.id} item={item} index={index} accentColor="#06b6d4" />
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
                <TimelineCard key={item.id} item={item} index={index} accentColor="#a855f7" />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </motion.section>
  )
}

export default Experience
