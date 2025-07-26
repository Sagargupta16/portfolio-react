import React from 'react'
import { motion } from 'framer-motion'
import './Education.css'
import EducationItem from './educationitem'
import educationArray from './EducationArray'
import FloatingEducationElements from './FloatingElements'
import { fadeInUp, staggerContainer, staggerItem } from '../../utils/animations'

const Education = () => {
  return (
    <motion.section 
      id="education"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <FloatingEducationElements />
      <motion.h5 variants={fadeInUp}>What Qualifications I Have</motion.h5>
      <motion.h2 variants={fadeInUp}>My Education</motion.h2>
      <motion.div 
        className="container education__container"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {educationArray.map((item, index) => (
          <motion.div
            key={item.id}
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: index * 0.3 }}
          >
            <EducationItem item={item} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

export default Education

