// Contact.test.js - Detailed Contact component tests
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Contact from '../pages/contact/Contact'
import * as emailjs from '@emailjs/browser'

// Mock emailjs
jest.mock('@emailjs/browser', () => ({
  sendForm: jest.fn(),
  init: jest.fn()
}))

// Helper function to render with router
const renderWithRouter = (component) => {
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

describe('Contact Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders contact form elements', () => {
    renderWithRouter(<Contact />)
    
    expect(screen.getByText(/Get In Touch/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Your Full Name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Your Email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Your Message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument()
  })

  test.skip('handles form submission successfully', async () => {
    const mockSendForm = emailjs.sendForm
    mockSendForm.mockResolvedValueOnce({ status: 200, text: 'OK' })

    renderWithRouter(<Contact />)
    const user = userEvent.setup()

    // Fill out the form with valid data that matches validation rules
    const nameInput = screen.getByPlaceholderText(/Your Full Name/i)
    const emailInput = screen.getByPlaceholderText(/Your Email/i)
    const messageInput = screen.getByPlaceholderText(/Your Message/i)

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@gmail.com')
    await user.type(messageInput, 'Hello there! This is a test message with more than 10 characters.')

    // Wait for form state to update and verify values are set
    await waitFor(() => {
      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@gmail.com')
      expect(messageInput).toHaveValue('Hello there! This is a test message with more than 10 characters.')
    })

    // Get the submit button and click it - this should now work with our HTMLFormElement.submit mock
    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    await user.click(submitButton)

    // Wait for the submission to complete
    await waitFor(() => {
      expect(mockSendForm).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })
    
    // TODO: Fix JSDOM HTMLFormElement.submit limitation for EmailJS integration
  })

  test.skip('handles form submission error', async () => {
    const mockSendForm = emailjs.sendForm
    mockSendForm.mockRejectedValueOnce(new Error('Network error'))

    renderWithRouter(<Contact />)
    const user = userEvent.setup()

    // Fill out the form with valid data
    const nameInput = screen.getByPlaceholderText(/Your Full Name/i)
    const emailInput = screen.getByPlaceholderText(/Your Email/i)
    const messageInput = screen.getByPlaceholderText(/Your Message/i)

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@gmail.com')
    await user.type(messageInput, 'Hello there! This is a test message with more than 10 characters.')

    // Wait for form state to update and verify values are set
    await waitFor(() => {
      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@gmail.com')
      expect(messageInput).toHaveValue('Hello there! This is a test message with more than 10 characters.')
    })

    // Get the submit button and click it - this should now work with our HTMLFormElement.submit mock
    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSendForm).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })
    
    // TODO: Fix JSDOM HTMLFormElement.submit limitation for EmailJS integration
  })

  test('validates required fields', async () => {
    renderWithRouter(<Contact />)
    const user = userEvent.setup()

    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    
    // Try to submit empty form
    await user.click(submitButton)
    
    // The HTML5 validation should prevent submission
    const nameInput = screen.getByPlaceholderText(/Your Full Name/i)
    expect(nameInput).toBeRequired()
    expect(nameInput.value).toBe('')
  })

  test('shows contact information', () => {
    renderWithRouter(<Contact />)
    
    // Check for contact cards
    expect(screen.getByText(/Email/i)).toBeInTheDocument()
    expect(screen.getByText(/WhatsApp/i)).toBeInTheDocument()
  })
})
