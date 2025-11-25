import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { GiCheckMark } from 'react-icons/gi'
import { cardHover, staggerContainer, staggerItem, iconBounce } from '@utils/animations'
import styles from './services.module.css'

const SINGLE_VIEWPORT = { once: true }

const ServiceItem = props => {
  const { title, list } = props.item

  const hasItems = useMemo(() => list && list.length > 0, [list])

  return (
    <motion.article
      className={styles.service}
      variants={cardHover}
      whileHover="hover"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      role="article"
      aria-label={`${title} service`}
    >
      <div className={styles.service__head}>
        <h3>{title}</h3>
      </div>
      {hasItems && (
        <motion.ul
          className={styles.service__list}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={SINGLE_VIEWPORT}
        >
          {list.map((item, index) => {
            return (
              <motion.li key={`${item}-${index}`} variants={staggerItem} transition={{ delay: index * 0.1 }}>
                <motion.div variants={iconBounce} whileHover="hover" aria-hidden="true">
                  <GiCheckMark className={styles['service__list-icon']} />
                </motion.div>
                <p>{item}</p>
              </motion.li>
            )
          })}
        </motion.ul>
      )}
    </motion.article>
  )
}

export default ServiceItem
