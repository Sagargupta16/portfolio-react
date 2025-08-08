import React from 'react'
import { motion } from 'framer-motion'

import PropTypes from 'prop-types'

const TimelineProgress = ({ totalItems, currentVisibleItem }) => {
  const progressPercentage = ((currentVisibleItem + 1) / totalItems) * 100

  return (
    <motion.div
      className="timeline-progress"
      style={{
        position: 'absolute',
        left: '20px',
        top: 0,
        width: '3px',
        height: `${progressPercentage}%`,
        background: 'linear-gradient(180deg, var(--color-primary), var(--color-primary-variant))',
        borderRadius: '2px',
        zIndex: 2
      }}
      initial={{ height: 0 }}
      animate={{ height: `${progressPercentage}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  )
}

TimelineProgress.propTypes = {
  totalItems: PropTypes.number.isRequired,
  currentVisibleItem: PropTypes.number.isRequired,
}

export default TimelineProgress
