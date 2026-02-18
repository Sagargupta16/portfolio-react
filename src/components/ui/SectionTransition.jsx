import { useRef } from 'react'
import PropTypes from 'prop-types'
import { motion, useScroll, useTransform } from 'framer-motion'
import useReducedMotion from '@utils/useReducedMotion'

const GradientSweep = ({ progress }) => {
  const width = useTransform(progress, [0, 0.5, 1], ['0%', '100%', '100%'])
  const opacity = useTransform(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  return (
    <motion.div
      style={{
        height: 1,
        background: 'linear-gradient(90deg, #06b6d4, #a855f7, #06b6d4)',
        width,
        opacity,
        margin: '0 auto'
      }}
    />
  )
}

const GlowPulse = ({ progress }) => {
  const opacity = useTransform(progress, [0, 0.4, 0.6, 1], [0, 1, 1, 0])
  const scale = useTransform(progress, [0, 0.5, 1], [0.8, 1, 0.8])
  return (
    <>
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 5%, rgba(6,182,212,0.2) 50%, transparent 95%)'
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%)',
          filter: 'blur(20px)',
          opacity,
          scale
        }}
      />
    </>
  )
}

const GeometricScatter = ({ progress }) => {
  const opacity = useTransform(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const spread = useTransform(progress, [0, 0.5, 1], [0, 1, 0])
  return (
    <>
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 5%, rgba(168,85,247,0.2) 50%, transparent 95%)'
        }}
      />
      <motion.div
        style={{
          opacity,
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        {[...Array(5)].map((_, i) => (
          <GeometricDot key={i} index={i} spread={spread} />
        ))}
      </motion.div>
    </>
  )
}

const GeometricDot = ({ index, spread }) => {
  const x = useTransform(spread, v => (index - 2) * 30 * v)
  const opacity = useTransform(spread, v => 0.3 + v * 0.7)
  return (
    <motion.div
      style={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: index % 2 === 0 ? '#06b6d4' : '#a855f7',
        x,
        opacity
      }}
    />
  )
}

const Beam = ({ progress }) => {
  const x = useTransform(progress, [0, 1], ['-100%', '200%'])
  const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  return (
    <div style={{ position: 'relative', height: 1, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.04) 50%, transparent 95%)'
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: -2,
          width: 80,
          height: 5,
          borderRadius: 4,
          background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
          filter: 'blur(2px)',
          x,
          opacity
        }}
      />
    </div>
  )
}

const VARIANTS = {
  'gradient-sweep': GradientSweep,
  'glow-pulse': GlowPulse,
  'geometric-scatter': GeometricScatter,
  beam: Beam
}

const SectionTransition = ({ variant = 'gradient-sweep' }) => {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  if (reducedMotion) {
    return <div className="section-divider" />
  }

  const VariantRenderer = VARIANTS[variant] || VARIANTS['gradient-sweep']

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        height: 80,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      <div style={{ width: '100%', position: 'relative' }}>
        <VariantRenderer progress={scrollYProgress} />
      </div>
    </div>
  )
}

SectionTransition.propTypes = {
  variant: PropTypes.oneOf(['gradient-sweep', 'glow-pulse', 'geometric-scatter', 'beam'])
}

export default SectionTransition
