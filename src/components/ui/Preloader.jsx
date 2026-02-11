import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Preloader = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#060610',
            flexDirection: 'column',
            gap: 24
          }}
        >
          {/* SG Logo with glow animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              fontSize: 48,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              color: '#06b6d4',
              letterSpacing: '0.05em',
              textShadow: '0 0 30px rgba(6,182,212,0.5), 0 0 60px rgba(6,182,212,0.25)'
            }}
          >
            {'<SG />'}
          </motion.div>

          {/* Loading bar */}
          <div
            style={{
              width: 120,
              height: 2,
              background: 'rgba(38,38,85,0.5)',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
                borderRadius: 2
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Preloader
