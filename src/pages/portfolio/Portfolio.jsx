import { motion } from 'framer-motion'
import './portfolio.css'
import PortFolioItem from './portfolioitem'
import personalProjects, { collabProjects } from './ProjectsArray'
import { fadeInUp, staggerContainer, staggerItem } from '../../utils/animations'

const Portfolio = () => {
  const renderPortfolioItems = projects => {
    return projects.map((project, index) => (
      <motion.div
        key={project.id}
        variants={staggerItem}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
      >
        <PortFolioItem data={project} />
      </motion.div>
    ))
  }

  return (
    <motion.section id="portfolio" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
      <motion.h5 variants={fadeInUp}>My Recent Works</motion.h5>
      <motion.h2 variants={fadeInUp}>Portfolio</motion.h2>
      <motion.div
        className="container portfolio__container"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h3 className="portfolio__heading" variants={fadeInUp}>
          My Personal Projects
        </motion.h3>
        <motion.div
          className="portfolio__section"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {renderPortfolioItems(personalProjects)}
        </motion.div>
      </motion.div>
      {collabProjects && collabProjects.length > 0 && (
        <motion.div
          className="container portfolio__container"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h3 className="portfolio__heading" variants={fadeInUp}>
            Collaborative Projects
          </motion.h3>
          <motion.div
            className="portfolio__section"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {renderPortfolioItems(collabProjects)}
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  )
}

export default Portfolio
