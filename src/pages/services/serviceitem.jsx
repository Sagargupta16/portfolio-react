import React from 'react'
import { motion } from 'framer-motion'
import { GiCheckMark } from 'react-icons/gi'
import { cardHover, staggerContainer, staggerItem, iconBounce } from '../../utils/animations'

const serviceitem = props => {
  const { title, list } = props.item
  return (
    <motion.article
      className="service"
      variants={cardHover}
      whileHover="hover"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="service__head">
        <h3>{title}</h3>
      </div>
      <motion.ul
        className="service__list"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {list.map((item, index) => {
          return (
            <motion.li key={item} variants={staggerItem} transition={{ delay: index * 0.1 }}>
              <motion.div variants={iconBounce} whileHover="hover">
                <GiCheckMark className="service__list-icon" />
              </motion.div>
              <p>{item}</p>
            </motion.li>
          )
        })}
      </motion.ul>
    </motion.article>
  )
}

export default serviceitem
