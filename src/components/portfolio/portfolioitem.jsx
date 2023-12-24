import React, { useState } from "react";
import PropTypes from "prop-types";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";

const PortfolioItem = ({ data }) => {
  const [isExpanded, setExpanded] = useState(false);

  const toggleExpansion = () => {
    setExpanded(!isExpanded);
  };

  // Function to handle keyboard events for accessibility
  const handleKeyPress = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      toggleExpansion();
    }
  };

  return (
    <article className="portfolio__item">
      <div className="portfolio__item-image">
        <img src={data.image} alt={data.title} />
      </div>

      <h3 className="portfolio__item-title">
        <div className="portfolio__item-title__text">{data.title}</div>
        <div
          className="portfolio__dropdown"
          onClick={toggleExpansion}
          onKeyPress={handleKeyPress}
          role="button"
          tabIndex={0}
        >
          <span className="portfolio__dropdown__icon">
            {isExpanded ? <CiCircleChevUp /> : <CiCircleChevDown />}
          </span>
          <span className="portfolio__dropdown__text">
            {isExpanded ? "Less" : "More"}
          </span>
        </div>
      </h3>
      <div
        className={`portfolio__item__description ${isExpanded ? "active" : ""}`}
      >
        <p>{data.description}</p>
      </div>
      <div className={`portfolio__item__tools ${isExpanded ? "active" : ""}`}>
        <h4>Tools & Technologies</h4>
        <div className="portfolio__item__tools__list">
          {data.tools_tech.map((tool, index) => (
            <div key={`tool-${index}`} className="portfolio__item__tool">
              {tool}
            </div>
          ))}
        </div>
      </div>
      <div
        className={`portfolio__item__features ${isExpanded ? "active" : ""}`}
      >
        <h4>Features</h4>
        <div className="portfolio__item__features__list">
          {data.features.map((feature, index) => (
            <div key={`feature-${index}`} className="portfolio__item__feature">
              {feature}
            </div>
          ))}
        </div>
      </div>
      <div className="portfolio__item-cta">
        <a href={data.github} className="btn" target="_blank" rel="noreferrer">
          Github
        </a>
        {data.live !== "#" && (
          <a
            href={data.live}
            className="btn btn-primary"
            target="_blank"
            rel="noreferrer"
          >
            Live
          </a>
        )}
      </div>
    </article>
  );
};

PortfolioItem.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    tools_tech: PropTypes.arrayOf(PropTypes.string).isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    github: PropTypes.string.isRequired,
    live: PropTypes.string,
  }).isRequired,
};

export default PortfolioItem;
