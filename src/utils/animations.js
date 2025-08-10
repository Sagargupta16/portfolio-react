// Common transition configurations
const transitions = {
  default: { duration: 0.6, ease: 'easeOut' },
  spring: { type: 'spring', stiffness: 100, damping: 10 },
  quick: { duration: 0.3, ease: 'easeInOut' }
}

// Base animation variants
const fadeBase = (direction = null) => ({
  hidden: {
    opacity: 0,
    ...(direction && { [direction]: 60 })
  },
  visible: {
    opacity: 1,
    ...(direction && { [direction]: 0 }),
    transition: transitions.default
  }
})

// Fade animations with different directions
export const fadeInUp = fadeBase('y')
export const fadeInDown = fadeBase('-y')
export const fadeInLeft = fadeBase('x')
export const fadeInRight = fadeBase('-x')

// Scale animation
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.default
  }
}

// Container for staggered animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

// Stagger item animation
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.quick
  }
}

// Hover animations
export const hover = {
  scale: {
    scale: 1.05,
    transition: transitions.quick
  },
  lift: {
    y: -5,
    transition: transitions.quick
  }
}

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: transitions.default
}

export const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

export const rotateIn = {
  hidden: {
    opacity: 0,
    rotate: -180,
    scale: 0.5
  },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut'
    }
  }
}

export const slideInFromBottom = {
  hidden: {
    opacity: 0,
    y: 100
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut'
    }
  }
}

export const hoverScale = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  tap: {
    scale: 0.95
  }
}

export const cardHover = {
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

export const iconBounce = {
  hover: {
    scale: 1.2,
    rotate: [0, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
}
