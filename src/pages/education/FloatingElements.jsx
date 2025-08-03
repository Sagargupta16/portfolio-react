import React from 'react'
import { motion } from 'framer-motion'
import { FaGraduationCap, FaBook, FaCertificate, FaAward } from 'react-icons/fa'

const FloatingEducationElements = () => {
  const elements = [
    { icon: FaGraduationCap, delay: 0, x: 100, y: 50 },
    { icon: FaBook, delay: 0.5, x: -80, y: 100 },
    { icon: FaCertificate, delay: 1, x: 120, y: 200 },
    { icon: FaAward, delay: 1.5, x: -100, y: 300 }
  ]

  return (
    <div className="floating-elements">
      {elements.map((element, index) => {
        const IconComponent = element.icon
        return (
          <motion.div
            key={index}
            className="floating-element"
            style={{
              position: 'absolute',
              right: `${Math.abs(element.x)}px`,
              top: `${element.y}px`,
              zIndex: 0,
              opacity: 0.1,
              fontSize: '2rem',
              color: 'var(--color-primary)'
            }}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{
              opacity: 0.1,
              scale: 1,
              rotate: 0,
              y: [-10, 10, -10]
            }}
            transition={{
              opacity: { delay: element.delay, duration: 1 },
              scale: { delay: element.delay, duration: 0.8 },
              rotate: { delay: element.delay, duration: 0.8 },
              y: {
                delay: element.delay + 1,
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }}
          >
            <IconComponent />
          </motion.div>
        )
      })}
    </div>
  )
}

export default FloatingEducationElements
