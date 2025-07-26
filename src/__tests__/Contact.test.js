// Contact.test.js - Detailed Contact component tests
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import Contact from '../pages/contact/Contact'
import * as emailjs from '@emailjs/browser'

// Mock emailjs
jest.mock('@emailjs/browser', () => ({
  sendForm: jest.fn(),
  init: jest.fn()
}))

describe('Contact Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders contact form elements', () => {
    render(<Contact />)
    
    expect(screen.getByText(/Get In Touch/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Your Full Name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Your Email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Your Message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument()
  })

  test('handles form submission successfully', async () => {
    const mockSendForm = emailjs.sendForm
    mockSendForm.mockResolvedValueOnce({ status: 200, text: 'OK' })

    const user = userEvent.setup()
    render(<Contact />)

    // Fill out the form with valid data that matches validation rules
    await user.type(screen.getByPlaceholderText(/Your Full Name/i), 'John Doe')
    await user.type(screen.getByPlaceholderText(/Your Email/i), 'john@gmail.com')
    await user.type(screen.getByPlaceholderText(/Your Message/i), 'Hello there! This is a test message with more than 10 characters.')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    await user.click(submitButton)

    // Wait for the submission to complete
    await waitFor(() => {
      expect(mockSendForm).toHaveBeenCalledTimes(1)
    })
  })

  test('handles form submission error', async () => {
    const mockSendForm = emailjs.sendForm
    mockSendForm.mockRejectedValueOnce(new Error('Network error'))

    const user = userEvent.setup()
    render(<Contact />)

    // Fill out the form with valid data
    await user.type(screen.getByPlaceholderText(/Your Full Name/i), 'John Doe')
    await user.type(screen.getByPlaceholderText(/Your Email/i), 'john@gmail.com')
    await user.type(screen.getByPlaceholderText(/Your Message/i), 'Hello there! This is a test message with more than 10 characters.')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSendForm).toHaveBeenCalledTimes(1)
    })
  })

  test('validates required fields', async () => {
    const user = userEvent.setup()
    render(<Contact />)

    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    
    // Try to submit empty form
    await user.click(submitButton)
    
    // The HTML5 validation should prevent submission
    const nameInput = screen.getByPlaceholderText(/Your Full Name/i)
    expect(nameInput).toBeRequired()
    expect(nameInput.value).toBe('')
  })

  test('shows contact information', () => {
    render(<Contact />)
    
    // Check for contact cards
    expect(screen.getByText(/Email/i)).toBeInTheDocument()
    expect(screen.getByText(/WhatsApp/i)).toBeInTheDocument()
  })
})
