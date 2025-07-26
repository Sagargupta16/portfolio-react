// Theme.test.js - Theme component tests
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Theme from '../components/layout/Theme'

describe('Theme Component', () => {
  test('renders theme toggle button', () => {
    render(<Theme />)
    const themeButton = screen.getByRole('button')
    expect(themeButton).toBeInTheDocument()
  })
})
