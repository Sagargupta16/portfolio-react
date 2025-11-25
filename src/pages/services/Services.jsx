import { useMemo } from 'react'
import { motion } from 'framer-motion'
import ServiceItem from './serviceitem'
import { getServices } from '@data/dataLoader'
import { fadeInUp, staggerContainer, staggerItem } from '@utils/animations'
import styles from './services.module.css'

const Services = () => {
  const services = useMemo(() => getServices(), [])

  return (
    <motion.section id="services" initial="hidden" animate="visible">
      <motion.h5 variants={fadeInUp}>What I Offer</motion.h5>
      <motion.h2 variants={fadeInUp}>Services</motion.h2>
      <motion.div className={`container ${styles.services__container}`} variants={staggerContainer}>
        {services.map((item, index) => (
          <motion.div key={item.id} variants={staggerItem} custom={index} transition={{ delay: index * 0.05 }}>
            <ServiceItem item={item} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

export default Services
