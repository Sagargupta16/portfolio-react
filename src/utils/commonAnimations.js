// Common animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 }
}

export const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 }
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export const hoverScale = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

export const cardHover = {
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    transition: { duration: 0.3 }
  }
}

// Common transition configs
export const transitions = {
  spring: { type: 'spring', stiffness: 100 },
  ease: { duration: 0.6, ease: 'easeOut' }
}
