import { motion } from 'framer-motion'
import './skill.css'
import { BsPatchCheckFill } from 'react-icons/bs'
import skills from './SkillsArray'
import { fadeInUp, staggerContainer, staggerItem, cardHover, iconBounce } from '../../utils/animations'

function Skill() {
  return (
    <motion.section id="skill" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
      <motion.h5 variants={fadeInUp}>What Skills I Have</motion.h5>
      <motion.h2 variants={fadeInUp}>My Skills</motion.h2>
      <motion.div
        className="container skill__container"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {Object.keys(skills).map((skillCategory, categoryIndex) => (
          <motion.div
            className="skill__card"
            key={skillCategory}
            variants={staggerItem}
            whileHover={cardHover.hover}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.2 }}
          >
            <h3 className="skill__title">{skillCategory}</h3>
            <motion.div
              className="skill__list"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {skills[skillCategory].sort().map((skillItem, itemIndex) => (
                <motion.div
                  key={skillItem}
                  className="skill__item"
                  variants={staggerItem}
                  whileHover={{ scale: 1.05, x: 5 }}
                  transition={{ delay: itemIndex * 0.05 }}
                >
                  <motion.div variants={iconBounce} whileHover="hover">
                    <BsPatchCheckFill className="skill__icon" />
                  </motion.div>
                  {skillItem}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

export default Skill
