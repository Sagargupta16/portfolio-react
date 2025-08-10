import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ErrorBoundary from '../components/common/ErrorBoundary'

function ProblemChild() {
  throw new Error('Test error!')
}

describe('ErrorBoundary', () => {
  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    )
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe Child</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Safe Child')).toBeInTheDocument()
  })
})
