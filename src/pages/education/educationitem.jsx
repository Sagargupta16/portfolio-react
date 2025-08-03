import React from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { BsFillCalendarEventFill } from 'react-icons/bs'
import AnimatedNumber from './AnimatedNumber'
import { cardHover, fadeInLeft, fadeInRight, iconBounce } from '../../utils/animations'

const EducationItem = props => {
  const { item } = props
  return (
    <motion.div
      className="education__item"
      variants={cardHover}
      whileHover="hover"
      initial={{ opacity: 0, x: -50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
        type: 'spring',
        stiffness: 100
      }}
    >
      <motion.h3
        className="education__date"
        variants={fadeInLeft}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={iconBounce} whileHover="hover" style={{ display: 'inline-block', marginRight: '8px' }}>
          <BsFillCalendarEventFill />
        </motion.div>
        {item.date}
      </motion.h3>
      <motion.h4
        className="education__title"
        variants={fadeInRight}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        {item.title}
      </motion.h4>
      <motion.p
        className="education__text"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {item.text}
      </motion.p>
      <motion.p
        className="education__text"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          fontWeight: 'bold',
          color: 'var(--color-primary)',
          fontSize: '1.1em',
          display: 'inline-block',
          padding: '0.3rem 0.8rem',
          borderRadius: '15px',
          border: '1px solid var(--color-primary)',
          backgroundColor: 'rgba(77, 181, 255, 0.1)',
          backdropFilter: 'blur(5px)'
        }}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 5px 15px rgba(77, 181, 255, 0.3)',
          backgroundColor: 'rgba(77, 181, 255, 0.2)'
        }}
      >
        <AnimatedNumber value={item.cgpa} duration={1.5} />
      </motion.p>
    </motion.div>
  )
}

export default EducationItem

EducationItem.propTypes = {
  item: PropTypes.shape({
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    cgpa: PropTypes.string.isRequired
  }).isRequired
}
