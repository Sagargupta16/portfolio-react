import { useMemo } from 'react'
import { motion } from 'framer-motion'
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
import './about.css'
import ME from '../../assets/images/me-about.jpg'

const About = () => {
  const statistics = getStatistics()
  const aboutInfo = getAbout()

  const cardData = useMemo(
    () => [
      {
        id: 1,
        icon: <BsCodeSlash className="about__icon" aria-hidden="true" />,
        title: 'Coding',
        count: statistics.coding_questions,
        label: 'Coding questions solved'
      },
      {
        id: 2,
        icon: <MdDeveloperMode className="about__icon" aria-hidden="true" />,
        title: 'Projects',
        count: statistics.projects,
        label: 'Projects completed'
      },
      {
        id: 3,
        icon: <SiCodersrank className="about__icon" aria-hidden="true" />,
        title: 'CP',
        count: statistics.contests,
        label: 'Competitive programming contests'
      }
    ],
    [statistics]
  )

  return (
    <motion.section id="about" initial="hidden" animate="visible">
      <motion.h5 variants={fadeInUp}>Get to Know</motion.h5>
      <motion.h2 variants={fadeInUp}>About Me</motion.h2>
      <div className="container about__container">
        <motion.div className="about__me" variants={fadeInLeft}>
          <div className="about__me-image">
            <img src={ME} alt="Sagar Gupta - Professional portrait" loading="lazy" width="400" height="400" />
          </div>
        </motion.div>
        <motion.div className="about__content" variants={fadeInRight}>
          <motion.div className="about__cards" variants={staggerContainer}>
            {cardData.map(card => (
              <motion.article
                className="about__card"
                key={card.id}
                variants={staggerItem}
                whileHover={cardHover.hover}
                aria-label={card.label}
              >
                <motion.div variants={iconBounce} whileHover="hover">
                  {card.icon}
                </motion.div>
                <h5>{card.title}</h5>
                <small>{card.count}</small>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
        <motion.div className="about__text" variants={fadeInUp}>
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
          <Link to="/contact" className="btn btn-primary">
            Let&apos;s Talk
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default About
