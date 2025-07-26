import React from 'react'
import { motion } from 'framer-motion'
import './Header.css'
import CtaComponent from './CTA'
import ME from '../../../assets/images/me.png'
import HeaderSocials from './HeaderSocials'
import TwComponent from './TW'
import { getName, getRoles } from '../../../data/dataLoader'
import { fadeInUp, staggerContainer, staggerItem, scaleIn, floatingAnimation } from '../../../utils/animations'

const Header = () => {
  const name = getName()
  const roles = getRoles()

  return (
    <section className="header" id="header">
      <motion.div 
        className="container header__container"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h5 variants={staggerItem}>Hey Myself</motion.h5>
        <motion.h1 variants={staggerItem}>{name}</motion.h1>
        <motion.h5 className="text-light tw_comp" variants={staggerItem}>
          I'm a <TwComponent roles={roles} />
        </motion.h5>
        <motion.div variants={staggerItem}>
          <CtaComponent />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <HeaderSocials />
        </motion.div>
        <motion.div 
          className="me"
          variants={scaleIn}
          {...floatingAnimation}
        >
          <img src={ME} alt="me" />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Header
