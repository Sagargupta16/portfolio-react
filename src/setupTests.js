// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock HTMLFormElement.prototype.submit to avoid JSDOM errors
Object.defineProperty(HTMLFormElement.prototype, 'submit', {
  value: jest.fn(),
  writable: true,
  configurable: true
})

// Mock console errors for known JSDOM limitations
const originalConsoleError = console.error
// eslint-disable-next-line no-console
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
     args[0].includes('Error: Not implemented'))
  ) {
    return
  }
  originalConsoleError(...args)
}

// Suppress React Router warnings in tests
const originalConsoleWarn = console.warn
beforeEach(() => {
  // eslint-disable-next-line no-console
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Router basename') || 
       args[0].includes('does not start with the basename'))
    ) {
      return
    }
    originalConsoleWarn(...args)
  }
})

afterEach(() => {
  // eslint-disable-next-line no-console
  console.warn = originalConsoleWarn
})

// Mock Framer Motion entirely for testing to avoid DOM API issues
jest.mock('framer-motion', () => {
  const React = require('react')

  // Props that should be filtered out and not passed to DOM elements
  const motionProps = new Set([
    'animate',
    'initial',
    'exit',
    'variants',
    'transition',
    'whileHover',
    'whileTap',
    'whileFocus',
    'whileInView',
    'whileDrag',
    'drag',
    'dragConstraints',
    'dragElastic',
    'layout',
    'layoutId',
    'onAnimationStart',
    'onAnimationComplete',
    'viewport'
  ])

  return {
    motion: new Proxy(
      {},
      {
        get(_, prop) {
          return React.forwardRef((props, ref) => {
            const { children, ...otherProps } = props
            // PropTypes validation for children
            if (typeof children === 'undefined') {
              throw new Error('children is required in mock component')
            }
            // Filter out motion-specific props
            const filteredProps = Object.keys(otherProps).reduce((acc, key) => {
              if (!motionProps.has(key)) {
                acc[key] = otherProps[key]
              }
              return acc
            }, {})
            return React.createElement(prop, { ...filteredProps, ref }, children)
          })
        }
      }
    ),
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({ start: jest.fn(), stop: jest.fn() }),
    useMotionValue: initial => ({ get: () => initial, set: jest.fn() }),
    useViewportScroll: () => ({ scrollY: { get: () => 0 } }),
    useInView: () => [React.useRef(), true],
    useTransform: (value, input, output) => ({ get: () => output[0] })
  }
})

// Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  disconnect() {}

  observe() {}

  unobserve() {}
}

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  disconnect() {}

  observe() {}

  unobserve() {}
}

// Mock document methods that might be missing
const originalDocument = global.document
const mockMediaQuery = {
  matches: false,
  media: '',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatchEvent: jest.fn()
}

global.document = {
  ...originalDocument,
  getElementsByTagName: jest.fn(() => []),
  head: {
    ...originalDocument?.head,
    appendChild: jest.fn()
  },
  body: {
    ...originalDocument?.body,
    appendChild: jest.fn()
  },
  createElement: jest.fn(() => ({
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    appendChild: jest.fn(),
    style: {}
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  // Mock media query for Framer Motion
  media: mockMediaQuery
}

// Mock window methods - more complete for Framer Motion
global.window = {
  ...global.window,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  getComputedStyle: jest.fn(() => ({
    getPropertyValue: jest.fn(() => '')
  })),
  requestAnimationFrame: jest.fn(cb => cb()),
  cancelAnimationFrame: jest.fn(),
  // Add media property for Framer Motion
  media: mockMediaQuery,
  // Mock for Framer Motion's preferred reduced motion
  matchMedia: jest.fn().mockImplementation(query => mockMediaQuery),
  // Additional properties that Framer Motion might access
  devicePixelRatio: 1,
  innerWidth: 1024,
  innerHeight: 768,
  screen: {
    width: 1024,
    height: 768
  },
  location: {
    ...global.window?.location,
    href: 'http://localhost:3000'
  }
}

// Mock HTMLElement methods for Framer Motion
if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.addEventListener = jest.fn()
  HTMLElement.prototype.removeEventListener = jest.fn()
  HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0
  }))
}

// Mock Element methods
if (typeof Element !== 'undefined') {
  Element.prototype.addEventListener = jest.fn()
  Element.prototype.removeEventListener = jest.fn()
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0
  }))
}

// Mock HTMLFormElement.prototype.submit for Contact form tests
// But don't interfere with React's onSubmit handler
if (typeof HTMLFormElement !== 'undefined') {
  HTMLFormElement.prototype.submit = function () {
    // Create a proper submit event that will trigger React's onSubmit handler
    const event = new Event('submit', { bubbles: true, cancelable: true })

    // Add preventDefault method like React SyntheticEvent
    event.preventDefault = jest.fn()

    // Dispatch the event which should trigger React's event listeners
    this.dispatchEvent(event)
  }
}
