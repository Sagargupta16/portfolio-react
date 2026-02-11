import { motion } from 'framer-motion'
import { Code2, Cloud, Terminal, Braces, Database, GitBranch } from 'lucide-react'

const orbitItems = [
  { Icon: Cloud, color: '#06b6d4', delay: 0, angle: 0 },
  { Icon: Terminal, color: '#22c55e', delay: 0.5, angle: 60 },
  { Icon: Braces, color: '#a855f7', delay: 1, angle: 120 },
  { Icon: Database, color: '#f59e0b', delay: 1.5, angle: 180 },
  { Icon: GitBranch, color: '#06b6d4', delay: 2, angle: 240 },
  { Icon: Code2, color: '#a855f7', delay: 2.5, angle: 300 }
]

const floatVariant = delay => ({
  animate: {
    y: [-8, 8, -8],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay }
  }
})

const DevAvatar = () => {
  const size = 320
  const center = size / 2
  const orbitRadius = 130

  return (
    <div style={{ width: size, height: size, position: 'relative', margin: '0 auto' }}>
      {/* Outer glow ring */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 10,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #06b6d4, #a855f7, #22c55e, #06b6d4)',
          opacity: 0.15,
          filter: 'blur(20px)'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Rotating gradient border */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 30,
          borderRadius: '50%',
          padding: 2,
          background: 'conic-gradient(from 0deg, #06b6d4, transparent 40%, #a855f7, transparent 80%, #06b6d4)'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#0a0a14'
          }}
        />
      </motion.div>

      {/* Inner circle with monogram */}
      <div
        style={{
          position: 'absolute',
          inset: 34,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #12122a, #0a0a14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 4
        }}
      >
        <motion.span
          style={{
            fontSize: 56,
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          SG
        </motion.span>
        <motion.span
          style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 11,
            color: '#22c55e',
            letterSpacing: '0.1em'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          {'> dev'}
          <span style={{ color: '#06b6d4' }}>_</span>
        </motion.span>
      </div>

      {/* Dashed orbit ring */}
      <svg style={{ position: 'absolute', inset: 0, width: size, height: size }} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={orbitRadius}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      </svg>

      {/* Orbiting icons */}
      {orbitItems.map(({ Icon, color, delay, angle }) => {
        const rad = (angle * Math.PI) / 180
        const x = center + orbitRadius * Math.cos(rad) - 18
        const y = center + orbitRadius * Math.sin(rad) - 18

        return (
          <motion.div
            key={angle}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${color}10`,
              border: `1px solid ${color}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate="animate"
            variants={floatVariant(delay)}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay * 0.3 }}
          >
            <Icon style={{ width: 16, height: 16, color }} />
          </motion.div>
        )
      })}
    </div>
  )
}

export default DevAvatar
