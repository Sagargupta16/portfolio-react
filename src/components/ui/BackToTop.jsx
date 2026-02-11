import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

const BackToTop = () => {
  const [visible, setVisible] = useState(false)

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 500)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToTop = () => {
    const hero = document.getElementById('hero')
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 50,
            width: 44,
            height: 44,
            borderRadius: 12,
            border: '1px solid rgba(6,182,212,0.3)',
            background: 'rgba(6,6,16,0.9)',
            backdropFilter: 'blur(12px)',
            color: '#06b6d4',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(6,182,212,0.6)'
            e.currentTarget.style.boxShadow = '0 0 25px rgba(6,182,212,0.2), 0 4px 20px rgba(0,0,0,0.4)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          aria-label="Back to top"
        >
          <ChevronUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default BackToTop
