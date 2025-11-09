import { motion } from 'framer-motion'
import achievementsData from '../../data/achievements.json'
import { fadeInUp, staggerContainer, staggerItem, hoverScale } from '../../utils/animations'
import './achievement.css'

const Achievement = () => {
  const { certifications = [], achievements = [], coding_platform_stats = {} } = achievementsData

  return (
    <motion.section
      id="achievement"
      className="section achievement-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div
        className="container achievement__container"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h1 className="section__title" variants={fadeInUp}>
          Achievements
        </motion.h1>
        <motion.div className="achievement__block" variants={fadeInUp}>
          <motion.h2 className="section__subtitle" variants={fadeInUp}>
            Certifications
          </motion.h2>
          <motion.ul className="achievement-list" variants={staggerContainer}>
            {certifications.map(cert => (
              <motion.li key={cert.id} className="achievement-item" variants={staggerItem} whileHover={hoverScale}>
                <motion.h3 variants={fadeInUp}>{cert.name}</motion.h3>
                <motion.p variants={fadeInUp}>Type: {cert.type}</motion.p>
                <motion.p variants={fadeInUp}>Issuer: {cert.issuer}</motion.p>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
        <motion.div className="achievement__block" variants={fadeInUp}>
          <motion.h2 className="section__subtitle" variants={fadeInUp}>
            Competitions & Awards
          </motion.h2>
          <motion.ul className="achievement-list" variants={staggerContainer}>
            {achievements.map(item => (
              <motion.li key={item.id} className="achievement-item" variants={staggerItem} whileHover={hoverScale}>
                <motion.h3 variants={fadeInUp}>{item.title}</motion.h3>
                {item.organizer && <motion.p variants={fadeInUp}>Organizer: {item.organizer}</motion.p>}
                <motion.p variants={fadeInUp}>Type: {item.type}</motion.p>
                {item.certificate && (
                  <motion.span className="achievement-date" variants={fadeInUp}>
                    Certificate Available
                  </motion.span>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
        <motion.div className="achievement__block" variants={fadeInUp}>
          <motion.h2 className="section__subtitle" variants={fadeInUp}>
            Coding Platform Stats
          </motion.h2>
          <motion.ul className="achievement-list" variants={staggerContainer}>
            {Object.entries(coding_platform_stats).map(([platform, stats]) => (
              <motion.li key={platform} className="achievement-item" variants={staggerItem} whileHover={hoverScale}>
                <motion.h3 variants={fadeInUp}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</motion.h3>
                {Object.entries(stats).map(([k, v]) => (
                  <motion.p key={k} variants={fadeInUp}>
                    <strong>{k.replace(/_/g, ' ')}:</strong> {v}
                  </motion.p>
                ))}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

export default Achievement
