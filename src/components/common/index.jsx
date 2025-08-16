import React from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { fadeInUp, hover } from '../../utils/animations'

// Button component
export const Button = ({ children, variant = 'default', onClick, className = '', ...props }) => (
  <motion.button
    className={`btn btn--${variant} ${className}`}
    onClick={onClick}
    whileHover={hover.scale}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    {children}
  </motion.button>
)

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'outline', 'text']),
  onClick: PropTypes.func,
  className: PropTypes.string
}

// Card component
export const Card = ({ children, className = '', animate = true, ...props }) => (
  <motion.div
    className={`card ${className}`}
    variants={animate ? fadeInUp : undefined}
    whileHover={hover.lift}
    {...props}
  >
    {children}
  </motion.div>
)

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  animate: PropTypes.bool
}

// Section component
export const Section = ({ children, title, className = '', ...props }) => (
  <motion.section
    className={`section ${className}`}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    {...props}
  >
    {title && (
      <motion.h2 className="section__title" variants={fadeInUp}>
        {title}
      </motion.h2>
    )}
    {children}
  </motion.section>
)

Section.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string
}

// Container component
export const Container = ({ children, className = '', ...props }) => (
  <div className={`container ${className}`} {...props}>
    {children}
  </div>
)

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

// Icon component
export const Icon = ({ icon: IconComponent, className = '', ...props }) => (
  <motion.div className={`icon ${className}`} whileHover={hover.scale} {...props}>
    <IconComponent />
  </motion.div>
)

Icon.propTypes = {
  icon: PropTypes.elementType.isRequired,
  className: PropTypes.string
}
