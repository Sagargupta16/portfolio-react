import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, staggerItem } from '@utils/animations'
import { BsPatchCheckFill } from 'react-icons/bs'
import skills from './SkillsArray'
import styles from './skill.module.css'

function Skill() {
  const skillCategories = useMemo(() => Object.entries(skills), [])

  return (
    <motion.section id="skill" initial="hidden" animate="visible">
      <motion.h5 variants={fadeInUp}>What Skills I Have</motion.h5>
      <motion.h2 variants={fadeInUp}>My Skills</motion.h2>
      <motion.div className={`container ${styles.skill__container}`} variants={staggerContainer}>
        {skillCategories.map(([skillCategory, skillItems], categoryIndex) => (
          <motion.div
            className={styles.skill__category}
            key={skillCategory}
            variants={staggerItem}
            transition={{ delay: categoryIndex * 0.05 }}
            aria-label={`${skillCategory} skills`}
          >
            <div className={styles['skill__category-header']}>
              <h3 className={styles.skill__title}>{skillCategory}</h3>
              <span className={styles.skill__count}>{skillItems.length} Skills</span>
            </div>
            <motion.div className={styles.skill__table}>
              <div className={styles['skill__table-grid']}>
                {skillItems.sort().map((skillItem, itemIndex) => (
                  <motion.div
                    key={`${skillItem}-${itemIndex}`}
                    className={styles['skill__table-item']}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: itemIndex * 0.01 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'var(--color-primary-variant)' }}
                  >
                    <BsPatchCheckFill className={styles.skill__icon} />
                    <span className={styles.skill__name}>{skillItem}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

export default Skill
