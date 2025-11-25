import { useMemo } from 'react'
import { motion } from 'framer-motion'
import ExperienceItem from './experienceitem'
import { getExperience, getPositionsOfResponsibility } from '@data/dataLoader'
import { fadeInUp, staggerContainer, staggerItem } from '@utils/animations'
import styles from './experience.module.css'

const Experience = () => {
  const experienceArray = getExperience()
  const positionOfResponsibilityArray = getPositionsOfResponsibility()

  const hasResponsibilities = useMemo(() => positionOfResponsibilityArray?.length > 0, [positionOfResponsibilityArray])

  return (
    <motion.section id="experience" initial="hidden" animate="visible">
      <motion.h5 variants={fadeInUp}>Experience I got!!</motion.h5>
      <motion.h2 variants={fadeInUp}>My Experience</motion.h2>
      <motion.div className={`${styles.experience__container} container`} variants={staggerContainer}>
        <motion.h3 className={styles.experience__heading} variants={fadeInUp}>
          Industrial Experience
        </motion.h3>
        {experienceArray.map((item, index) => (
          <motion.div key={item.id} variants={staggerItem} custom={index} transition={{ delay: index * 0.05 }}>
            <ExperienceItem item={item} />
          </motion.div>
        ))}
      </motion.div>
      {hasResponsibilities && (
        <motion.div className={`${styles.experience__container} container`} variants={staggerContainer}>
          <motion.h3 className={styles.experience__heading} variants={fadeInUp}>
            Position of Responsibility
          </motion.h3>
          {positionOfResponsibilityArray.map((item, index) => (
            <motion.div key={item.id} variants={staggerItem} custom={index} transition={{ delay: index * 0.05 }}>
              <ExperienceItem item={item} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  )
}

export default Experience
