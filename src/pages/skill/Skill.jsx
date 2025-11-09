import { useMemo } from 'react'
import { motion } from 'framer-motion'
import './skill.css'
import { BsPatchCheckFill } from 'react-icons/bs'
import skills from './SkillsArray'
import { fadeInUp, staggerContainer, staggerItem } from '../../utils/animations'

function Skill() {
  const skillCategories = useMemo(() => Object.entries(skills), [])

  return (
    <motion.section id="skill" initial="hidden" animate="visible">
      <motion.h5 variants={fadeInUp}>What Skills I Have</motion.h5>
      <motion.h2 variants={fadeInUp}>My Skills</motion.h2>
      <motion.div className="container skill__container" variants={staggerContainer}>
        {skillCategories.map(([skillCategory, skillItems], categoryIndex) => (
          <motion.div
            className="skill__category"
            key={skillCategory}
            variants={staggerItem}
            transition={{ delay: categoryIndex * 0.05 }}
            aria-label={`${skillCategory} skills`}
          >
            <div className="skill__category-header">
              <h3 className="skill__title">{skillCategory}</h3>
              <span className="skill__count">{skillItems.length} Skills</span>
            </div>
            <motion.div className="skill__table">
              <div className="skill__table-grid">
                {skillItems.sort().map((skillItem, itemIndex) => (
                  <motion.div
                    key={`${skillItem}-${itemIndex}`}
                    className="skill__table-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: itemIndex * 0.01 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'var(--color-primary-variant)' }}
                  >
                    <BsPatchCheckFill className="skill__icon" />
                    <span className="skill__name">{skillItem}</span>
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
