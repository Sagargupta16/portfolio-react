import { motion } from 'framer-motion'
import EducationItem from './educationitem'
import educationArray from './EducationArray'
import FloatingEducationElements from './FloatingElements'
import { fadeInUp, staggerContainer, staggerItem } from '@utils/animations'
import styles from './education.module.css'

const SECTION_STYLE = { position: 'relative', overflow: 'hidden' }

const Education = () => {
  return (
    <motion.section id="education" initial="hidden" animate="visible" style={SECTION_STYLE}>
      <FloatingEducationElements />
      <motion.h5 variants={fadeInUp}>What Qualifications I Have</motion.h5>
      <motion.h2 variants={fadeInUp}>My Education</motion.h2>
      <motion.div className={`container ${styles.education__container}`} variants={staggerContainer}>
        {educationArray.map((item, index) => (
          <motion.div key={item.id} variants={staggerItem} custom={index} transition={{ delay: index * 0.05 }}>
            <EducationItem item={item} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

export default Education
