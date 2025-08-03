import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import { CiCircleChevDown, CiCircleChevUp } from 'react-icons/ci'
import { cardHover, hoverScale } from '../../utils/animations'

const PortfolioItem = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.article
      className="portfolio__item"
      variants={cardHover}
      whileHover="hover"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="portfolio__item-image">
        <img src={data.image} alt={data.title} />
      </div>

      <h3 className="portfolio__item-title">
        <div className="portfolio__item-title__text">{data.title}</div>
        <motion.button
          className="portfolio__dropdown"
          onClick={toggleExpansion}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="portfolio__dropdown__icon">{isExpanded ? <CiCircleChevUp /> : <CiCircleChevDown />}</span>
          <span className="portfolio__dropdown__text">{isExpanded ? 'Less' : 'More'}</span>
        </motion.button>
      </h3>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="portfolio__item__description active">
              <p>{data.description}</p>
            </div>
            <div className="portfolio__item__tools active">
              <h4>Tools & Technologies</h4>
              <div className="portfolio__item__tools__list">
                {data.tools_tech.map((tool, index) => (
                  <motion.div
                    key={tool}
                    className="portfolio__item__tool"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {tool}
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="portfolio__item__features active">
              <h4>Features</h4>
              <div className="portfolio__item__features__list">
                {data.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="portfolio__item__feature"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {feature}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="portfolio__item-cta">
        <motion.a
          href={data.github}
          className="btn"
          target="_blank"
          rel="noreferrer"
          variants={hoverScale}
          whileHover="hover"
          whileTap="tap"
        >
          Github
        </motion.a>
        {data.live !== '#' && (
          <motion.a
            href={data.live}
            className="btn btn-primary"
            target="_blank"
            rel="noreferrer"
            variants={hoverScale}
            whileHover="hover"
            whileTap="tap"
          >
            Live
          </motion.a>
        )}
      </div>
    </motion.article>
  )
}

PortfolioItem.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    tools_tech: PropTypes.arrayOf(PropTypes.string).isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    github: PropTypes.string.isRequired,
    live: PropTypes.string
  }).isRequired
}

export default PortfolioItem
