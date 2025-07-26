import React from 'react'
import './About.css'
import ME from '../../assets/images/me-about.jpg'
import { BsCodeSlash } from 'react-icons/bs'
import { MdDeveloperMode } from 'react-icons/md'
import { SiCodersrank } from 'react-icons/si'
import { Link } from 'react-router-dom'
import { getStatistics, getAbout } from '../../data/dataLoader'

const About = () => {
  const statistics = getStatistics()
  const aboutInfo = getAbout()

  const cardData = [
    {
      id: 1,
      icon: <BsCodeSlash className="about__icon" />,
      title: 'Coding',
      count: statistics.coding_questions
    },
    {
      id: 2,
      icon: <MdDeveloperMode className="about__icon" />,
      title: 'Projects',
      count: statistics.projects
    },
    {
      id: 3,
      icon: <SiCodersrank className="about__icon" />,
      title: 'CP',
      count: statistics.contests
    }
  ]

  return (
    <section id="about">
      <h5>Get to Know</h5>
      <h2>About Me</h2>
      <div className="container about__container">
        <div className="about__me">
          <div className="about__me-image">
            <img src={ME} alt="about me" />
          </div>
        </div>
        <div className="about__content">
          <div className="about__cards">
            {cardData.map(card => (
              <article className="about__card" key={card.id}>
                {card.icon}
                <h5>{card.title}</h5>
                <small>{card.count}</small>
              </article>
            ))}
          </div>
        </div>
        <div className="about__text">
          <p>
            {aboutInfo.greeting}
            <br />
            {aboutInfo.education}
            <br />
            {aboutInfo.profession}
            <br />
            {aboutInfo.current_role}
            <br />
            {aboutInfo.passion}
          </p>
          {window.screen.width > 600 ? (
            <Link to="/contact" className="btn btn-primary">
              Let's Talk
            </Link>
          ) : (
            <a href="#contact" className="btn btn-primary">
              Let's Talk
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

export default About

