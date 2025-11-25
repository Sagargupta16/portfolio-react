import { useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import PortFolioItem from './portfolioitem'
import personalProjects, { collabProjects } from './ProjectsArray'
import { fadeInUp, staggerContainer, staggerItem } from '@utils/animations'
import styles from './portfolio.module.css'

const Portfolio = () => {
  const renderPortfolioItems = useCallback(
    projects =>
      projects.map((project, index) => (
        <motion.div key={project.id} variants={staggerItem} custom={index} transition={{ delay: index * 0.03 }}>
          <PortFolioItem data={project} />
        </motion.div>
      )),
    []
  )

  const hasCollabProjects = useMemo(() => collabProjects?.length > 0, [])

  return (
    <motion.section id="portfolio" initial="hidden" animate="visible">
      <motion.h5 variants={fadeInUp}>My Recent Works</motion.h5>
      <motion.h2 variants={fadeInUp}>Portfolio</motion.h2>
      <motion.div className={`container ${styles.portfolio__container}`} variants={staggerContainer}>
        <motion.h3 className={styles.portfolio__heading} variants={fadeInUp}>
          My Personal Projects
        </motion.h3>
        <motion.div className={styles.portfolio__section} variants={staggerContainer}>
          {renderPortfolioItems(personalProjects)}
        </motion.div>
      </motion.div>
      {hasCollabProjects && (
        <motion.div className={`container ${styles.portfolio__container}`} variants={staggerContainer}>
          <motion.h3 className={styles.portfolio__heading} variants={fadeInUp}>
            Collaborative Projects
          </motion.h3>
          <motion.div className={styles.portfolio__section} variants={staggerContainer}>
            {renderPortfolioItems(collabProjects)}
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  )
}

export default Portfolio
