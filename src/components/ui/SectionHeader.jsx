import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { fadeInUp, lineGrow } from '@utils/animations'

const SectionHeader = ({ title, subtitle }) => {
  return (
    <motion.div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        marginBottom: 64,
        textAlign: 'center'
      }}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {subtitle && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 14,
            color: '#6e6e90',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 9999,
            padding: '6px 16px'
          }}
        >
          <span style={{ color: '#06b6d4' }}>{'>'}</span>
          {subtitle}
        </span>
      )}
      <h2
        className="gradient-text"
        style={{
          fontSize: '2.25rem',
          fontWeight: 700,
          letterSpacing: '-0.025em'
        }}
      >
        {title}
      </h2>
      <motion.div
        style={{
          height: 2,
          width: 80,
          borderRadius: 9999,
          marginTop: 4,
          background: 'linear-gradient(to right, #06b6d4, #a855f7)'
        }}
        variants={lineGrow}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      />
    </motion.div>
  )
}

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string
}

export default SectionHeader
