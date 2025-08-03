import React from 'react'
import { motion } from 'framer-motion'
import './about.css'
import ME from '../../assets/images/me-about.jpg'
import { BsCodeSlash } from 'react-icons/bs'
import { MdDeveloperMode } from 'react-icons/md'
import { SiCodersrank } from 'react-icons/si'
import { Link } from 'react-router-dom'
import { getStatistics, getAbout } from '../../data/dataLoader'
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  staggerContainer,
  staggerItem,
  cardHover,
  iconBounce
} from '../../utils/animations'

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
    <motion.section id="about" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
      <motion.h5 variants={fadeInUp}>Get to Know</motion.h5>
      <motion.h2 variants={fadeInUp}>About Me</motion.h2>
      <div className="container about__container">
        <motion.div
          className="about__me"
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="about__me-image">
            <img src={ME} alt="about me" />
          </div>
        </motion.div>
        <motion.div
          className="about__content"
          variants={fadeInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            className="about__cards"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {cardData.map(card => (
              <motion.article className="about__card" key={card.id} variants={staggerItem} whileHover={cardHover.hover}>
                <motion.div variants={iconBounce} whileHover="hover">
                  {card.icon}
                </motion.div>
                <h5>{card.title}</h5>
                <small>{card.count}</small>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
        <motion.div
          className="about__text"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
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
        </motion.div>
      </div>
    </motion.section>
  )
}

export default About
