import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Trophy, ExternalLink, BookOpen, ArrowUpRight } from 'lucide-react'
import { getCertifications, getLearningBadges, getAchievements, getCodingPlatformStats } from '@data/dataLoader'
import { fadeInUp, staggerContainer } from '@utils/animations'
import useMediaQuery from '@utils/useMediaQuery'
import SectionHeader from '@components/ui/SectionHeader'
import AnimatedCounter from '@components/ui/AnimatedCounter'

const LEVEL_ORDER = { Foundational: 0, Associate: 1, Professional: 2 }

const Achievement = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const rawCertifications = useMemo(() => getCertifications(), [])
  const learningBadges = useMemo(() => getLearningBadges(), [])
  const achievements = useMemo(() => getAchievements(), [])
  const codingStats = useMemo(() => getCodingPlatformStats(), [])
  const platformEntries = useMemo(() => Object.entries(codingStats), [codingStats])

  const certifications = useMemo(
    () => [...rawCertifications].sort((a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)),
    [rawCertifications]
  )

  const formatStatLabel = key => key.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())

  const isNumericStat = value => /^\d/.test(String(value))

  return (
    <motion.section
      id="achievements"
      className="py-24 px-6"
      style={{ padding: isMobile ? '64px 16px' : '96px 24px' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <SectionHeader title="Achievements" subtitle="Milestones & certifications" />

      <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 56 }}>
        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <motion.h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#eeeef5',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
              variants={fadeInUp}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(6,182,212,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck style={{ width: 18, height: 18, color: '#06b6d4' }} />
              </div>
              Certifications
              <span style={{ fontSize: 13, fontWeight: 500, color: '#6e6e90', marginLeft: 4 }}>
                ({certifications.length})
              </span>
            </motion.h3>
            <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} variants={staggerContainer}>
              {certifications.map(cert => (
                <motion.div
                  key={cert.credentialId}
                  className="glass-card"
                  style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16
                  }}
                  variants={fadeInUp}
                >
                  {cert.imageUrl ? (
                    <img
                      src={cert.imageUrl}
                      alt={cert.name}
                      loading="lazy"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        objectFit: 'contain',
                        flexShrink: 0,
                        background: 'rgba(255,255,255,0.03)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: 'rgba(6,182,212,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <ShieldCheck style={{ width: 20, height: 20, color: '#06b6d4' }} />
                    </div>
                  )}
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#eeeef5', flex: 1, lineHeight: 1.4 }}>
                    {cert.name}
                  </span>
                  {cert.level && (
                    <span className="tag tag-purple" style={{ flexShrink: 0 }}>
                      {cert.level}
                    </span>
                  )}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#06b6d4',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 8
                      }}
                      title="View Credential"
                    >
                      <ExternalLink style={{ width: 16, height: 16 }} />
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Learning Badges */}
        {learningBadges.length > 0 && (
          <div>
            <motion.h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#eeeef5',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
              variants={fadeInUp}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(168,85,247,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BookOpen style={{ width: 18, height: 18, color: '#a855f7' }} />
              </div>
              Learning & Training Badges
              <span style={{ fontSize: 13, fontWeight: 500, color: '#6e6e90', marginLeft: 4 }}>
                ({learningBadges.length})
              </span>
            </motion.h3>
            <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} variants={staggerContainer}>
              {learningBadges.map(badge => (
                <motion.div
                  key={badge.credentialId}
                  className="glass-card"
                  style={{
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14
                  }}
                  variants={fadeInUp}
                >
                  {badge.imageUrl ? (
                    <img
                      src={badge.imageUrl}
                      alt={badge.name}
                      loading="lazy"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        objectFit: 'contain',
                        flexShrink: 0,
                        background: 'rgba(255,255,255,0.03)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: 'rgba(168,85,247,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <BookOpen style={{ width: 14, height: 14, color: '#a855f7' }} />
                    </div>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#eeeef5', flex: 1, lineHeight: 1.4 }}>
                    {badge.name}
                  </span>
                  {badge.credentialUrl && (
                    <a
                      href={badge.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#a855f7',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 6
                      }}
                      title="View Credential"
                    >
                      <ExternalLink style={{ width: 14, height: 14 }} />
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Coding Platform Stats */}
        {platformEntries.length > 0 && (
          <div>
            <motion.h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#eeeef5',
                marginBottom: 24,
                textAlign: 'center'
              }}
              variants={fadeInUp}
            >
              Coding Platforms
            </motion.h3>
            <motion.div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 24
              }}
              variants={staggerContainer}
            >
              {platformEntries.map(([platform, stats]) => (
                <motion.div
                  key={platform}
                  className="glass-card"
                  style={{ padding: 28, textAlign: 'center' }}
                  variants={fadeInUp}
                >
                  <h4
                    className="gradient-text"
                    style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textTransform: 'capitalize' }}
                  >
                    {platform}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {Object.entries(stats)
                      .filter(([key]) => key !== 'username' && key !== 'profile_url')
                      .map(([key, value]) => (
                        <div key={`${platform}-${key}`}>
                          {isNumericStat(value) ? (
                            <AnimatedCounter value={String(value)} />
                          ) : (
                            <span
                              className="glow-cyan-text"
                              style={{
                                color: '#06b6d4',
                                fontSize: '1.875rem',
                                fontWeight: 700,
                                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                                display: 'block'
                              }}
                            >
                              {value}
                            </span>
                          )}
                          <span
                            style={{
                              color: '#6e6e90',
                              fontSize: 12,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 500,
                              marginTop: 4,
                              display: 'block'
                            }}
                          >
                            {formatStatLabel(key)}
                          </span>
                        </div>
                      ))}
                  </div>
                  {stats.profile_url && (
                    <a
                      href={stats.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 18,
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#06b6d4',
                        border: '1px solid rgba(6,182,212,0.25)',
                        background: 'rgba(6,182,212,0.06)',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(6,182,212,0.15)'
                        e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(6,182,212,0.15)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(6,182,212,0.06)'
                        e.currentTarget.style.borderColor = 'rgba(6,182,212,0.25)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      aria-label={`View ${platform} profile`}
                    >
                      View Profile
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Competition Wins */}
        {achievements.length > 0 && (
          <div>
            <motion.h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#eeeef5',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
              variants={fadeInUp}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(245,158,11,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trophy style={{ width: 18, height: 18, color: '#f59e0b' }} />
              </div>
              Competitions & Awards
            </motion.h3>
            <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} variants={staggerContainer}>
              {achievements.map(item => (
                <motion.div
                  key={item.id}
                  className="glass-card"
                  style={{
                    padding: isMobile ? '14px 16px' : '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap'
                  }}
                  variants={fadeInUp}
                >
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: '#eeeef5', flex: 1, minWidth: 200 }}>
                    {item.title}
                  </h4>
                  {item.organizer && (
                    <span style={{ color: '#06b6d4', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                      {item.organizer}
                    </span>
                  )}
                  {item.date && (
                    <span className="tag tag-cyan" style={{ flexShrink: 0 }}>
                      {item.date}
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </motion.section>
  )
}

export default Achievement
