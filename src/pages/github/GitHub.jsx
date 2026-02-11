import { motion } from 'framer-motion'
import { GitHubCalendar } from 'react-github-calendar'
import { ArrowRight } from 'lucide-react'
import { fadeIn } from '@utils/animations'
import SectionHeader from '@components/ui/SectionHeader'

const GitHub = () => {
  return (
    <motion.section
      id="github"
      className="py-24 px-6"
      style={{ padding: '96px 24px' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <SectionHeader title="GitHub Activity" subtitle="My open source contributions" />

      <div className="max-w-5xl mx-auto text-center" style={{ maxWidth: 1024, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          className="glass-card p-6 md:p-10 overflow-x-auto"
          style={{ padding: '24px 40px', overflowX: 'auto' }}
          variants={fadeIn}
        >
          <GitHubCalendar username="Sagargupta16" colorScheme="dark" />
        </motion.div>

        <motion.a
          href="https://github.com/Sagargupta16"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-8 text-accent-cyan hover:underline text-sm font-mono font-medium"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 32,
            color: '#06b6d4',
            fontSize: 14,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontWeight: 500
          }}
          variants={fadeIn}
        >
          View Full Profile
          <ArrowRight className="w-4 h-4" />
        </motion.a>
      </div>
    </motion.section>
  )
}

export default GitHub
