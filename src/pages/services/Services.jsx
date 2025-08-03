import React from 'react'
import { motion } from 'framer-motion'
import './Services.css'
import ServiceItem from './serviceitem'
import { getServices } from '../../data/dataLoader'
import { fadeInUp, staggerContainer, staggerItem } from '../../utils/animations'

const Services = () => {
  const services = getServices()

  return (
    <motion.section id="services" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
      <motion.h5 variants={fadeInUp}>What I Offer</motion.h5>
      <motion.h2 variants={fadeInUp}>Services</motion.h2>
      <motion.div
        className="container services__container"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {services.map((item, index) => (
          <motion.div
            key={item.id}
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
          >
            <ServiceItem item={item} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

export default Services
