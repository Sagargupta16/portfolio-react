import React from 'react'
import './about.css'
import ME from '../../assets/images/me-about.jpg'
import { BsCodeSlash } from 'react-icons/bs'
import { MdDeveloperMode } from 'react-icons/md'
import { SiCodersrank } from 'react-icons/si'
import { Link } from 'react-router-dom'

const About = () => {
  const cardData = [
    {
      id: 1,
      icon: <BsCodeSlash className="about__icon" />,
      title: 'Coding',
      count: '1100+ Questions'
    },
    {
      id: 2,
      icon: <MdDeveloperMode className="about__icon" />,
      title: 'Projects',
      count: '20+ Projects'
    },
    {
      id: 3,
      icon: <SiCodersrank className="about__icon" />,
      title: 'CP',
      count: '100+ Contests'
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
            👋 Hi, my name is Sagar Gupta, from Shivpuri, MP, India.
            <br />
            I'm a MCA Graduate 🎓 from NIT Warangal with experience at Amazon Web Services.
            <br />
            I'm a DevOps & Cloud Engineer, Full-Stack Developer who loves to write clean and efficient code.
            <br />
            Currently working at AWS Professional Services, specializing in Infrastructure Automation and DevOps solutions.
            <br />
            Apart from web development, I love Problem Solving using Data Structures and Algorithms, and have solved 1100+ problems on various platforms.
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
