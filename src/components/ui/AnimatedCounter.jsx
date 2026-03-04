import { useState, useEffect, useRef, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import PropTypes from 'prop-types'

const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  })

  const { numericValue, suffix } = useMemo(() => {
    const str = String(value)
    let i = 0
    while (i < str.length && str[i] >= '0' && str[i] <= '9') i++
    if (i > 0) {
      return {
        numericValue: Number.parseInt(str.slice(0, i), 10),
        suffix: str.slice(i)
      }
    }
    return { numericValue: 0, suffix: str }
  }, [value])

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()
    const durationMs = duration * 1000

    const animate = currentTime => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / durationMs, 1)

      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * numericValue)

      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [inView, numericValue, duration])

  return (
    <span ref={ref} className="font-mono text-3xl font-bold text-accent-cyan glow-cyan-text">
      {count}
      {suffix && <span className="text-accent-cyan/70">{suffix}</span>}
    </span>
  )
}

AnimatedCounter.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  duration: PropTypes.number
}

export default AnimatedCounter
