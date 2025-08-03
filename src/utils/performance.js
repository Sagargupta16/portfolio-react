import { memo } from 'react'

// Performance optimization utility functions
export const withMemo = (Component, propsAreEqual) => {
  return memo(Component, propsAreEqual)
}

// Debounce function for search and form inputs
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Lazy loading utility for images
export const lazyLoadImage = (src, placeholder = '') => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(src)
    img.onerror = () => resolve(placeholder)
    img.src = src
  })
}

export default {
  withMemo,
  debounce,
  throttle,
  lazyLoadImage
}
