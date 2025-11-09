import { motion } from 'framer-motion'
import CV from '../../../assets/Resume.pdf'
import { Link } from 'react-router-dom'
import { hoverScale } from '../../../utils/animations'

function CTA() {
  return (
    <div className="cta">
      <motion.a href={CV} download className="btn" variants={hoverScale} whileHover="hover" whileTap="tap">
        Download CV
      </motion.a>
      {window.screen.width > 600 ? (
        <motion.div variants={hoverScale} whileHover="hover" whileTap="tap">
          <Link to="/contact" className="btn btn-primary">
            Let's Talk
          </Link>
        </motion.div>
      ) : (
        <motion.a href="#contact" className="btn btn-primary" variants={hoverScale} whileHover="hover" whileTap="tap">
          Let's Talk
        </motion.a>
      )}
    </div>
  )
}

export default CTA
