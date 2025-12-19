import { useMemo } from 'react'
import { motion } from 'framer-motion'
import achievementsData from '@data/achievements.json'
import { fadeInUp, staggerContainer, staggerItem, hoverScale } from '@utils/animations'
import styles from './achievement.module.css'

const Achievement = () => {
  const { certifications = [], achievements = [], coding_platform_stats = {} } = achievementsData

  const hasCertifications = useMemo(() => certifications.length > 0, [certifications.length])
  const hasAchievements = useMemo(() => achievements.length > 0, [achievements.length])
  const hasCodingStats = useMemo(() => Object.keys(coding_platform_stats).length > 0, [coding_platform_stats])
  const platformEntries = useMemo(() => Object.entries(coding_platform_stats), [coding_platform_stats])

  return (
    <motion.section
      id="achievement"
      className={`section ${styles['achievement-section']}`}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={`container ${styles.achievement__container}`} variants={staggerContainer}>
        <motion.h1 className="section__title" variants={fadeInUp}>
          Achievements
        </motion.h1>

        {hasCertifications && (
          <motion.div className={styles.achievement__block} variants={fadeInUp}>
            <motion.h2 className="section__subtitle" variants={fadeInUp}>
              Certifications
            </motion.h2>
            <motion.ul className={styles['achievement-list']} variants={staggerContainer}>
              {certifications.map(cert => (
                <motion.li
                  key={cert.id}
                  className={styles['achievement-item']}
                  variants={staggerItem}
                  whileHover={hoverScale}
                >
                  <motion.h3 variants={fadeInUp}>{cert.name}</motion.h3>
                  <motion.p variants={fadeInUp}>Issuer: {cert.issuer}</motion.p>
                  {cert.level && <motion.p variants={fadeInUp}>Level: {cert.level}</motion.p>}
                  {cert.issueDate && <motion.p variants={fadeInUp}>Issued: {cert.issueDate}</motion.p>}
                  {cert.expiryDate && <motion.p variants={fadeInUp}>Expires: {cert.expiryDate}</motion.p>}
                  {cert.credentialUrl && (
                    <motion.p variants={fadeInUp}>
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                        View Credential
                      </a>
                    </motion.p>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}

        {hasAchievements && (
          <motion.div className={styles.achievement__block} variants={fadeInUp}>
            <motion.h2 className="section__subtitle" variants={fadeInUp}>
              Competitions & Awards
            </motion.h2>
            <motion.ul className={styles['achievement-list']} variants={staggerContainer}>
              {achievements.map(item => (
                <motion.li
                  key={item.id}
                  className={styles['achievement-item']}
                  variants={staggerItem}
                  whileHover={hoverScale}
                >
                  <motion.h3 variants={fadeInUp}>{item.title}</motion.h3>
                  {item.organizer && <motion.p variants={fadeInUp}>Organizer: {item.organizer}</motion.p>}
                  {item.date && <motion.p variants={fadeInUp}>Date: {item.date}</motion.p>}
                  {item.description && <motion.p variants={fadeInUp}>{item.description}</motion.p>}
                  {item.certificate && (
                    <motion.span className={styles['achievement-date']} variants={fadeInUp}>
                      Certificate Available
                    </motion.span>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}

        {hasCodingStats && (
          <motion.div className={styles.achievement__block} variants={fadeInUp}>
            <motion.h2 className="section__subtitle" variants={fadeInUp}>
              Coding Platform Stats
            </motion.h2>
            <motion.ul className={styles['achievement-list']} variants={staggerContainer}>
              {platformEntries.map(([platform, stats]) => (
                <motion.li
                  key={platform}
                  className={styles['achievement-item']}
                  variants={staggerItem}
                  whileHover={hoverScale}
                >
                  <motion.h3 variants={fadeInUp}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</motion.h3>
                  {Object.entries(stats).map(([k, v]) => (
                    <motion.p key={k} variants={fadeInUp}>
                      <strong>{k.replaceAll('_', ' ')}:</strong> {v}
                    </motion.p>
                  ))}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </motion.div>
    </motion.section>
  )
}

export default Achievement
