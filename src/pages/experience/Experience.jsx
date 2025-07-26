import React from 'react'
import { motion } from 'framer-motion'
import './Experience.css'
import ExperienceItem from './experienceitem'
import { experienceArray, positionOfResponsibilityArray } from './ExperienceArray'
import { fadeInUp, staggerContainer, staggerItem } from '../../utils/animations'

const Experience = () => {
  return (
    <motion.section 
      id="experience"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.h5 variants={fadeInUp}>Experience I got!!</motion.h5>
      <motion.h2 variants={fadeInUp}>My Experience</motion.h2>
      <motion.div 
        className="experience__container container"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h3 className="experience__heading" variants={fadeInUp}>
          Industrial Experiece
        </motion.h3>
        {experienceArray.map((item, index) => (
          <motion.div
            key={item.id}
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
          >
            <ExperienceItem item={item} />
          </motion.div>
        ))}
      </motion.div>
      {positionOfResponsibilityArray && positionOfResponsibilityArray.length > 0 && (
        <motion.div 
          className="experience__container container"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h3 className="experience__heading" variants={fadeInUp}>
            Position of Responsibility
          </motion.h3>
          {positionOfResponsibilityArray.map((item, index) => (
            <motion.div
              key={item.id}
              variants={staggerItem}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <ExperienceItem item={item} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  )
}

export default Experience

