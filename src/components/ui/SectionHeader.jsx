import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { fadeInUp, lineGrow } from '@utils/animations'

const SectionHeader = ({ title, subtitle }) => {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 mb-16 text-center"
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
          className="inline-flex items-center gap-2 font-mono text-sm text-text-muted bg-bg-card/60 border border-border rounded-full px-4 py-1.5"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 14,
            color: '#6e6e90',
            backgroundColor: '#14142d',
            border: '1px solid #262655',
            borderRadius: 9999,
            padding: '6px 16px'
          }}
        >
          <span className="text-accent-cyan" style={{ color: '#06b6d4' }}>
            {'>'}
          </span>
          {subtitle}
        </span>
      )}
      <h2
        className="gradient-text text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
        style={{
          fontSize: '2.25rem',
          fontWeight: 700,
          letterSpacing: '-0.025em'
        }}
      >
        {title}
      </h2>
      <motion.div
        className="h-0.5 w-20 rounded-full mt-1 bg-gradient-to-r from-accent-cyan to-accent-purple"
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
