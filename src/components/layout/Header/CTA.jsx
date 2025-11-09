import { useMemo } from 'react'
import { motion } from 'framer-motion'
import CV from '../../../assets/Resume.pdf'
import { Link } from 'react-router-dom'
import { hoverScale } from '../../../utils/animations'

function CTA() {
  const isWideScreen = useMemo(() => window.innerWidth > 600, [])

  return (
    <div className="cta">
      <motion.a
        href={CV}
        download
        className="btn"
        variants={hoverScale}
        whileHover="hover"
        whileTap="tap"
        aria-label="Download CV PDF"
      >
        Download CV
      </motion.a>
      {isWideScreen ? (
        <motion.div variants={hoverScale} whileHover="hover" whileTap="tap">
          <Link to="/contact" className="btn btn-primary" aria-label="Navigate to contact page">
            Let's Talk
          </Link>
        </motion.div>
      ) : (
        <motion.a
          href="#contact"
          className="btn btn-primary"
          variants={hoverScale}
          whileHover="hover"
          whileTap="tap"
          aria-label="Scroll to contact section"
        >
          Let's Talk
        </motion.a>
      )}
    </div>
  )
}

export default CTA
