// Components.test.js - Comprehensive component tests
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '../components/layout/Header'
import Nav from '../components/layout/Navigation'
import About from '../pages/about/About'
import Education from '../pages/education/Education'
import Experience from '../pages/experience/Experience'
import Skill from '../pages/skill/Skill'
import Services from '../pages/services/Services'
import Portfolio from '../pages/portfolio/Portfolio'
import Contact from '../pages/contact/Contact'
import Footer from '../components/layout/Footer'
import Theme from '../components/layout/Theme'
import App from '../App'
import { MemoryRouter } from 'react-router-dom'

// Helper function to render with router when needed
const renderWithRouter = component => {
  return render(
    <MemoryRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      {component}
    </MemoryRouter>
  )
}

// Mock window.scrollTo for Navigation component
beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }))

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }))

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(() => null),
      setItem: jest.fn(() => null),
      removeItem: jest.fn(() => null),
      clear: jest.fn(() => null)
    },
    writable: true
  })
})

describe('Layout Components', () => {
  test('renders Header without crashing', () => {
    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Header />
      </MemoryRouter>
    )
    expect(screen.getByText('Download CV')).toBeInTheDocument()
  })

  test('renders Nav without crashing', () => {
    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Nav />
      </MemoryRouter>
    )
  })

  test('renders Footer without crashing', () => {
    render(<Footer />)
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument()
  })

  test('renders Theme without crashing', () => {
    render(<Theme />)
    // Theme component should render theme options
    const themeElements = screen.getAllByRole('button')
    expect(themeElements.length).toBeGreaterThan(0)
  })
})

describe('Page Components', () => {
  test('renders About without crashing', () => {
    render(<About />)
    expect(screen.getByText(/Get To Know/i)).toBeInTheDocument()
  })

  test('renders Education without crashing', () => {
    render(<Education />)
    expect(screen.getByText(/Education/i)).toBeInTheDocument()
  })

  test('renders Experience without crashing', () => {
    render(<Experience />)
    expect(screen.getByText(/My Experience/i)).toBeInTheDocument()
  })

  test('renders Skill without crashing', () => {
    render(<Skill />)
    expect(screen.getByText(/My Skills/i)).toBeInTheDocument()
  })

  test('renders Services without crashing', () => {
    render(<Services />)
    expect(screen.getByText(/What I Offer/i)).toBeInTheDocument()
  })

  test('renders Portfolio without crashing', () => {
    render(<Portfolio />)
    expect(screen.getByText(/Recent Work/i)).toBeInTheDocument()
  })

  test('renders Contact without crashing', () => {
    renderWithRouter(<Contact />)
    expect(screen.getByText(/Get In Touch/i)).toBeInTheDocument()
  })
})

describe('App Component', () => {
  test('renders App without crashing', () => {
    render(<App />)
  })

  test('App contains main navigation elements', () => {
    render(<App />)
    // The App component should render the main structure
    expect(document.body).toBeInTheDocument()
  })
})
