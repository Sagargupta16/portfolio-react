import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import { BsFillCalendarEventFill } from 'react-icons/bs'
import { IoLocationSharp } from 'react-icons/io5'
import { CiCircleChevDown, CiCircleChevUp } from 'react-icons/ci'
import { cardHover } from '../../utils/animations'

const CARD_TRANSITION = {
  duration: 0.6,
  ease: 'easeOut',
  type: 'spring',
  stiffness: 100
}

const ExperienceItem = ({ item }) => {
  const [show, setShow] = useState(false)

  const toggleDropdown = useCallback(() => setShow(prev => !prev), [])

  const isRemote = useMemo(() => item.location === 'Remote', [item.location])
  const hasDescription = useMemo(() => item.description && Object.keys(item.description).length > 0, [item.description])
  const hasSkills = useMemo(() => item.skills && item.skills.length > 0, [item.skills])

  return (
    <motion.article
      className="experience__item"
      variants={cardHover}
      whileHover="hover"
      initial={{ opacity: 0, x: -50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={CARD_TRANSITION}
      aria-label={`${item.title} at ${item.company}`}
    >
      <h3 className="experience__date">
        <span className="experience__date__icon" aria-label={`Duration: ${item.date}`}>
          <BsFillCalendarEventFill aria-hidden="true" />
          {item.date}
        </span>
        <motion.button
          className="experience__dropdown"
          onClick={toggleDropdown}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-expanded={show}
          aria-label={show ? 'Show less details' : 'Show more details'}
        >
          <span className="experience__dropdown__icon" aria-hidden="true">
            {show ? <CiCircleChevUp /> : <CiCircleChevDown />}
          </span>
          <span className="experience__dropdown__text">{show ? 'Less' : 'More'}</span>
        </motion.button>
      </h3>
      <h4 className="experience__title">
        {item.title},<span className="experience__position"> {item.position}</span>
      </h4>
      <h3 className="experience__company">
        <span>{item.company}</span>
        <span className="experience__location">
          {isRemote ? (
            <span className="experience__location__remote"> ({item.location})</span>
          ) : (
            <span className="experience__location__inperson">
              <IoLocationSharp aria-hidden="true" /> {item.location}
            </span>
          )}
        </span>
      </h3>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {hasDescription && (
              <div className="experience__item__description active">
                <h4>{item.project || 'Responsibilities & Contributions'}</h4>
                <ul>
                  {Object.values(item.description).map((desc, index) => (
                    <motion.li
                      key={`${desc.substring(0, 20)}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {desc}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
            {hasSkills && (
              <div className="experience__item__skills active">
                <h4>Skills I Learned & Used!</h4>
                <div className="experience__item__skills__list">
                  {item.skills.map((skill, index) => (
                    <motion.span
                      key={`${skill}-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

ExperienceItem.propTypes = {
  item: PropTypes.shape({
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    project: PropTypes.string, // Optional field for positions of responsibility
    description: PropTypes.objectOf(PropTypes.string).isRequired,
    skills: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
}

export default ExperienceItem
