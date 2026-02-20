import { motion } from 'framer-motion'
import { Server } from 'lucide-react'

const SystemStatus = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 2.5 }}
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 16px',
        borderRadius: 9999,
        background: 'rgba(15, 15, 35, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        cursor: 'default'
      }}
      whileHover={{ y: -2, borderColor: 'rgba(34, 197, 94, 0.3)' }}
    >
      <Server size={14} color="#22c55e" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ position: 'relative', display: 'flex', height: 8, width: 8 }}>
          <span
            style={{
              position: 'absolute',
              display: 'inline-flex',
              height: '100%',
              width: '100%',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              opacity: 0.75,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
            }}
          />
          <span
            style={{
              position: 'relative',
              display: 'inline-flex',
              borderRadius: '50%',
              height: 8,
              width: 8,
              backgroundColor: '#22c55e'
            }}
          />
        </div>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: '#a5a5c0',
            fontWeight: 500
          }}
        >
          ALL SYSTEMS NOMINAL
        </span>
      </div>
    </motion.div>
  )
}

export default SystemStatus
