import React, { useState } from "react";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";

const PortfolioItem = (props) => {
  const [show, setShow] = useState(false);
  const { data } = props;
  const dropdown = () => {
    setShow(!show);
  };
  return (
    <article key={data.id} className="portfolio__item">
      <div className="portfolio__item-image">
        <img src={data.image} alt={data.title} />
      </div>

      <h3 className="portfolio__item-title">
        <div className="portfolio__item-title__text">{data.title}</div>
        {show ? (
          <div className="portfolio__dropdown" onClick={dropdown}>
            <span className="portfolio__dropdown__icon">
              <CiCircleChevUp />
            </span>
            <span className="portfolio__dropdown__text">Less</span>
          </div>
        ) : (
          <div className="portfolio__dropdown" onClick={dropdown}>
            <span className="portfolio__dropdown__icon">
              <CiCircleChevDown />
            </span>
            <span className="portfolio__dropdown__text">More</span>
          </div>
        )}
      </h3>
      <div className={`portfolio__item__description ${show ? "active" : ""}`}>
        <p>{data.description}</p>
      </div>
      <div className={`portfolio__item__tools ${show ? "active" : ""}`}>
        <h4>Tools & Technologies</h4>
        <div className="portfolio__item__tools__list">
          {data.tools_tech.map((tool) => {
            return (
              <div key={tool} className="portfolio__item__tool">
                {tool}
              </div>
            );
          })}
        </div>
      </div>
      <div className={`portfolio__item__features ${show ? "active" : ""}`}>
        <h4>Features</h4>
        <div className="portfolio__item__features__list">
          {data.features.map((feature) => {
            return (
              <div key={feature} className="portfolio__item__feature">
                {feature}
              </div>
            );
          })}
        </div>
      </div>
      <div className="portfolio__item-cta">
        <a href={data.github} className="btn" target="_blank" rel="noreferrer">
          Github
        </a>
        {data.live !== "#" ? (
          <a
            href={data.live}
            className="btn btn-primary"
            target="_blank"
            rel="noreferrer"
          >
            Live
          </a>
        ) : (
          <></>
        )}
      </div>
    </article>
  );
};

export default PortfolioItem;
