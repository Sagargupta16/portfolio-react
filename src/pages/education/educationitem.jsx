import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { BsFillCalendarEventFill } from 'react-icons/bs'
import AnimatedNumber from './AnimatedNumber'
import { cardHover, fadeInLeft, fadeInRight, iconBounce } from '@utils/animations'
import styles from './education.module.css'

const SINGLE_VIEWPORT = { once: true }
const CARD_TRANSITION = {
  duration: 0.6,
  ease: 'easeOut',
  type: 'spring',
  stiffness: 100
}

const CGPA_STYLE = {
  fontWeight: 'bold',
  color: 'var(--color-primary)',
  fontSize: '1.1em',
  display: 'inline-block',
  padding: '0.3rem 0.8rem',
  borderRadius: '15px',
  border: '1px solid var(--color-primary)',
  backgroundColor: 'rgba(77, 181, 255, 0.1)',
  backdropFilter: 'blur(5px)'
}

const CGPA_HOVER = {
  scale: 1.05,
  boxShadow: '0 5px 15px rgba(77, 181, 255, 0.3)',
  backgroundColor: 'rgba(77, 181, 255, 0.2)'
}

const EducationItem = ({ item }) => {
  const { date, title, text, cgpa } = item

  return (
    <motion.article
      className={styles.education__item}
      variants={cardHover}
      whileHover="hover"
      initial={{ opacity: 0, x: -50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={CARD_TRANSITION}
      aria-label={`${title} education details`}
    >
      <motion.h3
        className={styles.education__date}
        variants={fadeInLeft}
        initial="hidden"
        whileInView="visible"
        viewport={SINGLE_VIEWPORT}
      >
        <motion.div
          variants={iconBounce}
          whileHover="hover"
          style={{ display: 'inline-block', marginRight: '8px' }}
          aria-hidden="true"
        >
          <BsFillCalendarEventFill />
        </motion.div>
        {date}
      </motion.h3>
      <motion.h4
        className={styles.education__title}
        variants={fadeInRight}
        initial="hidden"
        whileInView="visible"
        viewport={SINGLE_VIEWPORT}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h4>
      <motion.p
        className={styles.education__text}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={SINGLE_VIEWPORT}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {text}
      </motion.p>
      <motion.p
        className="education__text"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={SINGLE_VIEWPORT}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={CGPA_STYLE}
        whileHover={CGPA_HOVER}
        aria-label={`CGPA: ${cgpa}`}
      >
        <AnimatedNumber value={cgpa} duration={1.5} />
      </motion.p>
    </motion.article>
  )
}

EducationItem.propTypes = {
  item: PropTypes.shape({
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    cgpa: PropTypes.string.isRequired
  }).isRequired
}

export default EducationItem
