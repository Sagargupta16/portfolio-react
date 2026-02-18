import { motion, useScroll, useTransform } from 'framer-motion'
import useReducedMotion from '@utils/useReducedMotion'
import useMediaQuery from '@utils/useMediaQuery'

const ELEMENTS = [
  // Triangles
  { type: 'triangle', top: '12%', left: '8%', size: 14, color: 'rgba(6,182,212,0.12)', speed: -180, rotation: 15 },
  { type: 'triangle', top: '65%', right: '6%', size: 18, color: 'rgba(168,85,247,0.10)', speed: -250, rotation: -30 },
  // Circles
  { type: 'circle', top: '28%', right: '12%', size: 8, color: 'rgba(6,182,212,0.15)', speed: -120 },
  { type: 'circle', top: '78%', left: '15%', size: 6, color: 'rgba(236,72,153,0.12)', speed: -300 },
  // Rings
  { type: 'ring', top: '45%', left: '5%', size: 20, color: 'rgba(168,85,247,0.08)', speed: -200 },
  { type: 'ring', top: '88%', right: '10%', size: 16, color: 'rgba(6,182,212,0.08)', speed: -350 },
  // Hexagons (diamond approximation)
  { type: 'diamond', top: '35%', right: '4%', size: 10, color: 'rgba(34,197,94,0.10)', speed: -160 },
  { type: 'diamond', top: '55%', left: '10%', size: 12, color: 'rgba(245,158,11,0.08)', speed: -280 }
]

const ShapeRenderer = ({ type, size, color, rotation = 0 }) => {
  if (type === 'triangle') {
    return (
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
          transform: `rotate(${rotation}deg)`
        }}
      />
    )
  }

  if (type === 'circle') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color
        }}
      />
    )
  }

  if (type === 'ring') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          background: 'transparent'
        }}
      />
    )
  }

  if (type === 'diamond') {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: color,
          transform: `rotate(45deg)`
        }}
      />
    )
  }

  return null
}

const ParallaxElement = ({ element }) => {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, element.speed])

  const position = {
    position: 'absolute',
    top: element.top,
    left: element.left,
    right: element.right
  }

  return (
    <motion.div style={{ ...position, y }}>
      <ShapeRenderer type={element.type} size={element.size} color={element.color} rotation={element.rotation} />
    </motion.div>
  )
}

const ParallaxElements = () => {
  const reducedMotion = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (reducedMotion || isMobile) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {ELEMENTS.map((el, i) => (
        <ParallaxElement key={i} element={el} />
      ))}
    </div>
  )
}

export default ParallaxElements
