import { useRef, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import useReducedMotion from '@utils/useReducedMotion'

const GlassCard = ({
  children,
  className = '',
  style = {},
  tilt = true,
  glow = true,
  borderGlow = true,
  as = 'div',
  ...props
}) => {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback(
    e => {
      if (reducedMotion || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setMousePos({ x, y })
    },
    [reducedMotion]
  )

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setMousePos({ x: 0.5, y: 0.5 })
  }, [])

  const tiltTransform = useMemo(() => {
    if (!tilt || !isHovered || reducedMotion) return 'perspective(800px) rotateX(0deg) rotateY(0deg)'
    const rotateX = (mousePos.y - 0.5) * -8
    const rotateY = (mousePos.x - 0.5) * 8
    return `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }, [tilt, isHovered, reducedMotion, mousePos])

  const glowStyle = useMemo(() => {
    if (!glow || !isHovered || reducedMotion) return { opacity: 0 }
    return {
      opacity: 1,
      background: `radial-gradient(
        350px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%,
        rgba(6, 182, 212, 0.08),
        transparent 60%
      )`
    }
  }, [glow, isHovered, reducedMotion, mousePos])

  const Component = as === 'div' ? motion.div : motion[as] || motion.div

  return (
    <Component
      ref={ref}
      className={`glass-card ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transform: tiltTransform,
        transition: isHovered
          ? 'transform 0.15s ease-out, border-color 0.3s ease'
          : 'transform 0.4s ease-out, border-color 0.3s ease',
        willChange: isHovered ? 'transform' : 'auto',
        ...(!borderGlow || !isHovered
          ? {}
          : {
              borderColor: 'rgba(6, 182, 212, 0.2)'
            }),
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Cursor-following glow overlay */}
      {glow && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
            zIndex: 0,
            ...glowStyle
          }}
        />
      )}

      {/* Animated gradient border highlight on hover */}
      {borderGlow && isHovered && !reducedMotion && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 0,
            background: `conic-gradient(
              from ${Math.atan2(mousePos.y - 0.5, mousePos.x - 0.5) * (180 / Math.PI)}deg at ${mousePos.x * 100}% ${mousePos.y * 100}%,
              rgba(6, 182, 212, 0.3),
              transparent 40%,
              rgba(168, 85, 247, 0.2),
              transparent 70%,
              rgba(6, 182, 212, 0.3)
            )`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            padding: 1
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </Component>
  )
}

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  tilt: PropTypes.bool,
  glow: PropTypes.bool,
  borderGlow: PropTypes.bool,
  as: PropTypes.string
}

export default GlassCard
