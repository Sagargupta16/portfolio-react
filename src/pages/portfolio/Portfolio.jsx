import React from 'react'
import './portfolio.css'
import PortFolioItem from './portfolioitem'
import { personalProjects, collabProjects } from './projectsArray'

const Portfolio = () => {
  const renderPortfolioItems = projects => {
    return projects.map(project => (
      <PortFolioItem key={project.id} data={project} />
    ))
  }

  return (
    <section id="portfolio">
      <h5>My Recent Works</h5>
      <h2>Portfolio</h2>
      <h3 className="portfolio__heading"> My Personal Projects</h3>
      <div className="container portfolio__container">
        {renderPortfolioItems(personalProjects)}
      </div>
      <h3 className="portfolio__heading">Collaborative Projects</h3>
      <div className="container portfolio__container">
        {renderPortfolioItems(collabProjects)}
      </div>
    </section>
  )
}

export default Portfolio
