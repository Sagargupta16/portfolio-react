import { useState, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, FolderGit2, Calendar, Users } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { getPersonalProjects, getCollaborativeProjects } from '@data/dataLoader'
import { sectionReveal, staggerContainer, fadeInUp } from '@utils/animations'
import useMediaQuery from '@utils/useMediaQuery'
import SectionHeader from '@components/ui/SectionHeader'

const FILTERS = ['All', 'Personal', 'Team']

const ProjectLink = ({ href, label, ariaLabel, icon: Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 500,
      color: '#a5a5c0',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(8px)',
      textDecoration: 'none',
      transition: 'all 0.2s'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.color = '#06b6d4'
      e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.color = '#a5a5c0'
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
    }}
    aria-label={ariaLabel}
  >
    <Icon size={14} />
    {label}
  </a>
)

ProjectLink.propTypes = {
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired
}

const ProjectCard = ({ data, index = 0 }) => {
  const hasGithub = data.github && data.github !== '' && data.github !== '#'
  const hasLive = data.live && data.live !== '' && data.live !== '#'
  const isCollab = data.category === 'Team'

  return (
    <motion.div
      className="glass-card"
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
        delay: index * 0.1,
        layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
      }}
    >
      {/* Accent top bar */}
      <div
        style={{
          height: 3,
          background: isCollab
            ? 'linear-gradient(to right, #a855f7, #6366f1)'
            : 'linear-gradient(to right, #06b6d4, #3b82f6)',
          borderRadius: '12px 12px 0 0'
        }}
      />

      <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header: icon + title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: isCollab ? 'rgba(168,85,247,0.1)' : 'rgba(6,182,212,0.1)',
              border: `1px solid ${isCollab ? 'rgba(168,85,247,0.2)' : 'rgba(6,182,212,0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2
            }}
          >
            <FolderGit2 size={18} style={{ color: isCollab ? '#a855f7' : '#06b6d4' }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#eeeef5', lineHeight: 1.3 }}>{data.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  color: '#6e6e90',
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace'
                }}
              >
                <Calendar size={10} style={{ flexShrink: 0 }} />
                {data.date}
              </span>
              {isCollab && data.team && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: '#a855f7',
                    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
                  }}
                >
                  <Users size={10} style={{ flexShrink: 0 }} />
                  {data.team}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Achievement badge for collaborative */}
        {isCollab && data.achievement && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.15)',
              fontSize: 11,
              fontWeight: 600,
              color: '#f59e0b',
              marginBottom: 12,
              alignSelf: 'flex-start'
            }}
          >
            {data.achievement}
          </div>
        )}

        {/* Description */}
        <p style={{ color: '#a5a5c0', fontSize: 13, lineHeight: 1.7, marginBottom: 16, flex: 1 }}>{data.description}</p>

        {/* Tech tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {data.tools_tech.map(tool => (
            <span
              key={`${data.id}-tool-${tool}`}
              style={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontSize: 10,
                padding: '3px 8px',
                borderRadius: 5,
                background: isCollab ? 'rgba(168,85,247,0.08)' : 'rgba(6,182,212,0.08)',
                color: isCollab ? '#a855f7' : '#06b6d4',
                border: `1px solid ${isCollab ? 'rgba(168,85,247,0.15)' : 'rgba(6,182,212,0.15)'}`
              }}
            >
              {tool}
            </span>
          ))}
        </div>

        {/* Links */}
        {(hasGithub || hasLive) && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              paddingTop: 14,
              borderTop: '1px solid rgba(255,255,255,0.04)'
            }}
          >
            {hasGithub && (
              <ProjectLink
                href={data.github}
                label="Source"
                ariaLabel={`View ${data.title} on GitHub`}
                icon={FaGithub}
              />
            )}
            {hasLive && (
              <ProjectLink
                href={data.live}
                label="Live Demo"
                ariaLabel={`View ${data.title} live demo`}
                icon={ExternalLink}
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

ProjectCard.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    date: PropTypes.string,
    tools_tech: PropTypes.arrayOf(PropTypes.string),
    github: PropTypes.string,
    live: PropTypes.string,
    category: PropTypes.string,
    team: PropTypes.string,
    achievement: PropTypes.string
  }).isRequired,
  index: PropTypes.number
}

const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState('All')

  const handleFilterChange = useCallback(filter => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setActiveFilter(filter)
      })
    } else {
      setActiveFilter(filter)
    }
  }, [])
  const isMobile = useMediaQuery('(max-width: 768px)')

  const personalProjects = useMemo(() => getPersonalProjects(), [])
  const collaborativeProjects = useMemo(() => getCollaborativeProjects(), [])

  const filteredProjects = useMemo(() => {
    const personal = personalProjects.map(p => ({ ...p, category: 'Personal' }))
    const collab = collaborativeProjects.map(p => ({ ...p, category: 'Team' }))

    if (activeFilter === 'Personal') return personal
    if (activeFilter === 'Team') return collab
    return [...personal, ...collab]
  }, [activeFilter, personalProjects, collaborativeProjects])

  return (
    <motion.section
      id="projects"
      className="py-24 px-6"
      style={{ padding: isMobile ? '64px 16px' : '96px 24px' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionReveal}
    >
      <SectionHeader title="Personal Projects" subtitle="Things I've built" />

      <div className="max-w-6xl mx-auto" style={{ maxWidth: 1152, margin: '0 auto' }}>
        {/* Filter buttons */}
        <motion.div
          style={{
            display: 'flex',
            gap: isMobile ? 8 : 12,
            marginBottom: 48,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
          variants={fadeInUp}
        >
          {FILTERS.map((filter, idx) => (
            <motion.button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={activeFilter === filter ? 'btn-primary' : ''}
              style={
                activeFilter === filter
                  ? {}
                  : {
                      padding: '10px 20px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      color: '#a5a5c0',
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(8px)'
                    }
              }
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.1 + idx * 0.08 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {filter}
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20
          }}
          variants={staggerContainer}
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <ProjectCard key={`${project.category}-${project.id}`} data={project} index={idx} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Portfolio
