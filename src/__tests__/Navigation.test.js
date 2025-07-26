// Navigation.test.js - Navigation component tests
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import Nav from '../components/layout/Navigation'

// Mock window.scrollTo
beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true
  })
})

describe('Navigation Component', () => {
  test('renders navigation component', () => {
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
    const navElement = screen.getByRole('navigation')
    expect(navElement).toBeInTheDocument()
  })
})
