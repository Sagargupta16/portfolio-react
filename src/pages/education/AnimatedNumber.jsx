import React, { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const AnimatedNumber = ({ value, duration = 2 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isInView) return

    // Extract number from string (e.g., "CGPA: 8.5" -> 8.5)
    const numericValue = parseFloat(value.match(/[\d.]+/)?.[0] || 0)
    
    if (numericValue === 0) {
      setDisplayValue(value)
      return
    }

    let start = 0
    const increment = numericValue / (duration * 60) // 60fps
    const timer = setInterval(() => {
      start += increment
      if (start >= numericValue) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        // Replace the number in the original string
        const animatedValue = value.replace(/[\d.]+/, start.toFixed(1))
        setDisplayValue(animatedValue)
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [isInView, value, duration])

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {displayValue}
    </motion.span>
  )
}

export default AnimatedNumber
