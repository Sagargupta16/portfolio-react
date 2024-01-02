// Components.test.js
import React from 'react'
import { render } from '@testing-library/react'
import Header from '../components/header/Header'
import Nav from '../components/nav/Nav'
import About from '../components/about/About'
import Education from '../components/education/Education'
import Experience from '../components/experience/Experience'
import Skill from '../components/skill/Skill'
import Services from '../components/services/Services'
import Testimonial from '../components/testimonials/Testimonial'
import Portfolio from '../components/portfolio/Portfolio'
import Contact from '../components/contact/Contact'
import Footer from '../components/footer/Footer'
import App from '../App'
import { MemoryRouter } from 'react-router-dom'

test('renders Header without crashing', () => {
  render(<Header />)
})

test('renders Nav without crashing', () => {
  render(
    <MemoryRouter>
      <Nav />
    </MemoryRouter>
  )
})

test('renders About without crashing', () => {
  render(
    <MemoryRouter>
      <About />
    </MemoryRouter>
  )
})

test('renders Education without crashing', () => {
  render(<Education />)
})

test('renders Experience without crashing', () => {
  render(<Experience />)
})

test('renders Skill without crashing', () => {
  render(<Skill />)
})

test('renders Services without crashing', () => {
  render(<Services />)
})

test('renders Portfolio without crashing', () => {
  render(<Portfolio />)
})

test('renders Contact without crashing', () => {
  render(<Contact />)
})

test('renders Footer without crashing', () => {
  render(<Footer />)
})

test('renders App without crashing', () => {
  render(<App />)
})

test('renders Testimonial without crashing', () => {
  render(<Testimonial />)
})
