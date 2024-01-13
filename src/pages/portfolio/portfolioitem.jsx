import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { CiCircleChevDown, CiCircleChevUp } from 'react-icons/ci'

const PortfolioItem = ({ data }) => {
  const [isExpanded, setExpanded] = useState(false)

  const toggleExpansion = () => {
    setExpanded(!isExpanded)
  }

  return (
    <article className="portfolio__item">
      <div className="portfolio__item-image">
        <img src={data.image} alt={data.title} />
      </div>

      <h3 className="portfolio__item-title">
        <div className="portfolio__item-title__text">{data.title}</div>
        <button className="portfolio__dropdown" onClick={toggleExpansion}>
          <span className="portfolio__dropdown__icon">{isExpanded ? <CiCircleChevUp /> : <CiCircleChevDown />}</span>
          <span className="portfolio__dropdown__text">{isExpanded ? 'Less' : 'More'}</span>
        </button>
      </h3>
      <div className={`portfolio__item__description ${isExpanded ? 'active' : ''}`}>
        <p>{data.description}</p>
      </div>
      <div className={`portfolio__item__tools ${isExpanded ? 'active' : ''}`}>
        <h4>Tools & Technologies</h4>
        <div className="portfolio__item__tools__list">
          {data.tools_tech.map(tool => (
            <div key={tool} className="portfolio__item__tool">
              {tool}
            </div>
          ))}
        </div>
      </div>
      <div className={`portfolio__item__features ${isExpanded ? 'active' : ''}`}>
        <h4>Features</h4>
        <div className="portfolio__item__features__list">
          {data.features.map(feature => (
            <div key={feature} className="portfolio__item__feature">
              {feature}
            </div>
          ))}
        </div>
      </div>
      <div className="portfolio__item-cta">
        <a href={data.github} className="btn" target="_blank" rel="noreferrer">
          Github
        </a>
        {data.live !== '#' && (
          <a href={data.live} className="btn btn-primary" target="_blank" rel="noreferrer">
            Live
          </a>
        )}
      </div>
    </article>
  )
}

PortfolioItem.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
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
